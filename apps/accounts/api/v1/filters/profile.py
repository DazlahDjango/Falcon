import django_filters
from django.db import models
from apps.accounts.models import Profile
from .base import BaseFilter, SearchFilter

class ProfileFilter(BaseFilter, SearchFilter):
    employee_type = django_filters.CharFilter(field_name='employee_type', lookup_expr='iexact')
    cost_center = django_filters.CharFilter(field_name='cost_center', lookup_expr='iexact')
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')   
    user_id = django_filters.UUIDFilter(field_name='user__id')
    reports_to_id = django_filters.UUIDFilter(field_name='reports_to__id')
    tenant_id = django_filters.UUIDFilter(field_name='tenant_id')
    has_skill = django_filters.CharFilter(method='filter_has_skill')
    skill_level = django_filters.CharFilter(method='filter_skill_level') 
    has_certification = django_filters.CharFilter(method='filter_has_certification')
    has_avatar = django_filters.BooleanFilter(field_name='avatar', lookup_expr='isnull', exclude=True)   
    search = django_filters.CharFilter(method='filter_search')  
    class Meta:
        model = Profile
        fields = [
            'employee_type', 'cost_center', 'city', 'country',
            'user_id', 'reports_to_id', 'tenant_id'
        ]
    
    def filter_has_skill(self, queryset, name, value):
        return queryset.filter(skills__contains=[{'name': value}])
    
    def filter_skill_level(self, queryset, name, value):
        if ':' in value:
            skill, level = value.split(':', 1)
            return queryset.filter(skills__contains=[{'name': skill, 'level': level}])
        return self.filter_has_skill(queryset, name, value)
    
    def filter_has_certification(self, queryset, name, value):
        return queryset.filter(certifications__contains=[{'name': value}])
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(user__email__icontains=value) |
            models.Q(user__first_name__icontains=value) |
            models.Q(user__last_name__icontains=value) |
            models.Q(employee_type__icontains=value)
        )