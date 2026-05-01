from django_filters import rest_framework as filters
from django.db import models
from ....models.department import Department

class DepartmentFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    code = filters.CharFilter(lookup_expr='iexact')
    code_contains = filters.CharFilter(field_name='code', lookup_expr='icontains')
    parent_id = filters.UUIDFilter(field_name='parent__id')
    parent_code = filters.CharFilter(field_name='parent__code', lookup_expr='iexact')
    has_parent = filters.BooleanFilter(field_name='parent', lookup_expr='isnull', exclude=True)
    is_root = filters.BooleanFilter(field_name='parent', lookup_expr='isnull')
    depth = filters.NumberFilter()
    depth_gte = filters.NumberFilter(field_name='depth', lookup_expr='gte')
    depth_lte = filters.NumberFilter(field_name='depth', lookup_expr='lte')
    path_startswith = filters.CharFilter(field_name='path', lookup_expr='startswith')
    sensitivity_level = filters.ChoiceFilter(choices=Department.SENSITIVITY_CHOICES)
    is_active = filters.BooleanFilter()
    headcount_limit_min = filters.NumberFilter(field_name='headcount_limit', lookup_expr='gte')
    headcount_limit_max = filters.NumberFilter(field_name='headcount_limit', lookup_expr='lte')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_after = filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'parent_id', 'depth', 'sensitivity_level',
            'is_active', 'is_deleted', 'tenant_id'
        ]
    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        
        if hasattr(self, 'request') and hasattr(self.request, 'user'):
            tenant_id = getattr(self.request.user, 'tenant_id', None)
            if tenant_id:
                queryset = queryset.filter(tenant_id=tenant_id)
        
        return queryset

class DepartmentTreeFilter(filters.FilterSet):
    max_depth = filters.NumberFilter(method='filter_max_depth')
    include_inactive = filters.BooleanFilter(method='filter_include_inactive')
    def filter_max_depth(self, queryset, name, value):
        if value:
            return queryset.filter(depth__lte=value)
        return queryset
    def filter_include_inactive(self, queryset, name, value):
        if value is False:
            return queryset.filter(is_active=True)
        return queryset
    class Meta:
        model = Department
        fields = ['tenant_id', 'is_active', 'sensitivity_level']