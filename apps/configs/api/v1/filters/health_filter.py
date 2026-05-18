from django_filters import rest_framework as filters
from apps.configs.models import HealthCheck, HealthCheckHistory
from apps.configs.constants import HealthStatus

class HealthCheckFilter(filters.FilterSet):
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    status = filters.ChoiceFilter(choices=HealthStatus.CHOICES)
    status_code_min = filters.NumberFilter(field_name='status_code', lookup_expr='gte')
    status_code_max = filters.NumberFilter(field_name='status_code', lookup_expr='lte')
    response_time_min_ms = filters.NumberFilter(field_name='response_time_ms', lookup_expr='gte')
    response_time_max_ms = filters.NumberFilter(field_name='response_time_ms', lookup_expr='lte')
    error_rate_min = filters.NumberFilter(field_name='error_rate_percent', lookup_expr='gte')
    error_rate_max = filters.NumberFilter(field_name='error_rate_percent', lookup_expr='lte')
    consecutive_failures_min = filters.NumberFilter(field_name='consecutive_failures', lookup_expr='gte')
    consecutive_failures_max = filters.NumberFilter(field_name='consecutive_failures', lookup_expr='lte')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    is_healthy = filters.BooleanFilter(method='filter_is_healthy')
    is_degraded = filters.BooleanFilter(method='filter_is_degraded')
    def filter_is_healthy(self, queryset, name, value):
        if value:
            return queryset.filter(status=HealthStatus.HEALTHY)
        return queryset.exclude(status=HealthStatus.HEALTHY)
    def filter_is_degraded(self, queryset, name, value):
        if value:
            return queryset.filter(status=HealthStatus.DEGRADED)
        return queryset.exclude(status=HealthStatus.DEGRADED)
    class Meta:
        model = HealthCheck
        fields = ['app_name', 'status']

class HealthCheckHistoryFilter(filters.FilterSet):
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    previous_status = filters.ChoiceFilter(choices=HealthStatus.CHOICES)
    new_status = filters.ChoiceFilter(choices=HealthStatus.CHOICES)
    trigger_conditional_maintenance = filters.BooleanFilter(field_name='trigger_conditional_maintenance')
    changed_after = filters.DateTimeFilter(field_name='changed_at', lookup_expr='gte')
    changed_before = filters.DateTimeFilter(field_name='changed_at', lookup_expr='lte')
    class Meta:
        model = HealthCheckHistory
        fields = ['app_name', 'previous_status', 'new_status', 'trigger_conditional_maintenance']