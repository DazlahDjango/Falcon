import django_filters
from django.utils import timezone
from apps.accounts.models import UserSession
from .base import BaseFilter

class SessionFilter(BaseFilter):
    status = django_filters.ChoiceFilter(choices=UserSession.STATUS_CHOICES)
    device_type = django_filters.CharFilter(field_name='device_type', lookup_expr='iexact')
    mfa_verified = django_filters.BooleanFilter()
    is_trusted_device = django_filters.BooleanFilter()
    user_id = django_filters.UUIDFilter(field_name='user__id')
    tenant_id = django_filters.UUIDFilter(field_name='tenant_id')
    ip_address = django_filters.CharFilter(field_name='ip_address', lookup_expr='icontains')
    login_after = django_filters.DateTimeFilter(field_name='login_time', lookup_expr='gte')
    login_before = django_filters.DateTimeFilter(field_name='login_time', lookup_expr='lte')
    expires_after = django_filters.DateTimeFilter(field_name='expires_at', lookup_expr='gte')
    expires_before = django_filters.DateTimeFilter(field_name='expires_at', lookup_expr='lte')
    active_only = django_filters.BooleanFilter(method='filter_active_only')
    
    class Meta:
        model = UserSession
        fields = [
            'status', 'device_type', 'mfa_verified', 'is_trusted_device',
            'user_id', 'tenant_id', 'ip_address'
        ]
    
    def filter_active_only(self, queryset, name, value):
        if value:
            return queryset.filter(status='active', expires_at__gt=timezone.now())
        return queryset