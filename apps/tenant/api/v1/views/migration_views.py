# apps/tenant/api/v1/views/migration_views.py
"""
Migration tracking views for tenant migrations.
"""

from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.tenant.models import TenantMigration
from apps.tenant.api.v1.serializers import MigrationSerializer, MigrationDetailSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin, IsTenantAdmin, HasTenantAccess


class MigrationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TenantMigration operations (read-only).

    Provides:
        - List migrations for a tenant
        - Get migration details
    """

    queryset = TenantMigration.objects.filter(is_deleted=False)
    serializer_class = MigrationSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MigrationDetailSerializer
        return MigrationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by tenant
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by app name
        app_name = self.request.query_params.get('app_name')
        if app_name:
            queryset = queryset.filter(app_name=app_name)

        return queryset


class TenantMigrationsView(generics.GenericAPIView):
    """Get all migrations for a tenant."""
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get(self, request, tenant_id):
        migrations = TenantMigration.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).order_by('-created_at')

        serializer = MigrationSerializer(migrations, many=True)

        return Response({
            'tenant_id': tenant_id,
            'migrations': serializer.data,
            'total': migrations.count(),
            'pending_count': migrations.filter(status='pending').count(),
            'failed_count': migrations.filter(status='failed').count(),
            'completed_count': migrations.filter(status='completed').count()
        })
