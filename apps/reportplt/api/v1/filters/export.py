# apps/reportplt/api/v1/filters/export.py
from typing import Optional
from django_filters import rest_framework as filters
from apps.reportplt.models import ReportExport
from apps.reportplt.constants import ReportFormat
from .base import BaseFilter

class ExportFilter(BaseFilter):
    """
    Filter for Export model.
    """
    format = filters.ChoiceFilter(choices=ReportFormat.CHOICES)
    status = filters.ChoiceFilter(choices=[
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    report_id = filters.UUIDFilter()
    exported_by_id = filters.UUIDFilter()
    file_name = filters.CharFilter(lookup_expr='icontains')
    mime_type = filters.CharFilter(lookup_expr='icontains')
    is_compressed = filters.BooleanFilter()
    is_encrypted = filters.BooleanFilter()
    password_protected = filters.BooleanFilter()
    has_watermark = filters.BooleanFilter()
    delivered_via = filters.CharFilter(lookup_expr='icontains')
    delivered_at = filters.DateFromToRangeFilter()
    created_at = filters.DateFromToRangeFilter()
    updated_at = filters.DateFromToRangeFilter()
    expires_at = filters.DateFromToRangeFilter()
    download_count = filters.RangeFilter()
    file_size = filters.RangeFilter()
    page_count = filters.RangeFilter()
    
    class Meta:
        model = ReportExport
        fields = [
            'format', 'status', 'report_id', 'exported_by_id',
            'file_name', 'mime_type', 'is_compressed', 'is_encrypted',
            'password_protected', 'has_watermark', 'delivered_via',
            'delivered_at', 'created_at', 'updated_at', 'expires_at',
            'download_count', 'file_size', 'page_count'
        ]

class ExportOrderingFilter(filters.OrderingFilter):
    """
    Custom ordering filter for exports.
    """
    fields = (
        'format', 'status', 'file_name', 'file_size',
        'download_count', 'created_at', 'updated_at', 'expires_at'
    )

class ExportFileFilter(filters.FilterSet):
    """
    File-specific filter for exports.
    """
    file_size_min = filters.NumberFilter(field_name='file_size', lookup_expr='gte')
    file_size_max = filters.NumberFilter(field_name='file_size', lookup_expr='lte')
    page_count_min = filters.NumberFilter(field_name='page_count', lookup_expr='gte')
    page_count_max = filters.NumberFilter(field_name='page_count', lookup_expr='lte')
    
    class Meta:
        model = ReportExport
        fields = ['file_size_min', 'file_size_max', 'page_count_min', 'page_count_max']