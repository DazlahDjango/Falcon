# apps/tenant/api/v1/views/schema_views.py
"""
Schema management views for tenant database schemas.
"""

from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.tenant.models import TenantSchema
from apps.tenant.api.v1.serializers import SchemaSerializer, SchemaDetailSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin, IsTenantAdmin, HasTenantAccess


class SchemaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TenantSchema operations (read-only).

    Provides:
        - List schemas for a tenant
        - Get schema details
    """

    queryset = TenantSchema.objects.filter(is_deleted=False)
    serializer_class = SchemaSerializer
    permission_classes = [IsAuthenticated, IsTenantAdmin]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SchemaDetailSerializer
        return SchemaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by tenant
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        elif hasattr(self.request, 'tenant_id'):
            queryset = queryset.filter(tenant_id=self.request.tenant_id)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by is_ready
        is_ready = self.request.query_params.get('is_ready')
        if is_ready is not None:
            is_ready_bool = is_ready.lower() == 'true'
            queryset = queryset.filter(is_ready=is_ready_bool)

        return queryset


class TenantSchemaView(generics.GenericAPIView):
    """Get schema for a tenant."""
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get(self, request, tenant_id):
        schema = get_object_or_404(
            TenantSchema, tenant_id=tenant_id, is_deleted=False)

        serializer = SchemaDetailSerializer(schema)

        return Response({
            'tenant_id': tenant_id,
            'schema': serializer.data,
            'is_active': schema.status == 'active' and schema.is_ready,
            'size_display': f"{schema.size_mb} MB" if schema.size_mb else "Unknown"
        })
