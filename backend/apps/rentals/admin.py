from django.contrib import admin
from .models import Rental

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ['user', 'car', 'start_date', 'end_date', 'total_amount', 'status']
    list_filter = ['status', 'start_date']
    search_fields = ['user__email', 'car__name']