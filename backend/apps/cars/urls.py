from django.urls import path
from .views import CarListView, CarDetailView, AdminCarCreateView, AdminCarUpdateView, AdminCarDeleteView

urlpatterns = [
    path('', CarListView.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('admin/create/', AdminCarCreateView.as_view(), name='admin-car-create'),
    path('admin/update/<int:pk>/', AdminCarUpdateView.as_view(), name='admin-car-update'),
    path('admin/delete/<int:pk>/', AdminCarDeleteView.as_view(), name='admin-car-delete'),
]