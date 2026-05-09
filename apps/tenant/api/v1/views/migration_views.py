"""
Migration tracking views for tenant migrations.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.tenant.models import TenantMigration
from apps.tenant.api.v1.serializers import MigrationSerializer, MigrationDetailSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin


class MigrationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TenantMigration operations (read-only).
    
    The nested router (/tenants/{tenant_pk}/migrations/) provides tenant-scoped access.
    """

    queryset = TenantMigration.objects.filter(is_deleted=False)
    serializer_class = MigrationSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_serializer_class(self):
        return MigrationDetailSerializer if self.action == 'retrieve' else MigrationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Nested router provides tenant_pk
        if hasattr(self.request, 'tenant_pk'):
            queryset = queryset.filter(tenant_id=self.request.tenant_pk)
        elif tenant_id := self.request.query_params.get('tenant_id'):
            queryset = queryset.filter(tenant_id=tenant_id)
        
        # Additional filters
        if status_filter := self.request.query_params.get('status'):
            queryset = queryset.filter(status=status_filter)
        
        if app_name := self.request.query_params.get('app_name'):
            queryset = queryset.filter(app_name=app_name)
        
        return queryset.order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        GET /migrations/summary/?tenant_id=xxx - Get migration summary with counts.
        """
        tenant_id = (request.tenant_pk if hasattr(request, 'tenant_pk') 
                     else request.query_params.get('tenant_id'))
        
        if not tenant_id:
            return Response(
                {'error': 'tenant_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        migrations = self.get_queryset().filter(tenant_id=tenant_id)
        
        return Response({
            'tenant_id': tenant_id,
            'total': migrations.count(),
            'pending_count': migrations.filter(status='pending').count(),
            'running_count': migrations.filter(status='running').count(),
            'completed_count': migrations.filter(status='completed').count(),
            'failed_count': migrations.filter(status='failed').count(),
            'latest_migration': MigrationSerializer(migrations.first()).data if migrations.exists() else None
        })