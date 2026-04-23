from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Rental
from .serializers import RentalCreateSerializer, RentalListSerializer, RentalDetailSerializer
from apps.core.permissions import IsOwnerOrAdmin
from apps.core.utils import generate_reference

class CreateRentalView(generics.CreateAPIView):
    serializer_class = RentalCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        rental = serializer.save(user=self.request.user)
        rental.paystack_reference = generate_reference('RENT')
        rental.save()

class MyRentalsView(generics.ListAPIView):
    serializer_class = RentalListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Rental.objects.filter(user=self.request.user).order_by('-created_at')

class RentalDetailView(generics.RetrieveAPIView):
    queryset = Rental.objects.all()
    serializer_class = RentalDetailSerializer
    permission_classes = [IsOwnerOrAdmin]

class CancelRentalView(generics.UpdateAPIView):
    queryset = Rental.objects.filter(status='pending')
    serializer_class = RentalDetailSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def perform_update(self, serializer):
        serializer.save(status='cancelled')