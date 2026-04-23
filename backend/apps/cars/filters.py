from django_filters import rest_framework as filters
from .models import Car

class CarFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='daily_rate', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='daily_rate', lookup_expr='lte')
    brand = filters.CharFilter(lookup_expr='iexact')
    
    class Meta:
        model = Car
        fields = ['category', 'brand', 'fuel_type', 'transmission', 'seats']