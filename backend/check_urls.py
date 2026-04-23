import os
import django
from django.urls import resolve, reverse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

paths = [
    '/api/auth/login/',
    '/api/me/',
    '/api/auth/register/',
]

for p in paths:
    try:
        match = resolve(p)
        print(f"Path {p} resolved to {match.view_name}")
    except Exception as e:
        print(f"Path {p} failed to resolve: {e}")
