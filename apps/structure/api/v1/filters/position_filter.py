from django_filters import rest_framework as filters
from django.db import models
from ....models.position import Position

class PositionFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr='icontains')
    job_code = filters.CharFilter(lookup_expr='iexact')
    job_code_contains = filters.CharFilter(field_name='job_code', lookup_expr='icontains')
    grade = filters.CharFilter(lookup_expr='iexact')
    grade_in = filters.BaseInFilter(field_name='grade', lookup_expr='in')
    level = filters.NumberFilter()
    level_gte = filters.NumberFilter(field_name='level', lookup_expr='gte')
    level_lte = filters.NumberFilter(field_name='level', lookup_expr='lte')
    level_range = filters.RangeFilter(field_name='level')
    reports_to_id = filters.UUIDFilter()
    reports_to_code = filters.CharFilter(field_name='reports_to__job_code', lookup_expr='iexact')
    has_reports_to = filters.BooleanFilter(field_name='reports_to', lookup_expr='isnull', exclude=True)
    default_department_id = filters.UUIDFilter()
    is_single_incumbent = filters.BooleanFilter()
    is_vacant = filters.BooleanFilter(method='filter_vacant')
    is_over_occupied = filters.BooleanFilter(method='filter_over_occupied')
    current_incumbents_count_min = filters.NumberFilter(field_name='current_incumbents_count', lookup_expr='gte')
    current_incumbents_count_max = filters.NumberFilter(field_name='current_incumbents_count', lookup_expr='lte')
    default_reporting_type = filters.ChoiceFilter(choices=Position.RELATIONSHIP_TYPE_CHOICES)
    def filter_vacant(self, queryset, name, value):
        if value:
            return queryset.filter(current_incumbents_count=0)
        return queryset
    def filter_over_occupied(self, queryset, name, value):
        if value:
            from django.db.models import F
            return queryset.filter(
                models.Q(max_incumbents__isnull=False) & 
                models.Q(current_incumbents_count__gt=F('max_incumbents'))
            )
        return queryset
    class Meta:
        model = Position
        fields = [
            'id', 'job_code', 'title', 'grade', 'level', 'reports_to_id',
            'default_department_id', 'is_single_incumbent', 'default_reporting_type',
            'tenant_id', 'is_deleted'
        ]