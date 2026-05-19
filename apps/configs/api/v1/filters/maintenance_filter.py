from django_filters import rest_framework as filters
from apps.configs.models import MaintenanceWindow, MaintenanceLog

class MaintenanceWindowFilter(filters.FilterSet):
    maintenance_type = filters.ChoiceFilter(choices=MaintenanceWindow.MAINTENANCE_TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=MaintenanceWindow.STATUS_CHOICES)
    triggered_by_role = filters.CharFilter(field_name='triggered_by_role')
    scheduled_after = filters.DateTimeFilter(field_name='scheduled_start', lookup_expr='gte')
    scheduled_before = filters.DateTimeFilter(field_name='scheduled_start', lookup_expr='lte')
    actual_after = filters.DateTimeFilter(field_name='actual_start', lookup_expr='gte')
    actual_before = filters.DateTimeFilter(field_name='actual_start', lookup_expr='lte')
    affects_app = filters.CharFilter(field_name='affected_apps__name', lookup_expr='exact')
    is_active = filters.BooleanFilter(method='filter_is_active')
    def filter_is_active(self, queryset, name, value):
        if value:
            return queryset.filter(status__in=['scheduled', 'in_progress'])
        return queryset.exclude(status__in=['scheduled', 'in_progress'])
    class Meta:
        model = MaintenanceWindow
        fields = ['maintenance_type', 'status', 'triggered_by_role', 'is_weekday_only']

class MaintenanceLogFilter(filters.FilterSet):
    action = filters.ChoiceFilter(choices=MaintenanceLog.ACTION_CHOICES)
    performed_by_role = filters.CharFilter(field_name='performed_by_role')
    performed_after = filters.DateTimeFilter(field_name='performed_at', lookup_expr='gte')
    performed_before = filters.DateTimeFilter(field_name='performed_at', lookup_expr='lte')
    class Meta:
        model = MaintenanceLog
        fields = ['action', 'performed_by_role']