import django_filters
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.accounts.constants import UserRoles
from .base import BaseFilter, SearchFilter, OrderingFilter

class UserFilter(BaseFilter, SearchFilter):
    role = django_filters.ChoiceFilter(choices=UserRoles.CHOICES)
    is_active = django_filters.BooleanFilter()
    is_verified = django_filters.BooleanFilter()
    is_onboarded = django_filters.BooleanFilter()
    mfa_enabled = django_filters.BooleanFilter()
    joined_after = django_filters.DateFilter(field_name='joined_at', lookup_expr='gte')
    joined_before = django_filters.DateFilter(field_name='joined_at', lookup_expr='lte')
    last_login_after = django_filters.DateTimeFilter(field_name='last_login', lookup_expr='gte')
    last_login_before = django_filters.DateTimeFilter(field_name='last_login', lookup_expr='lte')
    manager_id = django_filters.UUIDFilter(field_name='manager__id')
    # department_id = django_filters.UUIDFilter(field_name='department__id')
    tenant_id = django_filters.UUIDFilter(field_name='tenant__id')
    is_locked = django_filters.BooleanFilter(method='filter_is_locked')
    is_manager = django_filters.BooleanFilter(method='filter_is_manager')
    is_supervisor = django_filters.BooleanFilter(method='filter_is_supervisor')
    search = django_filters.CharFilter(method='filter_search')
    ordering = OrderingFilter(
        fields=(
            'email', 'username', 'first_name', 'last_name', 'role', 'created_at', 'last_login', 'joined_at'
        )
    )
    class Meta:
        model = User
        fields = [
            'role', 'is_active', 'is_verified', 'is_onboarded',
            'mfa_enabled', 'manager_id', 'tenant_id' # department_id
        ]

    def filter_is_locked(self, queryset, name, value):
        if value:
            return queryset.filter(locked_until__gt=timezone.now())
        return queryset.exclude(locked_until__gt=timezone.now())
    
    def filter_is_manager(self, queryset, name, value):
        if value:
            return queryset.filter(direct_reports__isnull=False).distinct()
        return queryset.filter(direct_reports__isnull=True)
    
    def filter_is_supervisor(self, queryset, name, value):
        if value:
            return queryset.filter(role__in=['super_admin', 'client_admin', 'executive', 'supervisor'])
        return queryset.exclude(role__in=['super_admin', 'client_admin', 'executive', 'supervisor'])
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(email__icontains=value) |
            models.Q(username__icontains=value) |
            models.Q(first_name__icontains = value) |
            models.Q(last_name__icontains=value)
        )