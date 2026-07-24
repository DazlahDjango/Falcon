# apps/reportplt/api/v1/filters/report.py
from typing import Optional
from django.db import models
from django_filters import rest_framework as filters
from apps.reportplt.models import Report
from apps.reportplt.constants import ReportType, ReportStatus, ReportCategory
from .base import BaseFilter

class ReportFilter(BaseFilter):
    """
    Filter for Report model.
    """
    report_type = filters.ChoiceFilter(choices=ReportType.CHOICES)
    status = filters.ChoiceFilter(choices=ReportStatus.CHOICES)
    category = filters.ChoiceFilter(choices=ReportCategory.CHOICES)
    name = filters.CharFilter(lookup_expr='icontains')
    description = filters.CharFilter(lookup_expr='icontains')
    is_published = filters.BooleanFilter()
    is_archived = filters.BooleanFilter()
    is_public = filters.BooleanFilter()
    is_scheduled = filters.BooleanFilter()
    is_system = filters.BooleanFilter()
    needs_refresh = filters.BooleanFilter()
    owner_id = filters.UUIDFilter()
    created_by_id = filters.UUIDFilter()
    owner__email = filters.CharFilter(lookup_expr='icontains')
    created_at = filters.DateFromToRangeFilter()
    updated_at = filters.DateFromToRangeFilter()
    last_generated_at = filters.DateFromToRangeFilter()
    tags = filters.CharFilter(method='filter_tags')
    allowed_roles = filters.CharFilter(method='filter_allowed_roles')
    
    class Meta:
        model = Report
        fields = [
            'report_type', 'status', 'category', 'name', 'description',
            'is_published', 'is_archived', 'is_public', 'is_scheduled',
            'is_system', 'needs_refresh', 'owner_id', 'created_by_id',
            'created_at', 'updated_at', 'last_generated_at'
        ]
    
    def filter_tags(self, queryset, name, value):
        if value:
            tags = value.split(',')
            for tag in tags:
                queryset = queryset.filter(tags__contains=[tag.strip()])
        return queryset
    
    def filter_allowed_roles(self, queryset, name, value):
        if value:
            roles = value.split(',')
            for role in roles:
                queryset = queryset.filter(allowed_roles__contains=[role.strip()])
        return queryset

class ReportOrderingFilter(filters.OrderingFilter):
    """
    Custom ordering filter for reports.
    """
    fields = (
        'name', 'report_type', 'status', 'category', 'created_at',
        'updated_at', 'last_generated_at', 'version'
    )

class ReportDateRangeFilter(filters.FilterSet):
    """
    Date range specific filter for reports.
    """
    created_range = filters.DateFromToRangeFilter(field_name='created_at')
    updated_range = filters.DateFromToRangeFilter(field_name='updated_at')
    generated_range = filters.DateFromToRangeFilter(field_name='last_generated_at')
    
    class Meta:
        model = Report
        fields = ['created_range', 'updated_range', 'generated_range']