from django.urls import path, include
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# API V1 APPS URLs
# =================
urlpatterns = [
    # Accounts
    path('', include('apps.accounts.urls')),
    path('', include('apps.organisations.api.v1.urls')),
]