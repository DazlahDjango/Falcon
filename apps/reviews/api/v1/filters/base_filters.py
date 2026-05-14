# apps/reviews/api/v1/filters/base_filters.py
"""
Base filter classes for Reviews API
"""

import django_filters
from django_filters import rest_framework as filters
from django.db import models


class TenantFilter(filters.FilterSet):
    """
    Base filter that ensures tenant isolation.
    Automatically filters by tenant from request.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = kwargs.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            tenant = getattr(request, 'tenant', request.user.tenant)
            if tenant and hasattr(self.Meta.model, 'tenant'):
                self.queryset = self.queryset.filter(tenant=tenant)
    
    class Meta:
        abstract = True


class DateRangeFilter(filters.FilterSet):
    """
    Base filter for date range filtering.
    Provides created_after, created_before, updated_after, updated_before.
    """
    
    created_after = filters.DateFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text="Filter by created date (after or equal)"
    )
    
    created_before = filters.DateFilter(
        field_name='created_at',
        lookup_expr='lte',
        help_text="Filter by created date (before or equal)"
    )
    
    updated_after = filters.DateFilter(
        field_name='updated_at',
        lookup_expr='gte',
        help_text="Filter by updated date (after or equal)"
    )
    
    updated_before = filters.DateFilter(
        field_name='updated_at',
        lookup_expr='lte',
        help_text="Filter by updated date (before or equal)"
    )
    
    class Meta:
        abstract = True


class StatusFilter(filters.FilterSet):
    """
    Base filter for status filtering.
    """
    
    status = filters.ChoiceFilter(
        choices=[],
        help_text="Filter by status"
    )
    
    not_status = filters.ChoiceFilter(
        field_name='status',
        lookup_expr='ne',
        choices=[],
        help_text="Exclude by status"
    )
    
    class Meta:
        abstract = True


class SearchFilter(filters.FilterSet):
    """
    Base filter for search functionality.
    """
    
    search = filters.CharFilter(
        method='filter_search',
        help_text="Search across multiple fields"
    )
    
    def filter_search(self, queryset, name, value):
        """
        Override this method in child classes to define search fields.
        """
        return queryset