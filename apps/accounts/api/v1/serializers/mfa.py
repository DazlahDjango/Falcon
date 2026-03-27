from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import MFADevice, MFABackupCode, MFAAuditLog
from .base import DynamicFieldsModelSerializer, AuditSerializer
from .user import UserMinimalSerializer

class MFADeviceListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    user = UserMinimalSerializer(read_only=True)
    device_type_display = serializers.SerializerMethodField()
    class Meta:
        model = MFADevice
        fields = [
            'id', 'user', 'name', 'device_type', 'device_type_display',
            'is_active', 'is_primary', 'is_verified', 'verified_at',
            'last_used_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_at', 'last_used_at']

    def get_device_type_display(self, obj):
        return dict(MFADevice.DEVICE_CHOICES).get(obj.device_type, obj.device_type)
    
class MFADeviceDetailSerializer(MFADeviceListSerializer):
    class Meta(MFADeviceListSerializer.Meta):
        fields = MFADeviceListSerializer.Meta.fields = [
            'phone', 'email', 'fail_count', 'locked_until', 'device_info'
        ]
    
class MFADeviceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MFADevice
        fields = ['name', 'device_type', 'phone', 'email']

    def validate(self, attrs):
        device_type = attrs.get('device_type')
        if device_type == 'sms' and not attrs.get('phone'):
            raise serializers.ValidationError({'phone': _("Phone number required for sms device")})
        if device_type == 'email' and not attrs.get('email'):
            raise serializers.ValidationError({'email': _("Email address required for email device")})
        return attrs
    
class MFADeviceSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = MFADevice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id', 'secret', 'verified_at']

class MFABackupCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MFABackupCode
        fields = ['id', 'code', 'is_used', 'used_at', 'expires_at']
        read_only_fields = ['id', 'code', 'is_used', 'used_at', 'expires_at']

class MFABackupListSerializer(serializers.Serializer):
    codes = MFABackupCodeSerializer(many=True, read_only=True)
    remaining = serializers.IntegerField()

class MFAAuditLogSerializer(serializers.ModelField):
    user = UserMinimalSerializer(read_only=True)
    event_type_display = serializers.SerializerMethodField()
    class Meta:
        model = MFAAuditLog
        fields = [
            'id', 'user', 'device', 'event_type', 'event_type_display',
            'ip_address', 'user_agent', 'success', 'message', 'metadata',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_event_type_display(self, obj):
        return dict(MFAAuditLog.EVENT_CHOICES).get(obj.event_type, obj.event_type)