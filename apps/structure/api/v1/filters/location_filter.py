from django_filters import rest_framework as filters
from apps.structure.models.location import Location

class LocationFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    code = filters.CharFilter(lookup_expr='iexact')
    type = filters.ChoiceFilter(choices=Location.TYPE_CHOICES)
    organizational_unit_id = filters.UUIDFilter()
    parent_id = filters.UUIDFilter()
    city = filters.CharFilter(lookup_expr='icontains')
    country = filters.CharFilter(lookup_expr='iexact')
    country_contains = filters.CharFilter(field_name='country', lookup_expr='icontains')
    is_headquarters = filters.BooleanFilter()
    is_active = filters.BooleanFilter()
    timezone = filters.CharFilter(lookup_expr='iexact')
    seating_capacity_gte = filters.NumberFilter(field_name='seating_capacity', lookup_expr='gte')
    seating_capacity_lte = filters.NumberFilter(field_name='seating_capacity', lookup_expr='lte')
    
    class Meta:
        model = Location
        fields = [
            'id', 'code', 'name', 'type', 'organizational_unit_id', 'parent_id',
            'city', 'country', 'is_headquarters', 'is_active', 'timezone',
            'tenant_id'
        ]