from django.db import models
from apps.users.models import User
from apps.core.constants import PaymentStatus, TransactionType


class Transaction(models.Model):
    """
    Handles all payment transactions for purchases and rentals.
    Uses flexible foreign keys to link to either Purchase or Rental.
    """
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.CHOICES,
        default=PaymentStatus.PENDING
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.CHOICES,
        help_text='Whether this is a purchase or rental payment'
    )
    
    # Flexible foreign keys to link either Purchase or Rental
    purchase_id = models.IntegerField(null=True, blank=True)
    rental_id = models.IntegerField(null=True, blank=True)
    
    # Paystack integration fields
    reference = models.CharField(max_length=100, unique=True)
    paystack_access_code = models.CharField(max_length=255, null=True, blank=True)
    paystack_authorization_url = models.URLField(null=True, blank=True)
    paystack_auth_code = models.CharField(max_length=255, null=True, blank=True)
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['reference']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_transaction_type_display()} - {self.amount} ({self.status})"
    
    @property
    def related_object(self):
        """Returns the actual Purchase or Rental instance"""
        from apps.purchases.models import Purchase
        from apps.rentals.models import Rental
        
        if self.transaction_type == TransactionType.PURCHASE:
            return Purchase.objects.filter(id=self.purchase_id).first()
        elif self.transaction_type == TransactionType.RENTAL:
            return Rental.objects.filter(id=self.rental_id).first()
        return None
