from rest_framework import serializers
from .models import Transaction
from apps.core.constants import PaymentStatus
from decimal import Decimal

class TransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user_email', 'amount', 'status', 'status_display',
            'transaction_type', 'transaction_type_display', 'reference',
            'paystack_access_code', 'paystack_authorization_url',
            'purchase_id', 'rental_id', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reference', 'paystack_access_code', 'paystack_authorization_url',
            'created_at', 'updated_at'
        ]


class PaymentInitializeSerializer(serializers.Serializer):
    """Serializer for payment initialization requests"""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    transaction_type = serializers.ChoiceField(choices=['purchase', 'rental'])
    purchase_id = serializers.IntegerField(required=False, allow_null=True)
    rental_id = serializers.IntegerField(required=False, allow_null=True)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)
    
    def validate(self, data):
        """Ensure either purchase_id or rental_id is provided"""
        transaction_type = data.get('transaction_type')
        purchase_id = data.get('purchase_id')
        rental_id = data.get('rental_id')
        
        if transaction_type == 'purchase' and not purchase_id:
            raise serializers.ValidationError("purchase_id is required for purchase transactions")
        
        if transaction_type == 'rental' and not rental_id:
            raise serializers.ValidationError("rental_id is required for rental transactions")
        
        return data


class PaymentCallbackSerializer(serializers.Serializer):
    """Serializer for payment callback verification"""
    reference = serializers.CharField(max_length=100)


class TransactionListSerializer(serializers.ModelSerializer):
    """Serializer for listing user transactions"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'status', 'status_display',
            'transaction_type', 'transaction_type_display', 'reference',
            'purchase_id', 'rental_id', 'created_at'
        ]
