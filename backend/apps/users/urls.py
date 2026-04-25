from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView, MeView, ChangePasswordView, AllUsersView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/admin/login/', AdminLoginView.as_view()),
    path('auth/change-password/', ChangePasswordView.as_view()),
    path('users/all/', AllUsersView.as_view()),
    path('me/', MeView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
]