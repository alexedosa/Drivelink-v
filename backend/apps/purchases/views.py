from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Purchase
from .serializers import PurchaseCreateSerializer, PurchaseListSerializer, PurchaseDetailSerializer
from apps.core.permissions import IsOwnerOrAdmin, IsAdmin
from apps.core.utils import generate_reference

class CreatePurchaseView(generics.CreateAPIView):
    serializer_class = PurchaseCreateSerializer
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def perform_create(self, serializer):
        purchase = serializer.save(user=self.request.user)
        purchase.paystack_reference = generate_reference('BUY')
        purchase.save()

class MyPurchasesView(generics.ListAPIView):
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user).order_by('-created_at')

class AllPurchasesView(generics.ListAPIView):
    serializer_class = PurchaseListSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        return Purchase.objects.all().order_by('-created_at')

class PurchaseDetailView(generics.RetrieveAPIView):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseDetailSerializer
    permission_classes = [IsOwnerOrAdmin]

class AdminUpdatePurchaseStatusView(generics.UpdateAPIView):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseDetailSerializer
    permission_classes = [IsAdmin]
    
    def perform_update(self, serializer):
        serializer.save()