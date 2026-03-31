"""
Settings views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.organisations.models import OrganisationSettings, Branding
from apps.organisations.api.v1.serializers.tenant import OrganisationSettingsSerializer, BrandingSerializer
from apps.organisations.api.v1.permissions import IsClientAdmin


class OrganisationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for OrganisationSettings model
    """
    serializer_class = OrganisationSettingsSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return OrganisationSettings.objects.all()
        return OrganisationSettings.objects.filter(organisation=user.organisation)


class BrandingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Branding model
    """
    serializer_class = BrandingSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Branding.objects.all()
        return Branding.objects.filter(organisation=user.organisation)