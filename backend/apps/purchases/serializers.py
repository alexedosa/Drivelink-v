from rest_framework import serializers
from django.db import transaction
from .models import Purchase
from apps.cars.models import Car

class PurchaseCreateSerializer(serializers.ModelSerializer):
    car_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Purchase
        fields = ['car_id', 'quantity', 'unit_price', 'total_amount']
        read_only_fields = ['unit_price', 'total_amount']
    
    def validate(self, data):
        car_id = data.get('car_id')
        quantity = data.get('quantity', 1)
        
        try:
            car = Car.objects.select_for_update().get(id=car_id, category='purchase', is_active=True)
        except Car.DoesNotExist:
            raise serializers.ValidationError({'car_id': 'Purchase car not found'})
        
        if quantity > car.stock:
            raise serializers.ValidationError({'quantity': f'Only {car.stock} units available'})
        
        data['car'] = car
        data['unit_price'] = car.purchase_price
        data['total_amount'] = car.purchase_price * quantity
        
        return data

class PurchaseListSerializer(serializers.ModelSerializer):
    car_name = serializers.CharField(source='car.name')
    car_image = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Purchase
        fields = ['id', 'car_name', 'car_image', 'user_email', 'quantity', 'unit_price', 'total_amount', 'status', 'created_at']
    
    def get_car_image(self, obj):
        return obj.car.main_image.url if obj.car.main_image else None

class PurchaseDetailSerializer(serializers.ModelSerializer):
    car = serializers.SerializerMethodField()
    
    class Meta:
        model = Purchase
        fields = '__all__'
    
    def get_car(self, obj):
        from apps.cars.serializers import CarDetailSerializer
        return CarDetailSerializer(obj.car).data