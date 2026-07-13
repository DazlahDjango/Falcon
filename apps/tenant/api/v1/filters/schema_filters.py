import django_filters
from apps.tenant.models import OrganizationSchema


class SchemaFilter(django_filters.FilterSet):
    schema_name = django_filters.CharFilter(lookup_expr='icontains')
    organization_id = django_filters.UUIDFilter(field_name='organization__id')
    organization_name = django_filters.CharFilter(field_name='organization__name', lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=OrganizationSchema.SCHEMA_STATUS)
    is_ready = django_filters.BooleanFilter()

    class Meta:
        model = OrganizationSchema
        fields = [
            'schema_name', 'organization_id', 'status', 'is_ready',
        ]