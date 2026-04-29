# apps/tenant/api/v1/serializers/backup.py
"""
Serializers for TenantBackup model.
"""

from rest_framework import serializers
from django.utils import timezone

from apps.tenant.models import TenantBackup
from apps.tenant.constants import BackupType, BackupStatus


class BackupSerializer(serializers.ModelSerializer):
    """Base serializer for TenantBackup model."""

    backup_type_display = serializers.CharField(
        source='get_backup_type_display', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = TenantBackup
        fields = [
            'id', 'tenant', 'backup_type', 'backup_type_display',
            'status', 'status_display', 'backup_file', 'file_size_mb',
            'started_at', 'completed_at', 'duration_seconds', 'error_message',
            'retention_days', 'expires_at', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'started_at', 'completed_at']

    def get_duration_seconds(self, obj):
        """Get backup duration in seconds."""
        if obj.started_at and obj.completed_at:
            return (obj.completed_at - obj.started_at).total_seconds()
        return None

    def get_is_expired(self, obj):
        """Check if backup has expired."""
        if obj.expires_at:
            return obj.expires_at < timezone.now()
        return False


class BackupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new backup."""

    class Meta:
        model = TenantBackup
        fields = ['tenant', 'backup_type', 'retention_days']

    def validate_backup_type(self, value):
        """Validate backup type."""
        if value not in [BackupType.FULL, BackupType.SCHEMA, BackupType.DATA]:
            raise serializers.ValidationError(f"Invalid backup type: {value}")
        return value

    def create(self, validated_data):
        """Create backup record with pending status."""
        validated_data['status'] = BackupStatus.PENDING
        return super().create(validated_data)


class BackupDetailSerializer(serializers.ModelSerializer):
    """Detailed backup serializer with tenant info."""

    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = TenantBackup
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'started_at', 'completed_at']
