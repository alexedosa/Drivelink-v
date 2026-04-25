import requests
import os
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.db import transaction as db_transaction
from .models import Transaction
from apps.purchases.models import Purchase
from apps.rentals.models import Rental
from apps.core.constants import PaymentStatus
import logging

logger = logging.getLogger(__name__)

PAYSTACK_BASE_URL = 'https://api.paystack.co'
PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY', '')
PAYSTACK_PUBLIC_KEY = os.getenv('PAYSTACK_PUBLIC_KEY', '')


class PaystackService:
    """Service class for Paystack API interactions"""
    
    def __init__(self):
        self.base_url = PAYSTACK_BASE_URL
        self.secret_key = PAYSTACK_SECRET_KEY
        self.public_key = PAYSTACK_PUBLIC_KEY
        self.headers = {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }
    
    def _check_keys(self):
        """Verify that API keys are configured"""
        if not self.secret_key or not self.public_key:
            raise ValueError(
                "Paystack API keys not configured. Please set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in environment variables."
            )
    
    def initialize_transaction(self, email, amount, metadata=None):
        """
        Initialize a payment transaction with Paystack.
        
        Args:
            email (str): Customer email
            amount (Decimal): Amount in Naira (whole number, not kobo)
            metadata (dict): Additional metadata to attach to transaction
            
        Returns:
            dict: Response containing authorization_url and access_code
        """
        self._check_keys()
        
        try:
            # Convert amount to kobo (Paystack uses kobo as base unit)
            amount_in_kobo = int(amount * 100)
            
            payload = {
                'email': email,
                'amount': amount_in_kobo,
                'metadata': metadata or {}
            }
            
            response = requests.post(
                f'{self.base_url}/transaction/initialize',
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Paystack initialization failed: {response.text}")
                raise Exception(f"Paystack API error: {response.status_code}")
            
            data = response.json()
            
            if not data.get('status'):
                logger.error(f"Paystack returned status=false: {data}")
                raise Exception(f"Paystack error: {data.get('message', 'Unknown error')}")
            
            return {
                'status': True,
                'authorization_url': data['data']['authorization_url'],
                'access_code': data['data']['access_code'],
                'reference': data['data']['reference']
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack request error: {str(e)}")
            raise Exception(f"Network error connecting to Paystack: {str(e)}")
    
    def verify_transaction(self, reference):
        """
        Verify a payment transaction with Paystack.
        
        Args:
            reference (str): Paystack transaction reference
            
        Returns:
            dict: Transaction verification details
        """
        self._check_keys()
        
        try:
            response = requests.get(
                f'{self.base_url}/transaction/verify/{reference}',
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Paystack verification failed: {response.text}")
                raise Exception(f"Paystack API error: {response.status_code}")
            
            data = response.json()
            
            if not data.get('status'):
                logger.warning(f"Paystack verify returned status=false for ref {reference}")
                raise Exception(f"Paystack error: {data.get('message', 'Unknown error')}")
            
            return {
                'status': True,
                'data': data['data']
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack request error: {str(e)}")
            raise Exception(f"Network error connecting to Paystack: {str(e)}")
    
    def is_payment_successful(self, verification_response):
        """
        Check if the payment was successful based on verification response.
        
        Args:
            verification_response (dict): Response from verify_transaction
            
        Returns:
            bool: True if payment is successful
        """
        data = verification_response.get('data', {})
        return data.get('status') == 'success'


def create_transaction(user, amount, transaction_type, purchase_id=None, rental_id=None, metadata=None):
    """
    Create a transaction record with Paystack API integration.
    
    Args:
        user (User): The user making the payment
        amount (Decimal): Amount to be paid
        transaction_type (str): 'purchase' or 'rental'
        purchase_id (int): Purchase ID if applicable
        rental_id (int): Rental ID if applicable
        metadata (dict): Additional metadata
        
    Returns:
        tuple: (transaction, paystack_response) or (transaction, error_dict)
    """
    try:
        paystack = PaystackService()
        
        # Prepare metadata
        transaction_metadata = {
            'transaction_type': transaction_type,
            'purchase_id': purchase_id,
            'rental_id': rental_id,
            **(metadata or {})
        }
        
        # Initialize with Paystack
        paystack_response = paystack.initialize_transaction(
            email=user.email,
            amount=amount,
            metadata=transaction_metadata
        )
        
        # Create transaction record
        transaction = Transaction.objects.create(
            user=user,
            amount=amount,
            status=PaymentStatus.PENDING,
            transaction_type=transaction_type,
            purchase_id=purchase_id,
            rental_id=rental_id,
            reference=paystack_response['reference'],
            paystack_access_code=paystack_response['access_code'],
            paystack_authorization_url=paystack_response['authorization_url'],
            metadata=transaction_metadata
        )
        
        return transaction, paystack_response
        
    except Exception as e:
        logger.error(f"Failed to create transaction: {str(e)}")
        return None, {'error': str(e)}


def verify_and_update_transaction(reference, purchase_or_rental_model=None):
    """
    Verify a transaction with Paystack and update the transaction record and related model.
    
    Args:
        reference (str): Paystack transaction reference
        purchase_or_rental_model: The Purchase or Rental model instance to update (optional)
        
    Returns:
        tuple: (success: bool, transaction: Transaction or None, message: str)
    """
    # 1. Fast check without lock
    try:
        tx = Transaction.objects.get(reference=reference)
        if tx.status == PaymentStatus.SUCCESS:
            return True, tx, "Payment already verified"
    except Transaction.DoesNotExist:
        logger.error(f"Transaction not found: {reference}")
        return False, None, "Transaction not found"
        
    # 2. External API call (no database locks held)
    try:
        paystack = PaystackService()
        verification = paystack.verify_transaction(reference)
    except Exception as e:
        logger.error(f"Error verifying transaction {reference}: {str(e)}")
        return False, None, f"Verification error: {str(e)}"
        
    # 3. Enter atomic block to process the payment atomically
    try:
        with db_transaction.atomic():
            # Re-fetch with row lock to prevent concurrent webhook runs
            transaction = Transaction.objects.select_for_update().get(reference=reference)
            
            # Idempotency check again after lock acquisition
            if transaction.status == PaymentStatus.SUCCESS:
                return True, transaction, "Payment already verified"
            
            if not paystack.is_payment_successful(verification):
                transaction.status = PaymentStatus.FAILED
                transaction.save()
                return False, transaction, "Payment verification failed"
            
            # Payment successful
            auth_code = verification['data'].get('authorization', {}).get('authorization_code')
            if auth_code:
                transaction.paystack_auth_code = auth_code
            
            transaction.status = PaymentStatus.SUCCESS
            transaction.save()
            
            # Resolve related model if not provided directly
            if not purchase_or_rental_model:
                if transaction.transaction_type == 'purchase' and transaction.purchase_id:
                    purchase_or_rental_model = Purchase.objects.select_for_update().filter(id=transaction.purchase_id).first()
                elif transaction.transaction_type == 'rental' and transaction.rental_id:
                    purchase_or_rental_model = Rental.objects.select_for_update().filter(id=transaction.rental_id).first()
            
            # Update related Purchase or Rental
            if purchase_or_rental_model:
                purchase_or_rental_model.paystack_reference = reference
                purchase_or_rental_model.paid_at = timezone.now()
                purchase_or_rental_model.status = 'CONFIRMED'  # Match frontend status enum
                purchase_or_rental_model.save()
                
                # If it's a purchase, reduce stock (atomic due to select_for_update)
                if transaction.transaction_type == 'purchase':
                    car = purchase_or_rental_model.car
                    car.stock = max(0, car.stock - purchase_or_rental_model.quantity)
                    if car.stock == 0:
                        car.is_available = False
                    car.save()
            
            return True, transaction, "Payment verified successfully"
            
    except Exception as e:
        logger.error(f"Database error during transaction {reference} update: {str(e)}")
        return False, None, f"Database error: {str(e)}"
