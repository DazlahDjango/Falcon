# apps/reportplt/api/v1/filters/template.py
from typing import Optional
from django_filters import rest_framework as filters
from apps.reportplt.models import ReportTemplate
from apps.reportplt.constants import TemplateType, SectorType
from .base import BaseFilter

class TemplateFilter(BaseFilter):
    """
    Filter for Template model.
    """
    template_type = filters.ChoiceFilter(choices=TemplateType.CHOICES)
    category = filters.CharFilter(lookup_expr='icontains')
    sector = filters.ChoiceFilter(choices=SectorType.CHOICES)
    name = filters.CharFilter(lookup_expr='icontains')
    description = filters.CharFilter(lookup_expr='icontains')
    is_system = filters.BooleanFilter()
    is_published = filters.BooleanFilter()
    is_default = filters.BooleanFilter()
    is_popular = filters.BooleanFilter()
    has_prebuilt_charts = filters.BooleanFilter()
    has_dynamic_filters = filters.BooleanFilter()
    has_parameters = filters.BooleanFilter()
    owner_id = filters.UUIDFilter()
    applicable_industries = filters.CharFilter(method='filter_applicable_industries')
    created_at = filters.DateFromToRangeFilter()
    updated_at = filters.DateFromToRangeFilter()
    
    class Meta:
        model = ReportTemplate
        fields = [
            'template_type', 'category', 'sector', 'name', 'description',
            'is_system', 'is_published', 'is_default', 'is_popular',
            'has_prebuilt_charts', 'has_dynamic_filters', 'has_parameters',
            'owner_id', 'created_at', 'updated_at'
        ]
    
    def filter_applicable_industries(self, queryset, name, value):
        if value:
            industries = value.split(',')
            for industry in industries:
                queryset = queryset.filter(applicable_industries__contains=[industry.strip()])
        return queryset

class TemplateOrderingFilter(filters.OrderingFilter):
    """
    Custom ordering filter for templates.
    """
    fields = (
        'name', 'template_type', 'sector', 'version',
        'created_at', 'updated_at'
    )