import django_filters
from apps.tenant.models import OrganizationDomain
from django.db import models


class DomainFilter(django_filters.FilterSet):
    domain = django_filters.CharFilter(lookup_expr='icontains')
    organization_id = django_filters.UUIDFilter(field_name='organization__id')
    organization_name = django_filters.CharFilter(field_name='organization__name', lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=OrganizationDomain.DOMAIN_STATUS)
    is_primary = django_filters.BooleanFilter()
    force_https = django_filters.BooleanFilter()
    ssl_valid = django_filters.BooleanFilter(method='filter_ssl_valid')
    expiring_soon = django_filters.BooleanFilter(method='filter_expiring_soon')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = OrganizationDomain
        fields = [
            'domain', 'organization_id', 'status', 'is_primary',
            'force_https',
        ]

    def filter_ssl_valid(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(ssl_expires_at__gt=timezone.now())
        return queryset.filter(ssl_expires_at__lte=timezone.now())

    def filter_expiring_soon(self, queryset, name, value):
        from django.utils import timezone
        from datetime import timedelta
        if value:
            cutoff = timezone.now() + timedelta(days=30)
            return queryset.filter(ssl_expires_at__lte=cutoff, ssl_expires_at__gt=timezone.now())
        return queryset

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(domain__icontains=value) |
            models.Q(organization__name__icontains=value)
        )