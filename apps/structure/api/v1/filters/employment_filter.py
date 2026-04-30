from django_filters import rest_framework as filters
from django.db import models
from ....models.employment import Employment

class EmploymentFilter(filters.FilterSet):
    user_id = filters.UUIDFilter()
    user_ids = filters.BaseInFilter(field_name='user_id', lookup_expr='in')
    position_id = filters.UUIDFilter()
    position_code = filters.CharFilter(field_name='position__job_code', lookup_expr='iexact')
    department_id = filters.UUIDFilter()
    department_code = filters.CharFilter(field_name='department__code', lookup_expr='iexact')
    team_id = filters.UUIDFilter()
    team_code = filters.CharFilter(field_name='team__code', lookup_expr='iexact')
    employment_type = filters.ChoiceFilter(choices=Employment.EMPLOYMENT_TYPE_CHOICES)
    is_current = filters.BooleanFilter()
    is_manager = filters.BooleanFilter()
    is_executive = filters.BooleanFilter()
    is_board_member = filters.BooleanFilter()
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
        model = Employment
        fields = [
            'id', 'user_id', 'position_id', 'department_id', 'team_id',
            'employment_type', 'is_current', 'is_manager', 'is_executive',
            'is_board_member', 'is_active', 'tenant_id'
        ]

class EmploymentCurrentFilter(filters.FilterSet):
    user_id = filters.UUIDFilter()
    department_id = filters.UUIDFilter()
    team_id = filters.UUIDFilter()
    is_manager = filters.BooleanFilter()
    is_executive = filters.BooleanFilter()
    class Meta:
        model = Employment
        fields = ['user_id', 'department_id', 'team_id', 'is_manager', 'is_executive']
    def filter_queryset(self, queryset):
        return queryset.filter(is_current=True, is_active=True, is_deleted=False)