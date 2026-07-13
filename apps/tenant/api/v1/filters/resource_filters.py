import django_filters
from apps.tenant.models import OrganizationResource
from django.db import models


class ResourceFilter(django_filters.FilterSet):
    organization_id = django_filters.UUIDFilter(field_name='organization__id')
    organization_name = django_filters.CharFilter(field_name='organization__name', lookup_expr='icontains')
    resource_type = django_filters.ChoiceFilter(choices=OrganizationResource.RESOURCE_TYPES)
    is_exceeded = django_filters.BooleanFilter(method='filter_is_exceeded')
    is_warning = django_filters.BooleanFilter(method='filter_is_warning')

    class Meta:
        model = OrganizationResource
        fields = [
            'organization_id', 'resource_type',
        ]

    def filter_is_exceeded(self, queryset, name, value):
        if value:
            return queryset.filter(current_value__gte=models.F('limit_value'))
        return queryset.filter(current_value__lt=models.F('limit_value'))

    def filter_is_warning(self, queryset, name, value):
        if value:
            return queryset.filter(current_value__gte=(models.F('limit_value') * models.F('warning_threshold') / 100))
        return queryset