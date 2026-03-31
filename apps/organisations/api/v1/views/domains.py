"""
Domain views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.organisations.models import Domain
from apps.organisations.api.v1.serializers.tenant import DomainSerializer
from apps.organisations.api.v1.permissions import IsClientAdmin


class DomainViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Domain model
    """
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_primary', 'verification_status']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Domain.objects.all()
        return Domain.objects.filter(organisation=user.organisation)