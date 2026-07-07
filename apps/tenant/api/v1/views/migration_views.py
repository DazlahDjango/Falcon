from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenant.models import OrganizationMigration
from apps.tenant.api.v1.serializers import (
    MigrationSerializer,
    MigrationDetailSerializer,
    MigrationCreateSerializer,
    MigrationUpdateSerializer,
    MigrationStatusSerializer,
    MigrationStatsSerializer,
)
from apps.tenant.api.v1.permissions import IsSuperAdmin, CanManageOrganization
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.services import MigrationService


class MigrationViewSet(viewsets.ModelViewSet):
    queryset = OrganizationMigration.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [OrganizationApiThrottle]
    ordering_fields = ['status', 'created_at', 'completed_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        action_serializers = {
            'create': MigrationCreateSerializer,
            'update': MigrationUpdateSerializer,
            'partial_update': MigrationUpdateSerializer,
            'retrieve': MigrationDetailSerializer,
            'list': MigrationSerializer,
            'status': MigrationStatusSerializer,
            'stats': MigrationStatsSerializer,
        }
        return action_serializers.get(self.action, MigrationSerializer)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('organization_id'):
            queryset = queryset.filter(organization_id=self.request.query_params.get('organization_id'))
        if self.request.query_params.get('app_name'):
            queryset = queryset.filter(app_name=self.request.query_params.get('app_name'))
        if self.request.query_params.get('status'):
            queryset = queryset.filter(status=self.request.query_params.get('status'))
        return queryset

    @action(detail=False, methods=['post'])
    def sync(self, request):
        org_id = request.data.get('organization_id') or request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        service = MigrationService()
        try:
            service.sync_tenant_migrations(org_id)
            return Response({'success': True, 'message': 'Migrations synced successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='preview-sql')
    def preview_sql(self, request, pk=None):
        migration = self.get_object()
        service = MigrationService()
        try:
            sql = service.preview_migration_sql(
                migration.organization_id,
                migration.app_name,
                migration.migration_name
            )
            return Response({'sql': sql})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        migration = self.get_object()
        if migration.status == 'COMPLETED':
            return Response({'error': f'Migration {migration.migration_name} already applied'}, status=status.HTTP_400_BAD_REQUEST)
        service = MigrationService()
        try:
            result = service.apply_migration(
                migration.organization_id,
                migration.app_name,
                migration.migration_name,
                user=request.user
            )
            return Response({
                'success': True,
                'message': f'Migration {result.migration_name} applied',
                'status': result.status
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def rollback(self, request, pk=None):
        migration = self.get_object()
        if migration.status != 'COMPLETED':
            return Response({'error': f'Migration {migration.migration_name} is not COMPLETED, cannot rollback'}, status=status.HTTP_400_BAD_REQUEST)
        service = MigrationService()
        try:
            result = service.rollback_migration(
                migration.organization_id,
                migration.app_name,
                migration.migration_name,
                user=request.user
            )
            return Response({
                'success': True,
                'message': f'Migration {result.migration_name} rolled back successfully',
                'status': result.status
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id required'}, status=status.HTTP_400_BAD_REQUEST)
        service = MigrationService()
        migrations = service.get_migration_status(org_id)
        stats = {
            'total': migrations.count(),
            'pending': migrations.filter(status='PENDING').count(),
            'running': migrations.filter(status='RUNNING').count(),
            'completed': migrations.filter(status='COMPLETED').count(),
            'failed': migrations.filter(status='FAILED').count(),
            'rolled_back': migrations.filter(status='ROLLED_BACK').count(),
        }
        return Response(stats)