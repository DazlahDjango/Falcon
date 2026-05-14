# apps/reviews/api/v1/filters/cycle_filters.py
"""
Filter classes for ReviewCycle model
"""

import django_filters
from django_filters import rest_framework as filters

from apps.reviews.models import ReviewCycle
from .base_filters import TenantFilter, DateRangeFilter, StatusFilter


class CycleTypeFilter(filters.FilterSet):
    """
    Filter for cycle type.
    """
    
    cycle_type = filters.ChoiceFilter(
        choices=ReviewCycle.CycleType.choices,
        help_text="Filter by cycle type (mid_year, end_year, quarterly, probation, special, pip)"
    )
    
    class Meta:
        abstract = True


class CycleStatusFilter(filters.FilterSet):
    """
    Filter for cycle status.
    """
    
    is_active_now = filters.BooleanFilter(
        method='filter_is_active_now',
        help_text="Filter cycles that are currently active (based on dates)"
    )
    
    is_upcoming = filters.BooleanFilter(
        method='filter_is_upcoming',
        help_text="Filter cycles that start in the future"
    )
    
    is_past = filters.BooleanFilter(
        method='filter_is_past',
        help_text="Filter cycles that have ended"
    )
    
    def filter_is_active_now(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.filter(
                start_date__lte=today,
                end_date__gte=today
            )
        return queryset
    
    def filter_is_upcoming(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.filter(start_date__gt=today)
        return queryset
    
    def filter_is_past(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.filter(end_date__lt=today)
        return queryset
    
    class Meta:
        abstract = True


class CycleFilter(TenantFilter, DateRangeFilter, CycleTypeFilter, CycleStatusFilter):
    """
    Complete filter set for ReviewCycle model.
    """
    
    name = filters.CharFilter(
        field_name='name',
        lookup_expr='icontains',
        help_text="Search by cycle name (case-insensitive)"
    )
    
    start_date_from = filters.DateFilter(
        field_name='start_date',
        lookup_expr='gte',
        help_text="Filter by start date (from)"
    )
    
    start_date_to = filters.DateFilter(
        field_name='start_date',
        lookup_expr='lte',
        help_text="Filter by start date (to)"
    )
    
    end_date_from = filters.DateFilter(
        field_name='end_date',
        lookup_expr='gte',
        help_text="Filter by end date (from)"
    )
    
    end_date_to = filters.DateFilter(
        field_name='end_date',
        lookup_expr='lte',
        help_text="Filter by end date (to)"
    )
    
    self_assessment_deadline_before = filters.DateFilter(
        field_name='self_assessment_deadline',
        lookup_expr='lte',
        help_text="Self-assessment deadline before this date"
    )
    
    self_assessment_deadline_after = filters.DateFilter(
        field_name='self_assessment_deadline',
        lookup_expr='gte',
        help_text="Self-assessment deadline after this date"
    )
    
    supervisor_deadline_before = filters.DateFilter(
        field_name='supervisor_review_deadline',
        lookup_expr='lte',
        help_text="Supervisor review deadline before this date"
    )
    
    supervisor_deadline_after = filters.DateFilter(
        field_name='supervisor_review_deadline',
        lookup_expr='gte',
        help_text="Supervisor review deadline after this date"
    )
    
    class Meta:
        model = ReviewCycle
        fields = [
            'id', 'name', 'cycle_type', 'status',
            'start_date', 'end_date', 'is_active_now',
            'is_upcoming', 'is_past'
        ]