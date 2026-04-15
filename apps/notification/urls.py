from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    path('unread-count/', views.unread_count, name='notification-unread-count'),
    path('', include(router.urls)),
]
