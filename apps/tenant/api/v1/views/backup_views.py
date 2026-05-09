"""
Backup management views for tenant backups.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.utils import timezone
import os

from apps.tenant.models import TenantBackup
from apps.tenant.api.v1.serializers import (
    BackupSerializer, BackupCreateSerializer, BackupDetailSerializer
)
from apps.tenant.api.v1.permissions import IsTenantAdmin
from apps.tenant.api.v1.throttles import TenantApiThrottle
from apps.tenant.services.backup.backup_manager import BackupManager
from apps.tenant.services.backup.restore_service import RestoreService


class BackupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Backup operations.
    
    Provides complete backup management including creation, restoration, and downloads.
    The nested router (/tenants/{tenant_pk}/backups/) handles tenant scoping.
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
        """Filter backups based on tenant context."""
        queryset = super().get_queryset()
        
        # Nested router provides tenant_pk
        if hasattr(self.request, 'tenant_pk'):
            queryset = queryset.filter(tenant_id=self.request.tenant_pk)
        elif tenant_id := self.request.query_params.get('tenant_id'):
            queryset = queryset.filter(tenant_id=tenant_id)
        
        # Additional filters
        if status_filter := self.request.query_params.get('status'):
            queryset = queryset.filter(status=status_filter)
        
        if backup_type := self.request.query_params.get('backup_type'):
            queryset = queryset.filter(backup_type=backup_type)
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Create backup using backup manager."""
        manager = BackupManager()
        tenant_id = (self.request.tenant_pk if hasattr(self.request, 'tenant_pk') 
                     else self.request.data.get('tenant_id'))
        
        backup = manager.create_backup(
            tenant_id=tenant_id,
            backup_type=self.request.data.get('backup_type', 'full'),
            user=self.request.user
        )
        serializer.instance = backup

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """POST /backups/{id}/restore/ - Restore tenant from backup."""
        backup = self.get_object()
        service = RestoreService()
        
        if service.restore_from_backup(backup.id, user=request.user):
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
        """GET /backups/{id}/download/ - Download backup file."""
        backup = self.get_object()
        
        if not backup.backup_file or not os.path.exists(backup.backup_file):
            return Response(
                {'error': 'Backup file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return FileResponse(
            open(backup.backup_file, 'rb'),
            as_attachment=True,
            filename=f'backup_{backup.id}_{backup.created_at.date()}.sql'
        )