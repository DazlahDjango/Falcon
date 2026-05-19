from django_filters import rest_framework as filters
from apps.configs.models import EncryptionKey
from apps.configs.constants import EncryptionKeyStatus, EncryptionKeySource

class EncryptionKeyFilter(filters.FilterSet):
    key_alias = filters.CharFilter(lookup_expr='icontains')
    key_source = filters.ChoiceFilter(choices=EncryptionKeySource.CHOICES)
    key_status = filters.ChoiceFilter(choices=EncryptionKeyStatus.CHOICES)
    is_default = filters.BooleanFilter(field_name='is_default')
    activated_after = filters.DateTimeFilter(field_name='activated_at', lookup_expr='gte')
    activated_before = filters.DateTimeFilter(field_name='activated_at', lookup_expr='lte')
    rotated_after = filters.DateTimeFilter(field_name='rotated_at', lookup_expr='gte')
    rotated_before = filters.DateTimeFilter(field_name='rotated_at', lookup_expr='lte')
    expires_after = filters.DateTimeFilter(field_name='expires_at', lookup_expr='gte')
    expires_before = filters.DateTimeFilter(field_name='expires_at', lookup_expr='lte')
    usage_count_min = filters.NumberFilter(field_name='usage_count', lookup_expr='gte')
    usage_count_max = filters.NumberFilter(field_name='usage_count', lookup_expr='lte')
    needs_rotation = filters.BooleanFilter(method='filter_needs_rotation')
    is_expired = filters.BooleanFilter(method='filter_is_expired')
    def filter_needs_rotation(self, queryset, name, value):
        from django.utils import timezone
        from datetime import timedelta
        if value:
            cutoff = timezone.now() - timedelta(days=90)
            return queryset.filter(key_status=EncryptionKeyStatus.ACTIVE, rotated_at__lt=cutoff).exclude(is_default=True)
        return queryset
    def filter_is_expired(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(expires_at__lt=timezone.now())
        return queryset.filter(expires_at__gte=timezone.now())
    class Meta:
        model = EncryptionKey
        fields = ['key_source', 'key_status', 'is_default']