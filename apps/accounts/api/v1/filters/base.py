from django_filters import rest_framework as filters
from django.utils import timezone

class BaseFilter(filters.FilterSet):
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_at = filters.DateTimeFilter(field_name='updated_at', lookup_expr='gte')
    updated_before = filters.DateTimeFilter(field_name='updated_at', lookup_expr='lte')
    class Meta:
        abstract = True

class DateRangeFilter(filters.FilterSet):
    start_date = filters.DateFilter(method='filter_start_date')
    end_date = filters.DateFilter(method='filter_end_date')

    def filter_start_date(self, queryset, name, value):
        return queryset.filter(created_at__date__gte=value)
    def filter_end_date(self, queryset, name, value):
        return queryset.filter(created_at__date__lte=value)
    
    class Meta:
        abstract = True

class SearchFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    def filter_search(self, queryset, name, value):
        return self._apply_search(queryset, value)
    def _apply_search(self, queryset, value):
        return queryset
    class Meta:
        abstract = True

class OrderingFilter(filters.OrderingFilter):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('fields', [])
        super().__init__(*args, **kwargs)