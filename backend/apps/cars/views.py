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