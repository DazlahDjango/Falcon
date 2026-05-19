from django.db import models
from django_filters import rest_framework as filters
from apps.configs.models import BackupQuota

class BackupQuotaFilter(filters.FilterSet):
    tenant_name = filters.CharFilter(field_name='tenant__name', lookup_expr='icontains')
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    usage_percent_above = filters.NumberFilter(method='filter_usage_percent_above')
    usage_percent_below = filters.NumberFilter(method='filter_usage_percent_below')
    exceeded = filters.BooleanFilter(method='filter_exceeded')
    def filter_usage_percent_above(self, queryset, name, value):
        return queryset.filter(used_backup_storage_bytes__gte=models.F('total_backup_storage_bytes') * (value / 100))
    def filter_usage_percent_below(self, queryset, name, value):
        return queryset.filter(used_backup_storage_bytes__lte=models.F('total_backup_storage_bytes') * (value / 100))
    def filter_exceeded(self, queryset, name, value):
        if value:
            return queryset.filter(used_backup_storage_bytes__gte=models.F('total_backup_storage_bytes'))
        return queryset.filter(used_backup_storage_bytes__lt=models.F('total_backup_storage_bytes'))
    class Meta:
        model = BackupQuota
        fields = ['tenant_name', 'app_name']