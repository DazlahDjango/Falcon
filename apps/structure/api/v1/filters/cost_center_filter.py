from django_filters import rest_framework as filters
from ....models.cost_center import CostCenter

class CostCenterFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    code = filters.CharFilter(lookup_expr='iexact')
    code_contains = filters.CharFilter(field_name='code', lookup_expr='icontains')
    parent_id = filters.UUIDFilter()
    category = filters.ChoiceFilter(choices=CostCenter.CATEGORY_CHOICES)
    fiscal_year = filters.NumberFilter()
    fiscal_year_gte = filters.NumberFilter(field_name='fiscal_year', lookup_expr='gte')
    fiscal_year_lte = filters.NumberFilter(field_name='fiscal_year', lookup_expr='lte')
    is_active = filters.BooleanFilter()
    is_shared = filters.BooleanFilter()
    budget_amount_gte = filters.NumberFilter(field_name='budget_amount', lookup_expr='gte')
    budget_amount_lte = filters.NumberFilter(field_name='budget_amount', lookup_expr='lte')
    requires_budget_approval = filters.BooleanFilter()
    class Meta:
        model = CostCenter
        fields = [
            'id', 'code', 'name', 'parent_id', 'category', 'fiscal_year',
            'is_active', 'is_shared', 'requires_budget_approval', 'tenant_id'
        ]