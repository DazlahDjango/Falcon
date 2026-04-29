# apps/tenant/api/v1/serializers/migration.py
"""
Serializers for TenantMigration model.
"""

from rest_framework import serializers

from apps.tenant.models import TenantMigration
from apps.tenant.constants import MigrationStatus


class MigrationSerializer(serializers.ModelSerializer):
    """Base serializer for TenantMigration model."""

    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = TenantMigration
        fields = [
            'id', 'tenant', 'migration_name', 'app_name', 'status', 'status_display',
            'started_at', 'completed_at', 'duration_seconds', 'error_message',
            'is_rollback', 'rolled_back_from', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'started_at', 'completed_at']

    def get_duration_seconds(self, obj):
        """Get migration duration in seconds."""
        if obj.started_at and obj.completed_at:
            return (obj.completed_at - obj.started_at).total_seconds()
        return None


class MigrationDetailSerializer(serializers.ModelSerializer):
    """Detailed migration serializer with tenant info."""

    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    error_traceback_display = serializers.CharField(
        source='error_traceback', read_only=True)

    class Meta:
        model = TenantMigration
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class MigrationRunSerializer(serializers.Serializer):
    """Serializer for running migrations."""

    app_name = serializers.CharField(required=False, allow_blank=True)
    migration_name = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """Validate migration parameters."""
        if data.get('migration_name') and not data.get('app_name'):
            raise serializers.ValidationError(
                "app_name is required when specifying migration_name")
        return data
