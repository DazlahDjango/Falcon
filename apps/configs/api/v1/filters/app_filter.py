from django_filters import rest_framework as filters
from apps.configs.models import RegisteredApp, AppDependency

class RegisteredAppFilter(filters.FilterSet):
    name = filters.ChoiceFilter(choices=RegisteredApp.APP_CHOICES)
    display_name = filters.CharFilter(lookup_expr='icontains')
    is_registered = filters.BooleanFilter(field_name='is_registered')
    is_critical = filters.BooleanFilter(field_name='is_critical')
    recovery_priority = filters.ChoiceFilter(choices=RegisteredApp.PRIORITY_CHOICES)
    rpo_minutes_min = filters.NumberFilter(field_name='rpo_minutes', lookup_expr='gte')
    rpo_minutes_max = filters.NumberFilter(field_name='rpo_minutes', lookup_expr='lte')
    rto_minutes_min = filters.NumberFilter(field_name='rto_minutes', lookup_expr='gte')
    rto_minutes_max = filters.NumberFilter(field_name='rto_minutes', lookup_expr='lte')
    has_backup_policy = filters.BooleanFilter(method='filter_has_backup_policy')
    has_dr_plan = filters.BooleanFilter(method='filter_has_dr_plan')
    def filter_has_backup_policy(self, queryset, name, value):
        if value:
            return queryset.filter(backup_policy__isnull=False)
        return queryset.filter(backup_policy__isnull=True)
    def filter_has_dr_plan(self, queryset, name, value):
        if value:
            return queryset.filter(dr_plans__isnull=False)
        return queryset.filter(dr_plans__isnull=True)
    class Meta:
        model = RegisteredApp
        fields = ['name', 'is_registered', 'is_critical', 'recovery_priority']

class AppDependencyFilter(filters.FilterSet):
    source_app_name = filters.CharFilter(field_name='source_app__name', lookup_expr='exact')
    target_app_name = filters.CharFilter(field_name='target_app__name', lookup_expr='exact')
    dependency_type = filters.ChoiceFilter(choices=AppDependency.DEPENDENCY_TYPE_CHOICES)
    source_is_critical = filters.BooleanFilter(field_name='source_app__is_critical')
    target_is_critical = filters.BooleanFilter(field_name='target_app__is_critical')
    class Meta:
        model = AppDependency
        fields = ['dependency_type']