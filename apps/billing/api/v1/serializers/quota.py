from rest_framework import serializers
from decimal import Decimal
from django.utils.translation import gettext_lazy as _
from apps.billing.models import QuotaLimit, QuotaUsage

class QuotaLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotaLimit
        fields = [
            'id', 'max_users', 'max_admins', 'max_kpis', 'max_kpi_frameworks',
            'max_departments', 'max_storage_mb', 'max_file_size_mb',
            'max_api_calls_per_day', 'max_api_calls_per_minute',
            'max_concurrent_sessions', 'max_export_rows',
            'allow_custom_branding', 'allow_api_access', 'allow_sso',
            'allow_advanced_analytics', 'allow_audit_logs', 'allow_reports',
            'allow_export', 'allow_webhooks', 'allow_multi_currency',
            'allow_priority_support', 'support_level'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class QuotaUsageSerializer(serializers.ModelSerializer):
    usage_percentages = serializers.SerializerMethodField()
    is_healthy = serializers.BooleanField(read_only=True)
    class Meta:
        model = QuotaUsage
        fields = [
            'id', 'snapshot_date', 'current_users', 'current_admins',
            'current_kpis', 'current_storage_mb', 'api_calls_today',
            'active_sessions', 'usage_percentages', 'is_healthy'
        ]
        read_only_fields = '__all__'
    def get_usage_percentages(self, obj):
        from billing.services.quota_service import QuotaService
        service = QuotaService()
        limits = service.get_limits(obj.tenant)
        if not limits:
            return {}
        return {
            'users': round((obj.current_users / limits.max_users * 100), 2) if limits.max_users > 0 else 0,
            'admins': round((obj.current_admins / limits.max_admins * 100), 2) if limits.max_admins > 0 else 0,
            'kpis': round((obj.current_kpis / limits.max_kpis * 100), 2) if limits.max_kpis > 0 else 0,
            'storage': round((obj.current_storage_mb / limits.max_storage_mb * 100), 2) if limits.max_storage_mb > 0 else 0,
            'api_calls': round((obj.api_calls_today / limits.max_api_calls_per_day * 100), 2) if limits.max_api_calls_per_day > 0 else 0,
        }

class QuotaStatusSerializer(serializers.Serializer):
    users = serializers.DictField()
    admins = serializers.DictField()
    kpis = serializers.DictField()
    storage = serializers.DictField()
    api_calls_today = serializers.DictField()
    features = serializers.DictField()
    is_healthy = serializers.BooleanField()