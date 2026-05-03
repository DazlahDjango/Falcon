"""
Structure App URL Configuration
Main entry point for all structure-related URLs
Includes REST API and WebSocket routing
"""
from django.urls import path, include

app_name = 'structure'

urlpatterns = [
    # REST API v1
    path('', include('apps.structure.api.v1.urls')),
]