from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction as db_transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging
import hmac
import hashlib
import json
import os

from .models import Transaction
from .serializers import (
    TransactionSerializer,
    PaymentInitializeSerializer,
    PaymentCallbackSerializer,
    TransactionListSerializer
)
from .services import create_transaction, verify_and_update_transaction, PaystackService
from apps.purchases.models import Purchase
from apps.rentals.models import Rental
from apps.core.constants import PaymentStatus, TransactionType

logger = logging.getLogger(__name__)


class PaymentInitializeView(APIView):
    """
    Initialize a payment transaction.
    POST: Create a new payment transaction
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PaymentInitializeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validate that the user has access to the purchase/rental
        transaction_type = serializer.validated_data['transaction_type']
        purchase_id = serializer.validated_data.get('purchase_id')
        rental_id = serializer.validated_data.get('rental_id')
        
        if transaction_type == TransactionType.PURCHASE:
            try:
                purchase = Purchase.objects.get(id=purchase_id, user=request.user)
                # Verify amount matches
                if serializer.validated_data['amount'] != purchase.total_amount:
                    return Response(
                        {'error': 'Amount does not match purchase total'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Purchase.DoesNotExist:
                return Response(
                    {'error': 'Purchase not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        elif transaction_type == TransactionType.RENTAL:
            try:
                rental = Rental.objects.get(id=rental_id, user=request.user)
                # Verify amount matches
                if serializer.validated_data['amount'] != rental.total_amount:
                    return Response(
                        {'error': 'Amount does not match rental total'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Rental.DoesNotExist:
                return Response(
                    {'error': 'Rental not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Create transaction with Paystack
        transaction_obj, paystack_response = create_transaction(
            user=request.user,
            amount=serializer.validated_data['amount'],
            transaction_type=transaction_type,
            purchase_id=purchase_id,
            rental_id=rental_id,
            metadata={
                'email': serializer.validated_data['email'],
                'full_name': serializer.validated_data['full_name'],
                'phone': serializer.validated_data['phone'],
            }
        )
        
        if not transaction_obj:
            logger.error(f"Failed to create transaction: {paystack_response}")
            return Response(
                {'error': paystack_response.get('error', 'Failed to initialize payment')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'transaction_id': transaction_obj.id,
            'reference': transaction_obj.reference,
            'authorization_url': transaction_obj.paystack_authorization_url,
            'access_code': transaction_obj.paystack_access_code,
            'amount': transaction_obj.amount,
            'status': transaction_obj.status,
        }, status=status.HTTP_201_CREATED)


class PaymentCallbackView(APIView):
    """
    Handle payment callback from Paystack.
    This endpoint verifies the payment and updates transaction status.
    """
    permission_classes = [AllowAny]
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        serializer = PaymentCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reference = serializer.validated_data['reference']
        
        try:
            # Verify transaction with Paystack and update
            success, transaction_obj, message = verify_and_update_transaction(reference)
            
            if not success:
                return Response(
                    {'status': False, 'message': message},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Return success response
            return Response({
                'status': True,
                'message': 'Payment verified successfully',
                'transaction_id': transaction_obj.id,
                'reference': transaction_obj.reference,
                'amount': transaction_obj.amount,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Payment callback error: {str(e)}")
            return Response(
                {'status': False, 'message': 'Callback processing error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentVerifyView(APIView):
    """
    Verify a specific payment transaction.
    GET: Check payment status by reference
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, reference=None):
        if not reference:
            return Response(
                {'error': 'reference parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transaction_obj = Transaction.objects.get(reference=reference, user=request.user)
            serializer = TransactionSerializer(transaction_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Transaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserTransactionsView(generics.ListAPIView):
    """
    List all transactions for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionListSerializer
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific transaction.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([AllowAny])
@require_http_methods(["POST"])
def webhook_handler(request):
    """
    Paystack webhook endpoint for payment notifications.
    This is called by Paystack servers to notify payment events.
    """
    try:
        # Validate Paystack signature
        paystack_signature = request.headers.get('x-paystack-signature')
        if not paystack_signature:
            return Response({'error': 'Missing signature'}, status=status.HTTP_400_BAD_REQUEST)
        
        secret_key = os.getenv('PAYSTACK_SECRET_KEY', '')
        if not secret_key:
            logger.error("PAYSTACK_SECRET_KEY not configured")
            return Response({'error': 'Configuration error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Compute HMAC SHA512 hash of the raw request body
        hash_obj = hmac.new(
            secret_key.encode('utf-8'),
            request.body,
            hashlib.sha512
        )
        expected_signature = hash_obj.hexdigest()
        
        # Compare securely to prevent timing attacks
        if not hmac.compare_digest(expected_signature, paystack_signature):
            logger.warning("Invalid Paystack webhook signature")
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse payload safely
        data = json.loads(request.body.decode('utf-8'))
        event_type = data.get('event')
        
        if event_type == 'charge.success':
            reference = data['data']['reference']
            success, transaction_obj, message = verify_and_update_transaction(reference)
            
            if success:
                logger.info(f"Webhook: Payment confirmed for {reference}")
                return Response({'status': 'ok'}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Webhook: Payment verification failed for {reference}: {message}")
                return Response({'status': 'ok'}, status=status.HTTP_200_OK)  # Always return 200 to Paystack
        
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return Response({'status': 'error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
