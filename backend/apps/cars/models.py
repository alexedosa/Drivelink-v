from django.db import models
from apps.core.constants import CarCategory, FuelType, Transmission

class Car(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model_year = models.IntegerField()
    description = models.TextField(blank=True)
    category = models.CharField(max_length=10, choices=CarCategory.CHOICES)
    fuel_type = models.CharField(max_length=10, choices=FuelType.CHOICES)
    transmission = models.CharField(max_length=10, choices=Transmission.CHOICES)
    seats = models.IntegerField()
    color = models.CharField(max_length=50)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=1)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    main_image = models.ImageField(upload_to='cars/main/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.model_year})"

class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/gallery/')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

class Wishlist(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='wishlist')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'car')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} -> {self.car.name}"