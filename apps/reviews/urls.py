# apps/reviews/urls.py
"""
URL configuration for Reviews app
"""

from django.urls import path, include

app_name = 'reviews'

urlpatterns = [
    # API v1 endpoints
    path('', include('apps.reviews.api.v1.urls')),
]