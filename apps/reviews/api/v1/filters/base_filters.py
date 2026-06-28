import django_filters
from django_filters import rest_framework as filters
from django.db import models
from django.utils import timezone

class TenantFilter(filters.FilterSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = kwargs.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            tenant_id = getattr(request, 'tenant_id', None) or getattr(request.user, 'tenant_id', None)
            if tenant_id and hasattr(self.Meta.model, 'tenant_id'):
                self.queryset = self.queryset.filter(tenant_id=tenant_id)
    class Meta:
        abstract = True

class DateRangeFilter(filters.FilterSet):
    created_after = filters.DateFilter(field_name='created_at', lookup_expr='gte', help_text="Filter by created date (after or equal)")
    created_before = filters.DateFilter(field_name='created_at', lookup_expr='lte', help_text="Filter by created date (before or equal)")
    updated_after = filters.DateFilter(field_name='updated_at', lookup_expr='gte', help_text="Filter by updated date (after or equal)")
    updated_before = filters.DateFilter(field_name='updated_at', lookup_expr='lte', help_text="Filter by updated date (before or equal)")
    class Meta:
        abstract = True

class StatusFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=[], help_text="Filter by status")
    not_status = filters.ChoiceFilter(field_name='status', lookup_expr='ne', choices=[], help_text="Exclude by status")
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self.Meta.model, 'Status'):
            choices = self.Meta.model.Status.choices
            self.filters['status'].extra['choices'] = choices
            self.filters['not_status'].extra['choices'] = choices
    class Meta:
        abstract = True

class SearchFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search', help_text="Search across multiple fields")
    def filter_search(self, queryset, name, value):
        return queryset