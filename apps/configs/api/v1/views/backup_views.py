from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from apps.configs.models import BackupPolicy, BackupJob, BackupArtifact
from apps.configs.api.v1.serializers import BackupPolicySerializer, BackupJobSerializer, BackupJobDetailSerializer, BackupArtifactSerializer, BackupTriggerSerializer, BackupRestoreSerializer
from apps.configs.api.v1.permissions import CanTriggerBackup, CanCancelBackup, CanRestoreBackup, CanDeleteBackup, IsConfigAccess
from apps.configs.api.v1.throttles import BackupRateThrottle, RestoreRateThrottle, BackupBurstThrottle, ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.api.v1.filters import BackupJobFilter, BackupArtifactFilter, BackupPolicyFilter
from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator
from apps.configs.services.backup.backup_retention import BackupRetention
from apps.configs.services.backup.backup_verification import BackupVerification
from apps.configs.services.restore.restore_orchestrator import RestoreOrchestrator
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class BackupPolicyViewSet(viewsets.ModelViewSet):
    queryset = BackupPolicy.objects.all()
    serializer_class = BackupPolicySerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = BackupPolicyFilter
    search_fields = ['app__name']

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user.id)
        AuditLogger().log_success(AuditAction.UPDATE_POLICY, self.request.user.id, getattr(self.request.user, 'role', 'unknown'), target_app=serializer.instance.app, details={'policy_id': str(serializer.instance.id)})

class BackupJobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BackupJob.objects.all().select_related('app')
    serializer_class = BackupJobSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BackupJobFilter
    search_fields = ['app__name', 'error_message']
    ordering_fields = ['started_at', 'completed_at', 'size_bytes', 'duration_seconds']
    ordering = ['-started_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BackupJobDetailSerializer
        return BackupJobSerializer

    @action(detail=False, methods=['post'], permission_classes=[CanTriggerBackup], throttle_classes=[BackupRateThrottle, BackupBurstThrottle])
    def trigger(self, request):
        serializer = BackupTriggerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        orchestrator = BackupOrchestrator()
        job = orchestrator.trigger_backup(
            app_name=serializer.validated_data['app_name'],
            backup_type=serializer.validated_data['backup_type'],
            triggered_by=request.user.id,
            triggered_by_role=getattr(request.user, 'role', 'unknown'),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            tenant_id=getattr(request.user, 'tenant_id', None)
        )
        return Response({'backup_job_id': str(job.id), 'status': job.status}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['post'], permission_classes=[CanCancelBackup])
    def cancel(self, request, pk=None):
        job = self.get_object()
        orchestrator = BackupOrchestrator()
        cancelled_job = orchestrator.cancel_backup(job.id, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response({'status': cancelled_job.status})

    @action(detail=True, methods=['post'], permission_classes=[CanRestoreBackup], throttle_classes=[RestoreRateThrottle])
    def restore(self, request, pk=None):
        job = self.get_object()
        orchestrator = RestoreOrchestrator()
        result = orchestrator.restore_from_backup(job.id, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response(result)

    @action(detail=False, methods=['post'], permission_classes=[IsConfigAccess])
    def apply_retention(self, request):
        retention = BackupRetention()
        app_id = request.data.get('app_id')
        deleted = retention.apply_retention_policy(app_id)
        return Response({'deleted_backups': deleted})

    @action(detail=True, methods=['post'], permission_classes=[CanRestoreBackup])
    def verify(self, request, pk=None):
        job = self.get_object()
        artifact = BackupArtifact.objects.filter(backup_job=job).first()
        if not artifact:
            return Response({'error': 'No artifact found'}, status=status.HTTP_404_NOT_FOUND)
        verifier = BackupVerification()
        try:
            verifier.verify_and_update_status(artifact.id)
            return Response({'status': 'verified', 'artifact_id': str(artifact.id)})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BackupArtifactViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BackupArtifact.objects.all().select_related('backup_job__app')
    serializer_class = BackupArtifactSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BackupArtifactFilter
    search_fields = ['storage_path']
    ordering_fields = ['created_at', 'verified_at', 'size_bytes']
    ordering = ['-created_at']

    @action(detail=True, methods=['delete'], permission_classes=[CanDeleteBackup])
    def delete_artifact(self, request, pk=None):
        artifact = self.get_object()
        from apps.configs.services.backup.backup_storage import BackupStorage
        storage = BackupStorage()
        storage.delete(artifact.storage_path)
        artifact.status = 'deleted'
        artifact.save()
        AuditLogger().log_success(AuditAction.DELETE_ARTIFACT, request.user.id, 'super_admin', target_app=artifact.backup_job.app, target_id=str(artifact.id))
        return Response({'status': 'deleted'})