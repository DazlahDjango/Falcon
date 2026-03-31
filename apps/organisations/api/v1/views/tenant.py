"""
Tenant views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.organisations.models import Organisation
from apps.organisations.api.v1.serializers.tenant import OrganisationSerializer
from apps.organisations.api.v1.permissions import IsSuperAdmin, IsClientAdmin


class OrganisationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organisation model
    """
    serializer_class = OrganisationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector', 'status', 'is_active', 'is_verified']
    search_fields = ['name', 'slug', 'contact_email', 'registration_number']
    ordering_fields = ['name', 'created_at', 'employee_count']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Organisation.objects.all()
        return Organisation.objects.filter(id=user.organisation.id)
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsClientAdmin()]
        return [IsAuthenticated()]