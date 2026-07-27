# apps/reportplt/api/v1/filters/dashboard.py
from typing import Optional
from django_filters import rest_framework as filters
from apps.reportplt.models import ReportDashboard
from apps.reportplt.constants import DashboardType
from .base import BaseFilter

class DashboardFilter(BaseFilter):
    """
    Filter for Dashboard model.
    """
    dashboard_type = filters.ChoiceFilter(choices=DashboardType.CHOICES)
    name = filters.CharFilter(lookup_expr='icontains')
    description = filters.CharFilter(lookup_expr='icontains')
    is_default = filters.BooleanFilter()
    is_shared = filters.BooleanFilter()
    is_published = filters.BooleanFilter()
    owner_id = filters.UUIDFilter()
    allowed_roles = filters.CharFilter(method='filter_allowed_roles')
    allowed_users = filters.CharFilter(method='filter_allowed_users')
    allowed_departments = filters.CharFilter(method='filter_allowed_departments')
    tags = filters.CharFilter(method='filter_tags')
    created_at = filters.DateFromToRangeFilter()
    updated_at = filters.DateFromToRangeFilter()
    
    class Meta:
        model = ReportDashboard
        fields = [
            'dashboard_type', 'name', 'description', 'is_default',
            'is_shared', 'is_published', 'owner_id', 'created_at',
            'updated_at'
        ]
    
    def filter_allowed_roles(self, queryset, name, value):
        if value:
            roles = value.split(',')
            for role in roles:
                queryset = queryset.filter(allowed_roles__contains=[role.strip()])
        return queryset
    
    def filter_allowed_users(self, queryset, name, value):
        if value:
            users = value.split(',')
            for user_id in users:
                queryset = queryset.filter(allowed_users__contains=[user_id.strip()])
        return queryset
    
    def filter_allowed_departments(self, queryset, name, value):
        if value:
            depts = value.split(',')
            for dept in depts:
                queryset = queryset.filter(allowed_departments__contains=[dept.strip()])
        return queryset
    
    def filter_tags(self, queryset, name, value):
        if value:
            tags = value.split(',')
            for tag in tags:
                queryset = queryset.filter(tags__contains=[tag.strip()])
        return queryset

class DashboardOrderingFilter(filters.OrderingFilter):
    """
    Custom ordering filter for dashboards.
    """
    fields = (
        'name', 'dashboard_type', 'view_count', 'created_at',
        'updated_at', 'last_viewed_at'
    )