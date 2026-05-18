from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import BackupQuota
from apps.configs.api.v1.serializers import BackupQuotaSerializer, BackupQuotaUpdateSerializer
from apps.configs.api.v1.permissions import CanViewQuota, CanModifyQuota
from apps.configs.api.v1.throttles import ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.api.v1.filters import BackupQuotaFilter
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class BackupQuotaViewSet(viewsets.ModelViewSet):
    queryset = BackupQuota.objects.all().select_related('tenant', 'app')
    serializer_class = BackupQuotaSerializer
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BackupQuotaFilter
    search_fields = ['tenant__name', 'app__name']
    ordering_fields = ['total_backup_storage_bytes', 'used_backup_storage_bytes']
    ordering = ['-used_backup_storage_bytes']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [CanModifyQuota]
        else:
            self.permission_classes = [CanViewQuota]
        return super().get_permissions()

    @action(detail=True, methods=['put'], permission_classes=[CanModifyQuota])
    def update_quota(self, request, pk=None):
        quota = self.get_object()
        serializer = BackupQuotaUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for key, value in serializer.validated_data.items():
            setattr(quota, key, value)
        quota.save()
        AuditLogger().log_success(AuditAction.CHANGE_QUOTA, request.user.id, 'super_admin', target_id=str(quota.id))
        return Response(self.get_serializer(quota).data)

    @action(detail=False, methods=['get'])
    def over_threshold(self, request):
        quotas = self.get_queryset().filter(used_backup_storage_bytes__gte=models.F('total_backup_storage_bytes') * 0.8)
        serializer = self.get_serializer(quotas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def exceeded(self, request):
        quotas = self.get_queryset().filter(used_backup_storage_bytes__gte=models.F('total_backup_storage_bytes'))
        serializer = self.get_serializer(quotas, many=True)
        return Response(serializer.data)