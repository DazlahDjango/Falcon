from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import ConfigAuditLog
from apps.configs.api.v1.serializers import ConfigAuditLogSerializer
from apps.configs.api.v1.permissions import IsSuperAdmin
from apps.configs.api.v1.throttles import ConfigReadThrottle
from apps.configs.api.v1.filters import AuditLogFilter

class ConfigAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ConfigAuditLog.objects.all().select_related('target_app')
    serializer_class = ConfigAuditLogSerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AuditLogFilter
    search_fields = ['performed_by_email', 'request_id', 'target_id']
    ordering_fields = ['performed_at']
    ordering = ['-performed_at']