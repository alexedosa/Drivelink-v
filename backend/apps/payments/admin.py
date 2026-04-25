from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'status', 'transaction_type', 'reference', 'created_at')
    list_filter = ('status', 'transaction_type', 'created_at')
    search_fields = ('user__email', 'reference', 'paystack_access_code')
    readonly_fields = ('reference', 'paystack_access_code', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('user', 'amount', 'status', 'transaction_type', 'reference')
        }),
        ('Related Item', {
            'fields': ('purchase_id', 'rental_id'),
            'description': 'The purchase or rental this transaction is for'
        }),
        ('Paystack Details', {
            'fields': ('paystack_access_code', 'paystack_authorization_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
