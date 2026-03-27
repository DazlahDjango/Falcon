"""
Session serializers.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import UserSession, SessionBlacklist
from .base import DynamicFieldsModelSerializer, AuditSerializer
from .user import UserMinimalSerializer


class UserSessionListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    user = UserMinimalSerializer(read_only=True)
    duration = serializers.SerializerMethodField()
    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'ip_address', 'device_type', 'browser', 'os',
            'login_time', 'last_activity', 'expires_at', 'status',
            'mfa_verified', 'is_trusted_device', 'duration', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_duration(self, obj):
        return obj.get_duration()


class UserSessionDetailSerializer(UserSessionListSerializer):
    location = serializers.SerializerMethodField()
    security_alerts = serializers.JSONField(read_only=True)
    class Meta(UserSessionListSerializer.Meta):
        fields = UserSessionListSerializer.Meta.fields + [
            'session_key', 'jwt_token_id', 'user_agent', 'location',
            'location_city', 'location_country', 'security_alerts'
        ]
    
    def get_location(self, obj):
        if obj.location_city or obj.location_country:
            return f"{obj.location_city}, {obj.location_country}".strip(', ')
        return None


class UserSessionSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']


class SessionBlacklistSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    class Meta:
        model = SessionBlacklist
        fields = ['id', 'token_id', 'token_type', 'user', 'user_email', 'blacklisted_at', 'expires_at', 'reason']
        read_only_fields = ['id', 'blacklisted_at']
    
    def get_user_email(self, obj):
        if obj.user:
            return obj.user.email
        return None