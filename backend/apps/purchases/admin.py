from django.contrib import admin
from .models import Purchase

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['user', 'car', 'quantity', 'total_amount', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['user__email', 'car__name']