from django_filters import rest_framework as filters
from apps.configs.models import ConfigAuditLog

class AuditLogFilter(filters.FilterSet):
    action = filters.ChoiceFilter(choices=ConfigAuditLog.ACTION_CHOICES)
    performed_by_role = filters.CharFilter(field_name='performed_by_role')
    result = filters.ChoiceFilter(choices=ConfigAuditLog.RESULT_CHOICES)
    target_app_name = filters.CharFilter(field_name='target_app__name', lookup_expr='exact')
    performed_after = filters.DateTimeFilter(field_name='performed_at', lookup_expr='gte')
    performed_before = filters.DateTimeFilter(field_name='performed_at', lookup_expr='lte')
    performed_by = filters.UUIDFilter(field_name='performed_by')
    has_error = filters.BooleanFilter(method='filter_has_error')
    def filter_has_error(self, queryset, name, value):
        if value:
            return queryset.exclude(error_message='')
        return queryset.filter(error_message='')
    class Meta:
        model = ConfigAuditLog
        fields = ['action', 'performed_by_role', 'result', 'target_app_name', 'performed_by']