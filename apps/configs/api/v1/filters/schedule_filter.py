from django.db import models
from django_filters import rest_framework as filters
from apps.configs.models import Schedule

class ScheduleFilter(filters.FilterSet):
    schedule_type = filters.ChoiceFilter(choices=Schedule.SCHEDULE_TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=Schedule.STATUS_CHOICES)
    weekday_only = filters.BooleanFilter(field_name='weekday_only')
    is_disaster_override = filters.BooleanFilter(field_name='is_disaster_override')
    next_run_after = filters.DateTimeFilter(field_name='next_run_at', lookup_expr='gte')
    next_run_before = filters.DateTimeFilter(field_name='next_run_at', lookup_expr='lte')
    last_run_status = filters.CharFilter(field_name='last_run_status', lookup_expr='icontains')
    failed = filters.BooleanFilter(method='filter_failed')
    def filter_failed(self, queryset, name, value):
        if value:
            return queryset.filter(failure_count__gte=models.F('max_consecutive_failures'))
        return queryset.filter(failure_count__lt=models.F('max_consecutive_failures'))
    class Meta:
        model = Schedule
        fields = ['schedule_type', 'status', 'weekday_only', 'is_disaster_override']