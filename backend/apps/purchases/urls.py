from django.urls import path
from .views import CreatePurchaseView, MyPurchasesView, AllPurchasesView, PurchaseDetailView, AdminUpdatePurchaseStatusView

urlpatterns = [
    path('create/', CreatePurchaseView.as_view(), name='create-purchase'),
    path('my/', MyPurchasesView.as_view(), name='my-purchases'),
    path('all/', AllPurchasesView.as_view(), name='all-purchases'),
    path('<int:pk>/', PurchaseDetailView.as_view(), name='purchase-detail'),
    path('<int:pk>/status/', AdminUpdatePurchaseStatusView.as_view(), name='update-status'),
]