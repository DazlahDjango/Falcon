"""
Subscription views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.organisations.models import Plan, Subscription
from apps.organisations.api.v1.serializers.tenant import PlanSerializer, SubscriptionSerializer
from apps.organisations.api.v1.permissions import IsClientAdmin


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Plan model (read-only)
    """
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'is_popular']
    search_fields = ['name', 'code']
    ordering_fields = ['display_order', 'price_monthly']
    
    def get_queryset(self):
        return Plan.objects.filter(is_active=True)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subscription model
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'plan', 'auto_renew']
    search_fields = ['organisation__name']
    ordering_fields = ['start_date', 'end_date']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Subscription.objects.all()
        return Subscription.objects.filter(organisation=user.organisation)