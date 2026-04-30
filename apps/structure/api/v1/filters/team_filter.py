from django_filters import rest_framework as filters
from ....models.team import Team

class TeamFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    code = filters.CharFilter(lookup_expr='iexact')
    code_contains = filters.CharFilter(field_name='code', lookup_expr='icontains')
    department_id = filters.UUIDFilter(field_name='department__id')
    department_code = filters.CharFilter(field_name='department__code', lookup_expr='iexact')
    parent_team_id = filters.UUIDFilter(field_name='parent_team__id')
    has_parent = filters.BooleanFilter(field_name='parent_team', lookup_expr='isnull', exclude=True)
    is_root = filters.BooleanFilter(field_name='parent_team', lookup_expr='isnull')
    team_lead = filters.UUIDFilter()
    has_team_lead = filters.BooleanFilter(field_name='team_lead', lookup_expr='isnull', exclude=True)
    is_active = filters.BooleanFilter()
    max_members_min = filters.NumberFilter(field_name='max_members', lookup_expr='gte')
    max_members_max = filters.NumberFilter(field_name='max_members', lookup_expr='lte')
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'code', 'department_id', 'parent_team_id',
            'team_lead', 'is_active', 'is_deleted', 'tenant_id'
        ]

class TeamHierarchyFilter(filters.FilterSet):
    max_depth = filters.NumberFilter(method='filter_max_depth')
    include_inactive = filters.BooleanFilter(method='filter_include_inactive')
    include_members = filters.BooleanFilter(method='filter_include_members')
    def filter_max_depth(self, queryset, name, value):
        if value:
            return queryset.filter(depth__lte=value) if hasattr(queryset.model, 'depth') else queryset
        return queryset
    def filter_include_inactive(self, queryset, name, value):
        if value is False:
            return queryset.filter(is_active=True)
        return queryset
    def filter_include_members(self, queryset, name, value):
        return queryset
    class Meta:
        model = Team
        fields = ['tenant_id', 'department_id', 'is_active']