"""
Tenant views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=False, methods=['get'], url_path='current')
    def current(self, request):
        """
        Get the current user's organisation.
        Returns the organisation the authenticated user belongs to.
        """
        user = request.user
        
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        # Get the user's organisation
        organisation = getattr(user, 'organisation', None)
        
        if not organisation:
            return Response({'error': 'No organisation found for this user'}, status=404)
        
        serializer = self.get_serializer(organisation)
        return Response(serializer.data)