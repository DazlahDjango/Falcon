# apps/tenant/api/v1/serializers/schema.py
"""
Serializers for TenantSchema model.
"""

from rest_framework import serializers

from apps.tenant.models import TenantSchema
from apps.tenant.constants import SchemaStatus


class SchemaSerializer(serializers.ModelSerializer):
    """Base serializer for TenantSchema model."""

    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = TenantSchema
        fields = [
            'id', 'tenant', 'schema_name', 'status', 'status_display',
            'is_ready', 'is_active', 'created_at_schema', 'last_migration_at',
            'last_migration_name', 'table_count', 'size_mb', 'error_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_active(self, obj):
        """Check if schema is active and ready."""
        return obj.status == SchemaStatus.ACTIVE and obj.is_ready


class SchemaDetailSerializer(serializers.ModelSerializer):
    """Detailed schema serializer with tenant info."""

    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_slug = serializers.CharField(source='tenant.slug', read_only=True)

    class Meta:
        model = TenantSchema
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
