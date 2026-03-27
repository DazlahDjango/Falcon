import django_filters
from apps.accounts.models import MFADevice
from .base import BaseFilter

class MFADeviceFilter(BaseFilter):
    device_type = django_filters.ChoiceFilter(choices=MFADevice.DEVICE_CHOICES)
    is_active = django_filters.BooleanFilter()
    is_primary = django_filters.BooleanFilter()
    is_verified = django_filters.BooleanFilter()
    user_id = django_filters.UUIDFilter(field_name='user__id')
    tenant_id = django_filters.UUIDFilter(field_name='tenant_id')
    is_locked = django_filters.BooleanFilter(method='filter_is_locked')
    
    class Meta:
        model = MFADevice
        fields = [
            'device_type', 'is_active', 'is_primary', 'is_verified',
            'user_id', 'tenant_id'
        ]
    
    def filter_is_locked(self, queryset, name, value):
        """Filter locked devices."""
        from django.utils import timezone
        if value:
            return queryset.filter(locked_until__gt=timezone.now())
        return queryset.exclude(locked_until__gt=timezone.now())