# apps/reportplt/api/v1/filters/audit.py
from typing import Optional
from django_filters import rest_framework as filters
from apps.reportplt.models import ReportAudit
from apps.reportplt.constants import AuditAction
from .base import BaseFilter

class AuditFilter(BaseFilter):
    """
    Filter for Audit model.
    """
    action = filters.ChoiceFilter(choices=AuditAction.CHOICES)
    report_id = filters.UUIDFilter()
    dashboard_id = filters.UUIDFilter()
    user_id = filters.UUIDFilter()
    user__email = filters.CharFilter(lookup_expr='icontains')
    ip_address = filters.CharFilter(lookup_expr='icontains')
    session_id = filters.CharFilter(lookup_expr='icontains')
    success = filters.BooleanFilter()
    created_at = filters.DateFromToRangeFilter()
    updated_at = filters.DateFromToRangeFilter()
    duration = filters.RangeFilter()
    details = filters.CharFilter(method='filter_details')
    error_message = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = ReportAudit
        fields = [
            'action', 'report_id', 'dashboard_id', 'user_id',
            'ip_address', 'session_id', 'success', 'created_at',
            'updated_at', 'duration', 'error_message'
        ]
    
    def filter_details(self, queryset, name, value):
        if value:
            return queryset.filter(details__icontains=value)
        return queryset

class AuditOrderingFilter(filters.OrderingFilter):
    """
    Custom ordering filter for audit logs.
    """
    fields = (
        'action', 'user_id', 'ip_address', 'created_at',
        'updated_at', 'duration', 'success'
    )

class AuditDateRangeFilter(filters.FilterSet):
    """
    Date range specific filter for audit logs.
    """
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = ReportAudit
        fields = ['created_after', 'created_before']

class AuditActionFilter(filters.FilterSet):
    """
    Action-specific filter for audit logs.
    """
    action_in = filters.CharFilter(method='filter_action_in')
    action_not = filters.CharFilter(method='filter_action_not')
    
    def filter_action_in(self, queryset, name, value):
        if value:
            actions = value.split(',')
            return queryset.filter(action__in=actions)
        return queryset
    
    def filter_action_not(self, queryset, name, value):
        if value:
            actions = value.split(',')
            return queryset.exclude(action__in=actions)
        return queryset
    
    class Meta:
        model = ReportAudit
        fields = ['action_in', 'action_not']