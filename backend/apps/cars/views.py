from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Car
from .serializers import CarListSerializer, CarDetailSerializer, CarCreateUpdateSerializer
from .filters import CarFilter
from apps.core.permissions import IsAdmin
from apps.core.utils import perform_destroy

class CarListView(generics.ListAPIView):
    serializer_class = CarListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['name', 'brand', 'color']
    ordering_fields = ['daily_rate', 'purchase_price', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Car.objects.filter(is_active=True, is_available=True)

class CarDetailView(generics.RetrieveAPIView):
    queryset = Car.objects.filter(is_active=True)
    serializer_class = CarDetailSerializer

# CRUD POWERHOUSE FOR ADMINS
class AdminCarCreateView(generics.CreateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarCreateUpdateSerializer
    permission_classes = [IsAdmin]

class AdminCarUpdateView(generics.UpdateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarCreateUpdateSerializer
    permission_classes = [IsAdmin]

class AdminCarDeleteView(generics.DestroyAPIView):
    queryset = Car.objects.all()
    permission_classes = [IsAdmin]
    
    def perform_destroy(self, instance):
        perform_destroy(instance)

# Wishlist
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Wishlist

class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        car = get_object_or_404(Car, pk=pk)
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, car=car)
        
        if not created:
            wishlist_item.delete()
            return Response({"status": "removed"}, status=status.HTTP_200_OK)
            
        return Response({"status": "added"}, status=status.HTTP_201_CREATED)

class WishlistView(generics.ListAPIView):
    serializer_class = CarListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Car.objects.filter(wishlisted_by__user=self.request.user).order_by('-wishlisted_by__created_at')