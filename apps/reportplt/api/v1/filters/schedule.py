# apps/reportplt/api/v1/filters/schedule.py
from typing import Optional
from django_filters import rest_framework as filters
from apps.reportplt.models import ReportSchedule
from apps.reportplt.constants import ScheduleFrequency
from .base import BaseFilter

class ScheduleFilter(BaseFilter):
    """
    Filter for Schedule model.
    """
    frequency = filters.ChoiceFilter(choices=ScheduleFrequency.CHOICES)
    status = filters.ChoiceFilter(choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    is_active = filters.BooleanFilter()
    is_paused = filters.BooleanFilter()
    report_id = filters.UUIDFilter()
    owner_id = filters.UUIDFilter()
    name = filters.CharFilter(lookup_expr='icontains')
    recipients = filters.CharFilter(lookup_expr='icontains')
    next_run_at = filters.DateFromToRangeFilter()
    last_run_at = filters.DateFromToRangeFilter()
    created_at = filters.DateFromToRangeFilter()
    updated_at = filters.DateFromToRangeFilter()
    expires_at = filters.DateFromToRangeFilter()
    retry_count = filters.RangeFilter()
    
    class Meta:
        model = ReportSchedule
        fields = [
            'frequency', 'status', 'is_active', 'is_paused',
            'report_id', 'owner_id', 'name', 'next_run_at',
            'last_run_at', 'created_at', 'updated_at', 'expires_at',
            'retry_count'
        ]

class ScheduleOrderingFilter(filters.OrderingFilter):
    """
    Custom ordering filter for schedules.
    """
    fields = (
        'name', 'frequency', 'status', 'next_run_at',
        'last_run_at', 'created_at', 'retry_count'
    )

class ScheduleDateRangeFilter(filters.FilterSet):
    """
    Date range specific filter for schedules.
    """
    next_run_after = filters.DateTimeFilter(field_name='next_run_at', lookup_expr='gte')
    next_run_before = filters.DateTimeFilter(field_name='next_run_at', lookup_expr='lte')
    last_run_after = filters.DateTimeFilter(field_name='last_run_at', lookup_expr='gte')
    last_run_before = filters.DateTimeFilter(field_name='last_run_at', lookup_expr='lte')
    
    class Meta:
        model = ReportSchedule
        fields = ['next_run_after', 'next_run_before', 'last_run_after', 'last_run_before']