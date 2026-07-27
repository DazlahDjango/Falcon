# apps/reportplt/api/v1/filters/base.py
import operator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from django.db import models
from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.filters import BaseFilterBackend, OrderingFilter, SearchFilter

FilterSet = filters.FilterSet

class DateRangeFilter(filters.FilterSet):
    """
    Base date range filter with support for common date ranges.
    """
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')
    date_range = filters.ChoiceFilter(
        method='filter_date_range',
        choices=[
            ('today', 'Today'),
            ('yesterday', 'Yesterday'),
            ('last_7_days', 'Last 7 Days'),
            ('last_30_days', 'Last 30 Days'),
            ('this_month', 'This Month'),
            ('last_month', 'Last Month'),
            ('this_quarter', 'This Quarter'),
            ('this_year', 'This Year'),
            ('ytd', 'Year to Date'),
        ]
    )
    
    def filter_date_range(self, queryset, name, value):
        from apps.reportplt.services.filters.date_filter import DateFilter, DateRangeType
        date_filter = DateFilter()
        range_type = getattr(DateRangeType, value.upper(), None)
        if range_type:
            start, end = date_filter.get_date_range(range_type)
            if start and end:
                return queryset.filter(created_at__date__gte=start, created_at__date__lte=end)
            if start:
                return queryset.filter(created_at__date__gte=start)
        return queryset

class OrderingFilter(OrderingFilter):
    """
    Extended ordering filter with validation.
    """
    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)
        if ordering:
            try:
                return queryset.order_by(*ordering)
            except models.FieldError:
                pass
        return queryset

class SearchFilter(SearchFilter):
    """
    Extended search filter with multi-field support.
    """
    search_param = 'search'
    
    def filter_queryset(self, request, queryset, view):
        search_fields = getattr(view, 'search_fields', None)
        search_terms = self.get_search_terms(request)
        if not search_terms or not search_fields:
            return queryset
        orm_lookups = []
        for search_term in search_terms:
            queries = []
            for field in search_fields:
                lookup = self.construct_search(field)
                queries.append(Q(**{lookup: search_term}))
            orm_lookups.append(Q(*queries))
        if orm_lookups:
            queryset = queryset.filter(*orm_lookups)
        return queryset

class BaseFilter(DateRangeFilter):
    """
    Base filter class with common filtering capabilities.
    """
    is_active = filters.BooleanFilter()
    is_deleted = filters.BooleanFilter()
    
    class Meta:
        fields = ['is_active', 'is_deleted']

class FilterBackend(BaseFilterBackend):
    """
    Custom filter backend for generic filtering.
    """
    def filter_queryset(self, request, queryset, view):
        filter_class = getattr(view, 'filter_class', None)
        if filter_class:
            filter_set = filter_class(request.query_params, queryset=queryset)
            if hasattr(filter_set, 'qs'):
                return filter_set.qs
        return queryset

class TenantFilterBackend(BaseFilterBackend):
    """
    Filter backend for tenant isolation.
    """
    def filter_queryset(self, request, queryset, view):
        if hasattr(queryset.model, 'tenant_id') and hasattr(request, 'tenant_id'):
            return queryset.filter(tenant_id=request.tenant_id)
        if hasattr(queryset.model, 'tenant_id') and hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                return queryset.filter(tenant_id=request.user.tenant_id)
        return queryset