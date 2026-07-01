from django_filters import rest_framework as filters
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.enums.org_level import OrgLevel


class OrgUnitFilter(filters.FilterSet):
    code = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(lookup_expr='icontains')
    level = filters.ChoiceFilter(choices=OrgLevel.choices)
    is_active = filters.BooleanFilter()
    parent = filters.UUIDFilter()
    depth = filters.NumberFilter()
    depth_gte = filters.NumberFilter(field_name='depth', lookup_expr='gte')
    depth_lte = filters.NumberFilter(field_name='depth', lookup_expr='lte')
    path_startswith = filters.CharFilter(field_name='path', lookup_expr='startswith')
    created_at_gte = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_lte = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = OrganizationalUnit
        fields = ['code', 'name', 'level', 'is_active', 'parent', 'depth']


class DivisionFilter(filters.FilterSet):
    code = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    depth = filters.NumberFilter()
    created_at_gte = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_lte = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Division
        fields = ['code', 'name', 'is_active', 'depth']


class DepartmentFilter(filters.FilterSet):
    code = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    parent = filters.UUIDFilter()
    depth = filters.NumberFilter()
    depth_gte = filters.NumberFilter(field_name='depth', lookup_expr='gte')
    depth_lte = filters.NumberFilter(field_name='depth', lookup_expr='lte')
    sensitivity_level = filters.ChoiceFilter(choices=Department.SENSITIVITY_CHOICES)
    created_at_gte = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_lte = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Department
        fields = ['code', 'name', 'is_active', 'parent', 'depth', 'sensitivity_level']


class SectionFilter(filters.FilterSet):
    code = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    parent = filters.UUIDFilter()
    depth = filters.NumberFilter()
    created_at_gte = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_lte = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Section
        fields = ['code', 'name', 'is_active', 'parent', 'depth']


class UnitFilter(filters.FilterSet):
    code = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    parent = filters.UUIDFilter()
    depth = filters.NumberFilter()
    created_at_gte = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_lte = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Unit
        fields = ['code', 'name', 'is_active', 'parent', 'depth']


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