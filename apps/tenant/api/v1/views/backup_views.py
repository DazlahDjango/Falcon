# apps/tenant/api/v1/views/backup_views.py
"""
Backup management views for tenant backups.
"""

from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.utils import timezone

from apps.tenant.models import TenantBackup
from apps.tenant.api.v1.serializers import BackupSerializer, BackupCreateSerializer, BackupDetailSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin, IsTenantAdmin, HasTenantAccess
from apps.tenant.api.v1.throttles import TenantApiThrottle, AdminOperationThrottle
from apps.tenant.services.backup.backup_manager import BackupManager
from apps.tenant.services.backup.restore_service import RestoreService


class BackupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Backup operations.

    Provides:
        - List backups for a tenant
        - Create new backup
        - Get backup details
        - Download backup file
        - Restore from backup
        - Delete backup
    """

    queryset = TenantBackup.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, IsTenantAdmin]
    throttle_classes = [TenantApiThrottle]

    def get_serializer_class(self):
        if self.action == 'create':
            return BackupCreateSerializer
        elif self.action == 'retrieve':
            return BackupDetailSerializer
        return BackupSerializer

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

        # Filter by backup type
        backup_type = self.request.query_params.get('backup_type')
        if backup_type:
            queryset = queryset.filter(backup_type=backup_type)

        return queryset

    def perform_create(self, serializer):
        """Create a new backup."""
        manager = BackupManager()

        backup = manager.create_backup(
            tenant_id=self.request.data.get('tenant_id'),
            backup_type=self.request.data.get('backup_type', 'full'),
            user=self.request.user
        )

        serializer.instance = backup

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """
        Restore tenant from this backup.
        """
        backup = self.get_object()

        service = RestoreService()
        success = service.restore_from_backup(backup.id, user=request.user)

        if success:
            return Response({
                'status': 'success',
                'message': f'Backup {pk} restored successfully',
                'backup_id': str(backup.id),
                'restored_at': timezone.now()
            })

        return Response({
            'status': 'failed',
            'message': 'Restore failed. Check logs for details.',
            'backup_id': str(backup.id)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """
        Download backup file.
        """
        backup = self.get_object()

        if not backup.backup_file:
            return Response(
                {'error': 'Backup file not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            import os
            if not os.path.exists(backup.backup_file):
                return Response(
                    {'error': 'Backup file not found on disk'},
                    status=status.HTTP_404_NOT_FOUND
                )

            return FileResponse(
                open(backup.backup_file, 'rb'),
                as_attachment=True,
                filename=f'backup_{backup.id}_{backup.created_at.date()}.sql'
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to download backup: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BackupRestoreView(generics.GenericAPIView):
    """Restore from a backup."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [AdminOperationThrottle]

    def post(self, request, pk):
        backup = get_object_or_404(TenantBackup, id=pk, is_deleted=False)

        service = RestoreService()
        success = service.restore_from_backup(backup.id, user=request.user)

        if success:
            return Response({'message': f'Backup {pk} restored successfully'})

        return Response(
            {'error': 'Restore failed. Check logs.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class BackupDownloadView(generics.GenericAPIView):
    """Download a backup file."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, pk):
        backup = get_object_or_404(TenantBackup, id=pk, is_deleted=False)

        if not backup.backup_file:
            return Response(
                {'error': 'Backup file not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            import os
            if not os.path.exists(backup.backup_file):
                return Response(
                    {'error': 'Backup file not found on disk'},
                    status=status.HTTP_404_NOT_FOUND
                )

            return FileResponse(
                open(backup.backup_file, 'rb'),
                as_attachment=True,
                filename=f'backup_{backup.id}_{backup.created_at.date()}.sql'
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TenantBackupsView(generics.GenericAPIView):
    """Get all backups for a tenant."""
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get(self, request, tenant_id):
        backups = TenantBackup.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).order_by('-created_at')

        serializer = BackupSerializer(backups, many=True)

        return Response({
            'tenant_id': tenant_id,
            'backups': serializer.data,
            'total': backups.count(),
            'latest_backup': serializer.data[0] if backups.exists() else None
        })
