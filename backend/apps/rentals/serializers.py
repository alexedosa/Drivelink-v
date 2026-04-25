from rest_framework import serializers
from django.utils import timezone
from .models import Rental
from apps.cars.models import Car

class RentalCreateSerializer(serializers.ModelSerializer):
    car_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Rental
        fields = ['car_id', 'start_date', 'end_date', 'total_days', 'total_amount']
        read_only_fields = ['total_days', 'total_amount']
    
    def validate(self, data):
        car_id = data.get('car_id')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        try:
            car = Car.objects.get(id=car_id, category='rental', is_active=True)
        except Car.DoesNotExist:
            raise serializers.ValidationError({'car_id': 'Rental car not found'})
        
        if start_date < timezone.now().date():
            raise serializers.ValidationError({'start_date': 'Start date cannot be in the past'})
        
        if end_date <= start_date:
            raise serializers.ValidationError({'end_date': 'End date must be after start date'})
        
        overlapping = Rental.objects.filter(
            car=car,
            status__in=['pending', 'confirmed'],
            start_date__lt=end_date,
            end_date__gt=start_date
        ).exists()
        
        if overlapping:
            raise serializers.ValidationError({'car_id': 'Car not available for selected dates'})
        
        data['car'] = car
        data['total_days'] = (end_date - start_date).days
        data['total_amount'] = data['total_days'] * car.daily_rate
        
        return data

class RentalListSerializer(serializers.ModelSerializer):
    car_name = serializers.CharField(source='car.name')
    car_image = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Rental
        fields = ['id', 'car_name', 'car_image', 'user_email', 'start_date', 'end_date', 'total_days', 'total_amount', 'status', 'created_at']
    
    def get_car_image(self, obj):
        return obj.car.main_image.url if obj.car.main_image else None

class RentalDetailSerializer(serializers.ModelSerializer):
    car = serializers.SerializerMethodField()
    
    class Meta:
        model = Rental
        fields = '__all__'
    
    def get_car(self, obj):
        from apps.cars.serializers import CarDetailSerializer
        return CarDetailSerializer(obj.car).data