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
        # Filter by tenant_id from user
        if user.tenant_id:
            return Organisation.objects.filter(id=user.tenant_id)
        return Organisation.objects.none()
    
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
        
        # Get organisation using tenant_id from user
        if not user.tenant_id:
            if user.is_superuser:
                # AUTO-REPAIR: Create default org if missing for superuser
                org, _ = Organisation.objects.get_or_create(
                    name="Falcon System Admin",
                    defaults={'slug': 'system-admin', 'is_active': True, 'is_verified': True}
                )
                user.tenant_id = org.id
                user.save(update_fields=['tenant_id'])
            else:
                return Response({'error': 'No organisation associated with this user'}, status=404)
        
        try:
            organisation = Organisation.objects.get(id=user.tenant_id)
            serializer = self.get_serializer(organisation)
            return Response(serializer.data)
        except Organisation.DoesNotExist:
            if user.is_superuser:
                 # AUTO-REPAIR: Link to first available org if tenant_id is invalid
                org = Organisation.objects.first()
                if org:
                    user.tenant_id = org.id
                    user.save(update_fields=['tenant_id'])
                    serializer = self.get_serializer(org)
                    return Response(serializer.data)
            return Response({'error': 'Organisation not found'}, status=404)