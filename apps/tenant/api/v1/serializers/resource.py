# apps/tenant/api/v1/serializers/resource.py
"""
Serializers for TenantResource model.
"""

from rest_framework import serializers

from apps.tenant.models import TenantResource
from apps.tenant.constants import ResourceType


class ResourceSerializer(serializers.ModelSerializer):
    """Base serializer for TenantResource model."""

    percentage_used = serializers.SerializerMethodField()
    resource_type_display = serializers.CharField(
        source='get_resource_type_display', read_only=True)
    is_exceeded = serializers.SerializerMethodField()
    is_warning = serializers.SerializerMethodField()

    class Meta:
        model = TenantResource
        fields = [
            'id', 'tenant', 'resource_type', 'resource_type_display',
            'limit_value', 'current_value', 'percentage_used',
            'warning_threshold', 'is_exceeded', 'is_warning',
            'last_reset_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_percentage_used(self, obj):
        """Calculate percentage of limit used."""
        if obj.limit_value > 0:
            return round((obj.current_value / obj.limit_value) * 100, 1)
        return 0

    def get_is_exceeded(self, obj):
        """Check if limit is exceeded."""
        return obj.current_value >= obj.limit_value

    def get_is_warning(self, obj):
        """Check if usage is at warning level."""
        return self.get_percentage_used(obj) >= obj.warning_threshold


class ResourceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating resource limits."""

    class Meta:
        model = TenantResource
        fields = ['limit_value', 'warning_threshold']

    def validate_limit_value(self, value):
        """Ensure limit is positive."""
        if value < 1:
            raise serializers.ValidationError(
                "Limit value must be at least 1.")
        return value

    def validate_warning_threshold(self, value):
        """Ensure warning threshold is between 0 and 100."""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Warning threshold must be between 0 and 100.")
        return value


class ResourceBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updating resources."""

    resources = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Dictionary of resource_type: limit_value"
    )

    def validate_resources(self, value):
        """Validate resource types."""
        valid_types = [rt for rt in ResourceType.values]
        for resource_type in value.keys():
            if resource_type not in valid_types:
                raise serializers.ValidationError(
                    f"Invalid resource type: {resource_type}")
        return value


class ResourceSummarySerializer(serializers.Serializer):
    """Serializer for resource summary."""

    tenant_id = serializers.UUIDField()
    tenant_name = serializers.CharField()
    resources = serializers.DictField()
    overall_percentage = serializers.FloatField()
    warnings = serializers.ListField()
    exceeded = serializers.ListField()
