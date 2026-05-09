"""
Schema management views for tenant database schemas.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.tenant.models import TenantSchema
from apps.tenant.api.v1.serializers import SchemaSerializer, SchemaDetailSerializer
from apps.tenant.api.v1.permissions import IsTenantAdmin


class SchemaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TenantSchema operations (read-only).
    
    The nested router (/tenants/{tenant_pk}/schemas/) provides tenant-scoped access.
    """

    queryset = TenantSchema.objects.filter(is_deleted=False)
    serializer_class = SchemaSerializer
    permission_classes = [IsAuthenticated, IsTenantAdmin]

    def get_serializer_class(self):
        return SchemaDetailSerializer if self.action == 'retrieve' else SchemaSerializer

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
        
        if is_ready := self.request.query_params.get('is_ready'):
            queryset = queryset.filter(is_ready=is_ready.lower() == 'true')
        
        return queryset

    @action(detail=False, methods=['get'], url_path='current')
    def current_schema(self, request):
        """
        GET /schemas/current/?tenant_id=xxx - Get current active schema for tenant.
        Alternative to the separate TenantSchemaView.
        """
        tenant_id = (request.tenant_pk if hasattr(request, 'tenant_pk') 
                     else request.query_params.get('tenant_id'))
        
        if not tenant_id:
            return Response(
                {'error': 'tenant_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        schema = self.get_queryset().filter(tenant_id=tenant_id).first()
        if not schema:
            return Response(
                {'error': 'No schema found for this tenant'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SchemaDetailSerializer(schema)
        return Response({
            'tenant_id': tenant_id,
            'schema': serializer.data,
            'is_active': schema.status == 'active' and schema.is_ready,
            'size_display': f"{schema.size_mb} MB" if schema.size_mb else "Unknown"
        })