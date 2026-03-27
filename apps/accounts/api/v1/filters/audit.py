import django_filters
from apps.accounts.models import AuditLog
from apps.accounts.constants import AuditSeverity, AuditActionTypes
from .base import BaseFilter, DateRangeFilter


class AuditLogFilter(BaseFilter, DateRangeFilter):
    action = django_filters.CharFilter(field_name='action', lookup_expr='icontains')
    action_type = django_filters.ChoiceFilter(choices=AuditActionTypes.CHOICES)
    severity = django_filters.ChoiceFilter(choices=AuditSeverity.CHOICES)
    user_id = django_filters.UUIDFilter(field_name='user__id')
    tenant_id = django_filters.UUIDFilter(field_name='tenant_id')
    content_type = django_filters.CharFilter(field_name='content_type', lookup_expr='icontains')
    object_id = django_filters.CharFilter(field_name='object_id', lookup_expr='icontains')
    ip_address = django_filters.CharFilter(field_name='ip_address', lookup_expr='icontains')
    
    class Meta:
        model = AuditLog
        fields = [
            'action', 'action_type', 'severity', 'user_id',
            'tenant_id', 'content_type', 'object_id', 'ip_address'
        ]