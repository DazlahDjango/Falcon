from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenant.models import OrganizationSchema
from apps.tenant.api.v1.serializers import (
    SchemaSerializer,
    SchemaCreateSerializer,
    SchemaUpdateSerializer,
    SchemaDetailSerializer,
)
from apps.tenant.api.v1.permissions import CanManageSchema, IsSuperAdmin
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.api.v1.filters import SchemaFilter
from apps.tenant.services import SchemaService


class SchemaViewSet(viewsets.ModelViewSet):
    queryset = OrganizationSchema.objects.all()
    permission_classes = [IsAuthenticated, CanManageSchema]
    throttle_classes = [OrganizationApiThrottle]
    filterset_class = SchemaFilter
    ordering_fields = ['schema_name', 'created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        action_serializers = {
            'create': SchemaCreateSerializer,
            'update': SchemaUpdateSerializer,
            'partial_update': SchemaUpdateSerializer,
            'retrieve': SchemaDetailSerializer,
            'list': SchemaSerializer,
        }
        return action_serializers.get(self.action, SchemaSerializer)

    def get_permissions(self):
        if self.action in ['provision', 'drop', 'enable_rls']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, CanManageSchema]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('organization_id'):
            queryset = queryset.filter(organization_id=self.request.query_params.get('organization_id'))
        if self.request.query_params.get('status'):
            queryset = queryset.filter(status=self.request.query_params.get('status'))
        if self.request.query_params.get('is_ready') is not None:
            queryset = queryset.filter(is_ready=self.request.query_params.get('is_ready').lower() == 'true')
        return queryset

    @action(detail=True, methods=['post'])
    def provision(self, request, pk=None):
        schema = self.get_object()
        if schema.status == 'ACTIVE':
            return Response({'error': f'Schema {schema.schema_name} is already active'}, status=status.HTTP_400_BAD_REQUEST)
        service = SchemaService()
        result = service.provision_schema(schema.id)
        return Response({
            'success': True,
            'message': f'Schema {result.schema_name} provisioned and migrated',
            'schema_id': str(result.id),
            'status': result.status
        })

    @action(detail=True, methods=['post'], url_path='enable-rls')
    def enable_rls(self, request, pk=None):
        schema = self.get_object()
        service = SchemaService()
        try:
            result = service.enable_rls(schema.id)
            return Response({
                'success': True,
                'message': f"Enabled Row-Level Security on {result['tables_protected']} tables in schema '{result['schema']}'",
                'schema_id': str(schema.id),
                'tables_protected': result['tables_protected']
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def drop(self, request, pk=None):
        schema = self.get_object()
        if schema.status == 'DELETED':
            return Response({'error': f'Schema {schema.schema_name} is already deleted'}, status=status.HTTP_400_BAD_REQUEST)
        service = SchemaService()
        result = service.drop_schema(schema.id)
        return Response({
            'success': True,
            'message': f'Schema {result.schema_name} dropped',
            'schema_id': str(result.id)
        })

    @action(detail=True, methods=['post'])
    def update_stats(self, request, pk=None):
        schema = self.get_object()
        service = SchemaService()
        result = service.update_schema_stats(schema.id)
        return Response({
            'success': True,
            'schema_id': str(result.id),
            'table_count': result.table_count,
            'size_mb': result.size_mb
        })