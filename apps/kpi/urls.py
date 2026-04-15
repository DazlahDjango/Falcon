from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Add routers here as views are implemented

urlpatterns = [
    path('overview/', views.kpi_overview, name='kpi-overview'),
    path('performance-trend/', views.performance_trend, name='performance-trend'),
    path('', include(router.urls)),
]
