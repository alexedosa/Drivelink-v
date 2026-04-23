from django.db import models
from apps.users.models import User
from apps.cars.models import Car
from apps.core.constants import BookingStatus

class Rental(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    car = models.ForeignKey(Car, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.IntegerField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=BookingStatus.CHOICES, default=BookingStatus.PENDING)
    paystack_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.car.name} ({self.start_date} to {self.end_date})"