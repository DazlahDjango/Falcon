from django_filters import rest_framework as filters
from ....models.reporting_line import ReportingLine

class ReportingLineFilter(filters.FilterSet):
    employee_id = filters.UUIDFilter(field_name='employee__id')
    employee_user_id = filters.UUIDFilter(field_name='employee__user_id')
    manager_id = filters.UUIDFilter(field_name='manager__id')
    manager_user_id = filters.UUIDFilter(field_name='manager__user_id')
    relation_type = filters.ChoiceFilter(choices=ReportingLine.RELATION_TYPE_CHOICES)
    relation_types = filters.BaseInFilter(field_name='relation_type', lookup_expr='in')
    is_active = filters.BooleanFilter()
    can_approve_kpi = filters.BooleanFilter()
    can_conduct_review = filters.BooleanFilter()
    reporting_weight_gte = filters.NumberFilter(field_name='reporting_weight', lookup_expr='gte')
    reporting_weight_lte = filters.NumberFilter(field_name='reporting_weight', lookup_expr='lte')
    effective_from_gte = filters.DateFilter(field_name='effective_from', lookup_expr='gte')
    effective_from_lte = filters.DateFilter(field_name='effective_from', lookup_expr='lte')
    effective_to_gte = filters.DateFilter(field_name='effective_to', lookup_expr='gte')
    effective_to_lte = filters.DateFilter(field_name='effective_to', lookup_expr='lte')
    active_on_date = filters.DateFilter(method='filter_active_on_date')
    def filter_active_on_date(self, queryset, name, value):
        from django.db import models
        if value:
            return queryset.filter(
                effective_from__lte=value,
                is_active=True
            ).filter(
                models.Q(effective_to__isnull=True) | models.Q(effective_to__gte=value)
            )
        return queryset
    class Meta:
        model = ReportingLine
        fields = [
            'id', 'employee_id', 'manager_id', 'relation_type', 'is_active',
            'can_approve_kpi', 'can_conduct_review', 'tenant_id', 'is_deleted'
        ]