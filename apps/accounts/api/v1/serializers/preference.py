from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import UserPreference, TenantPreference
from .base import DynamicFieldsModelSerializer, AuditSerializer
from .user import UserMinimalSerializer

class UserPreferenceSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    user = UserMinimalSerializer(read_only=True)
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'notification_settings', 'dashboard_preferences',
            'items_per_page', 'default_dashboard', 'collapsed_sidebar',
            'public_profile', 'show_email', 'show_phone',
            'work_start_time', 'work_end_time', 'working_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']

class UserPreferenceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'notification_settings', 'dashboard_preferences',
            'items_per_page', 'default_dashboard', 'collapsed_sidebar',
            'public_profile', 'show_email', 'show_phone',
            'work_start_time', 'work_end_time', 'working_days'
        ]

class TenantPreferenceSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    class Meta:
        model = TenantPreference
        fields = [
            'id', 'client_id', 'logo_url', 'favicon_url', 'primary_color', 'secondary_color',
            'features', 'default_language', 'available_languages', 'default_timezone',
            'audit_log_retention_days', 'session_retention_days',
            'api_rate_limit', 'webhook_url', 'mfa_required_roles',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']

class TenantPreferenceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantPreference
        fields = [
            'logo_url', 'favicon_url', 'primary_color', 'secondary_color',
            'features', 'default_language', 'available_languages', 'default_timezone',
            'audit_log_retention_days', 'session_retention_days',
            'api_rate_limit', 'webhook_url', 'mfa_required_roles'
        ]
    def validate_primary_color(self, value):
        if value and not value.startswith('#'):
            raise serializers.ValidationError(_('Color must be in hex format (#RRGGBB)'))
        return value