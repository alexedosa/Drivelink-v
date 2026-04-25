from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Payment initialization
    path('initialize/', views.PaymentInitializeView.as_view(), name='initialize'),
    
    # Payment verification
    path('callback/', views.PaymentCallbackView.as_view(), name='callback'),
    path('verify/<str:reference>/', views.PaymentVerifyView.as_view(), name='verify'),
    
    # User transactions
    path('transactions/', views.UserTransactionsView.as_view(), name='user-transactions'),
    path('transactions/<int:id>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # Webhook for Paystack notifications
    path('webhook/', views.webhook_handler, name='webhook'),
]
