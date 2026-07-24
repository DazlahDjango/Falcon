# apps/reportplt/api/v1/filters/search.py
from typing import Optional, List
from django.db import models
from django.db.models import Q
from rest_framework.filters import BaseFilterBackend
from apps.reportplt.models import Report, ReportDashboard, ReportTemplate

class ReportSearchFilter(BaseFilterBackend):
    """
    Comprehensive search filter for reports.
    """
    
    def filter_queryset(self, request, queryset, view):
        search_term = request.query_params.get('search', '').strip()
        if not search_term:
            return queryset
        q_objects = []
        search_fields = [
            'name', 'description', 'report_type', 'category',
            'status', 'owner__email', 'owner__first_name', 'owner__last_name'
        ]
        for field in search_fields:
            q_objects.append(Q(**{f"{field}__icontains": search_term}))
        q_objects.append(Q(tags__icontains=search_term))
        return queryset.filter(Q(*q_objects, connector=Q.OR))

class DashboardSearchFilter(BaseFilterBackend):
    """
    Comprehensive search filter for dashboards.
    """
    
    def filter_queryset(self, request, queryset, view):
        search_term = request.query_params.get('search', '').strip()
        if not search_term:
            return queryset
        q_objects = []
        search_fields = [
            'name', 'description', 'dashboard_type',
            'owner__email', 'owner__first_name', 'owner__last_name'
        ]
        for field in search_fields:
            q_objects.append(Q(**{f"{field}__icontains": search_term}))
        q_objects.append(Q(tags__icontains=search_term))
        return queryset.filter(Q(*q_objects, connector=Q.OR))

class TemplateSearchFilter(BaseFilterBackend):
    """
    Comprehensive search filter for templates.
    """
    
    def filter_queryset(self, request, queryset, view):
        search_term = request.query_params.get('search', '').strip()
        if not search_term:
            return queryset
        q_objects = []
        search_fields = [
            'name', 'description', 'template_type', 'category', 'sector',
            'owner__email', 'owner__first_name', 'owner__last_name'
        ]
        for field in search_fields:
            q_objects.append(Q(**{f"{field}__icontains": search_term}))
        q_objects.append(Q(applicable_industries__icontains=search_term))
        return queryset.filter(Q(*q_objects, connector=Q.OR))

class AdvancedSearchFilter(BaseFilterBackend):
    """
    Advanced search filter with field-specific operators.
    """
    
    def filter_queryset(self, request, queryset, view):
        search_params = {}
        for key, value in request.query_params.items():
            if key.startswith('search_'):
                field = key.replace('search_', '')
                if value:
                    search_params[field] = value
        if not search_params:
            return queryset
        q_objects = []
        for field, value in search_params.items():
            if '__' in field:
                q_objects.append(Q(**{field: value}))
            else:
                q_objects.append(Q(**{f"{field}__icontains": value}))
        return queryset.filter(Q(*q_objects, connector=Q.AND))

class GlobalSearchFilter(BaseFilterBackend):
    """
    Global search across multiple models.
    """
    
    def filter_queryset(self, request, queryset, view):
        search_term = request.query_params.get('global_search', '').strip()
        if not search_term:
            return queryset
        model = queryset.model
        search_fields = self._get_search_fields(model)
        q_objects = []
        for field in search_fields:
            q_objects.append(Q(**{f"{field}__icontains": search_term}))
        return queryset.filter(Q(*q_objects, connector=Q.OR))
    
    def _get_search_fields(self, model) -> List[str]:
        if model == Report:
            return ['name', 'description', 'report_type', 'category', 'status']
        if model == ReportDashboard:
            return ['name', 'description', 'dashboard_type']
        if model == ReportTemplate:
            return ['name', 'description', 'template_type', 'category', 'sector']
        if model == ReportSchedule:
            return ['name']
        if model == ReportExport:
            return ['file_name', 'format']
        if model == ReportAudit:
            return ['action', 'ip_address']
        return ['name']