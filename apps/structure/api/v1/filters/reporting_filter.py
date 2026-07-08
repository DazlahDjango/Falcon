from django_filters import rest_framework as filters
from django.db import models
from apps.structure.models.reporting_line import ReportingLine

class ReportingLineFilter(filters.FilterSet):
    employee_id = filters.UUIDFilter(field_name='employee__id')
    employee_user_id = filters.UUIDFilter(field_name='employee__user_id')
    manager_id = filters.UUIDFilter(field_name='manager__id')
    manager_user_id = filters.UUIDFilter(field_name='manager__user_id')
    is_active = filters.BooleanFilter()
    effective_from_gte = filters.DateFilter(field_name='effective_from', lookup_expr='gte')
    effective_from_lte = filters.DateFilter(field_name='effective_from', lookup_expr='lte')
    effective_to_gte = filters.DateFilter(field_name='effective_to', lookup_expr='gte')
    effective_to_lte = filters.DateFilter(field_name='effective_to', lookup_expr='lte')
    active_on_date = filters.DateFilter(method='filter_active_on_date')
    
    def filter_active_on_date(self, queryset, name, value):
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
            'id', 'employee_id', 'manager_id', 'is_active',
            'tenant_id', 'is_deleted'
        ]