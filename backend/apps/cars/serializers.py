from rest_framework import serializers
from django.core.files.images import get_image_dimensions
from .models import Car, CarImage

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'order']
    
    def validate_image(self, value):
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Image must be less than 2MB")
        
        if value.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
            raise serializers.ValidationError("Only JPEG, PNG, or WEBP images allowed")
        
        return value

class CarListSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = ['id', 'name', 'brand', 'model_year', 'category', 'daily_rate', 'purchase_price', 'stock', 'main_image']
    
    def get_main_image(self, obj):
        return obj.main_image.url if obj.main_image else None

class CarDetailSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Car
        fields = '__all__'

class CarCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = '__all__'
    
    def validate_main_image(self, value):
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Main image must be less than 2MB")
        
        if value.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
            raise serializers.ValidationError("Only JPEG, PNG, or WEBP images allowed")
        
        width, height = get_image_dimensions(value)
        if width < 500 or height < 300:
            raise serializers.ValidationError("Image must be at least 500x300 pixels")
        
        return value
    
    def validate(self, data):
        category = data.get('category', getattr(self.instance, 'category', None))
        daily_rate = data.get('daily_rate', getattr(self.instance, 'daily_rate', None))
        purchase_price = data.get('purchase_price', getattr(self.instance, 'purchase_price', None))
        
        if category == 'rental' and not daily_rate:
            raise serializers.ValidationError({'daily_rate': 'Daily rate required for rental cars'})
        
        if category == 'purchase' and not purchase_price:
            raise serializers.ValidationError({'purchase_price': 'Purchase price required for purchase cars'})
        
        stock = data.get('stock', getattr(self.instance, 'stock', 0))
        if stock is not None and stock < 0:
            raise serializers.ValidationError({'stock': 'Stock cannot be negative'})
        
        return data