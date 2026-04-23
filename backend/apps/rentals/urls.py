from django.urls import path
from .views import CreateRentalView, MyRentalsView, RentalDetailView, CancelRentalView

urlpatterns = [
    path('create/', CreateRentalView.as_view(), name='create-rental'),
    path('my/', MyRentalsView.as_view(), name='my-rentals'),
    path('<int:pk>/', RentalDetailView.as_view(), name='rental-detail'),
    path('<int:pk>/cancel/', CancelRentalView.as_view(), name='cancel-rental'),
]