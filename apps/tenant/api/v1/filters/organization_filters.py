import django_filters
from django.db import models
from apps.tenant.models import Organization
from apps.tenant.constants import OrganizationStatus


class OrganizationFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    slug = django_filters.CharFilter(lookup_expr='icontains')
    contact_email = django_filters.CharFilter(lookup_expr='icontains')
    sector_id = django_filters.UUIDFilter(field_name='sector__id')
    sector_type = django_filters.CharFilter(field_name='sector__sector_type')
    status = django_filters.ChoiceFilter(choices=OrganizationStatus.choices)
    is_active = django_filters.BooleanFilter()
    is_onboarded = django_filters.BooleanFilter()
    subscription_tier = django_filters.CharFilter(lookup_expr='icontains')
    created_at_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Organization
        fields = [
            'name', 'slug', 'contact_email', 'sector_id', 'sector_type',
            'status', 'is_active', 'is_onboarded', 'subscription_tier',
        ]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(name__icontains=value) |
            models.Q(slug__icontains=value) |
            models.Q(contact_email__icontains=value)
        )

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        ordering = self.data.get('ordering')
        if ordering:
            if ordering.startswith('-'):
                queryset = queryset.order_by(ordering)
            else:
                queryset = queryset.order_by(ordering)
        return queryset