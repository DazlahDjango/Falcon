"""
Feature Flag views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.organisations.models import FeatureFlag
from apps.organisations.api.v1.serializers.tenant import FeatureFlagSerializer
from apps.organisations.api.v1.permissions import IsSuperAdmin


class FeatureFlagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for FeatureFlag model (Super Admin only)
    """
    serializer_class = FeatureFlagSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['feature_name', 'is_enabled']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return FeatureFlag.objects.all()
        return FeatureFlag.objects.filter(organisation=user.organisation)