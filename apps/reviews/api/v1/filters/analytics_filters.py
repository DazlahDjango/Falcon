# apps/reviews/api/v1/filters/analytics_filters.py
"""
Filter classes for analytics endpoints
"""

import django_filters
from django_filters import rest_framework as filters
from django.db import models
from django.utils import timezone
from datetime import timedelta


class AnalyticsDateRangeFilter(filters.FilterSet):
    """
    Filter for analytics date ranges.
    """
    
    date_from = filters.DateFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text="Filter from date (YYYY-MM-DD)"
    )
    
    date_to = filters.DateFilter(
        field_name='created_at',
        lookup_expr='lte',
        help_text="Filter to date (YYYY-MM-DD)"
    )
    
    period = filters.ChoiceFilter(
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly'),
        ],
        method='filter_by_period',
        help_text="Aggregation period"
    )
    
    def filter_by_period(self, queryset, name, value):
        """
        Filter by time period.
        """
        today = timezone.now().date()
        
        if value == 'daily':
            start_date = today
        elif value == 'weekly':
            start_date = today - timedelta(days=7)
        elif value == 'monthly':
            start_date = today - timedelta(days=30)
        elif value == 'quarterly':
            start_date = today - timedelta(days=90)
        elif value == 'yearly':
            start_date = today - timedelta(days=365)
        else:
            return queryset
        
        return queryset.filter(created_at__date__gte=start_date)
    
    class Meta:
        abstract = True


class DepartmentAnalyticsFilter(filters.FilterSet):
    """
    Filter for department analytics.
    """
    
    department_id = filters.UUIDFilter(
        field_name='id',
        help_text="Filter by specific department ID"
    )
    
    department_name = filters.CharFilter(
        field_name='name',
        lookup_expr='icontains',
        help_text="Filter by department name (partial match)"
    )
    
    min_employee_count = filters.NumberFilter(
        field_name='employee_count',
        lookup_expr='gte',
        help_text="Minimum number of employees"
    )
    
    max_employee_count = filters.NumberFilter(
        field_name='employee_count',
        lookup_expr='lte',
        help_text="Maximum number of employees"
    )
    
    min_avg_score = filters.NumberFilter(
        field_name='average_score',
        lookup_expr='gte',
        help_text="Minimum average score"
    )
    
    max_avg_score = filters.NumberFilter(
        field_name='average_score',
        lookup_expr='lte',
        help_text="Maximum average score"
    )
    
    sort_by = filters.ChoiceFilter(
        choices=[
            ('name', 'Name'),
            ('average_score', 'Average Score'),
            ('employee_count', 'Employee Count'),
        ],
        method='filter_sort_by',
        help_text="Sort results by field"
    )
    
    sort_order = filters.ChoiceFilter(
        choices=[
            ('asc', 'Ascending'),
            ('desc', 'Descending'),
        ],
        method='filter_sort_order',
        help_text="Sort order"
    )
    
    def filter_sort_by(self, queryset, name, value):
        self.sort_field = value
        return queryset
    
    def filter_sort_order(self, queryset, name, value):
        if hasattr(self, 'sort_field') and self.sort_field:
            order_by = self.sort_field if value == 'asc' else f'-{self.sort_field}'
            return queryset.order_by(order_by)
        return queryset


class ManagerAnalyticsFilter(filters.FilterSet):
    """
    Filter for manager analytics.
    """
    
    manager_id = filters.UUIDFilter(
        field_name='id',
        help_text="Filter by specific manager ID"
    )
    
    manager_name = filters.CharFilter(
        field_name='name',
        lookup_expr='icontains',
        help_text="Filter by manager name (partial match)"
    )
    
    min_team_size = filters.NumberFilter(
        field_name='team_size',
        lookup_expr='gte',
        help_text="Minimum team size"
    )
    
    max_team_size = filters.NumberFilter(
        field_name='team_size',
        lookup_expr='lte',
        help_text="Maximum team size"
    )
    
    rating_inflated = filters.BooleanFilter(
        field_name='rating_inflated',
        help_text="Filter managers who inflate ratings"
    )
    
    rating_deflated = filters.BooleanFilter(
        field_name='rating_deflated',
        help_text="Filter managers who deflate ratings"
    )
    
    min_inflation = filters.NumberFilter(
        field_name='inflation_percent',
        lookup_expr='gte',
        help_text="Minimum inflation percentage"
    )
    
    max_inflation = filters.NumberFilter(
        field_name='inflation_percent',
        lookup_expr='lte',
        help_text="Maximum inflation percentage"
    )
    
    sort_by = filters.ChoiceFilter(
        choices=[
            ('name', 'Name'),
            ('average_rating', 'Average Rating'),
            ('team_size', 'Team Size'),
            ('inflation_percent', 'Inflation Percentage'),
        ],
        method='filter_sort_by',
        help_text="Sort results by field"
    )
    
    def filter_sort_by(self, queryset, name, value):
        self.sort_field = value
        return queryset
    
    def filter_sort_order(self, queryset, name, value):
        if hasattr(self, 'sort_field') and self.sort_field:
            order_by = self.sort_field if value == 'asc' else f'-{self.sort_field}'
            return queryset.order_by(order_by)
        return queryset


class InsightsFilter(filters.FilterSet):
    """
    Filter for insights.
    """
    
    insight_type = filters.ChoiceFilter(
        choices=[
            ('positive', 'Positive'),
            ('negative', 'Negative'),
            ('warning', 'Warning'),
            ('opportunity', 'Opportunity'),
        ],
        field_name='type',
        help_text="Filter by insight type"
    )
    
    priority = filters.ChoiceFilter(
        choices=[
            ('high', 'High Priority'),
            ('medium', 'Medium Priority'),
            ('low', 'Low Priority'),
        ],
        field_name='priority',
        help_text="Filter by priority"
    )
    
    from_date = filters.DateFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text="Insights from date"
    )
    
    to_date = filters.DateFilter(
        field_name='created_at',
        lookup_expr='lte',
        help_text="Insights to date"
    )


class PredictionsFilter(filters.FilterSet):
    """
    Filter for flight risk predictions.
    """
    
    risk_level = filters.ChoiceFilter(
        choices=[
            ('high', 'High Risk'),
            ('medium', 'Medium Risk'),
            ('low', 'Low Risk'),
            ('critical', 'Critical Risk'),
        ],
        field_name='risk_level',
        help_text="Filter by risk level"
    )
    
    min_risk_score = filters.NumberFilter(
        field_name='risk_score',
        lookup_expr='gte',
        help_text="Minimum risk score"
    )
    
    max_risk_score = filters.NumberFilter(
        field_name='risk_score',
        lookup_expr='lte',
        help_text="Maximum risk score"
    )
    
    department_id = filters.UUIDFilter(
        field_name='employee__department_id',
        help_text="Filter by department"
    )
    
    has_pip = filters.BooleanFilter(
        method='filter_has_pip',
        help_text="Filter employees with active PIP"
    )
    
    def filter_has_pip(self, queryset, name, value):
        from apps.reviews.models import PIP
        
        if value:
            pips = PIP.objects.filter(status='active').values_list('employee_id', flat=True)
            return queryset.filter(employee_id__in=pips)
        return queryset