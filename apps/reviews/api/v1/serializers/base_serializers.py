# apps/reviews/api/v1/serializers/base_serializers.py
"""
Base serializers for Reviews API
"""

from rest_framework import serializers
from django.utils import timezone


class BaseReviewSerializer(serializers.ModelSerializer):
    """
    Base serializer with common fields for all review models.
    """
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    id = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True


class BaseTenantSerializer(BaseReviewSerializer):
    """
    Base serializer for tenant-aware models.
    """
    
    tenant_name = serializers.SerializerMethodField(read_only=True)
    tenant_id = serializers.SerializerMethodField(read_only=True)
    
    def get_tenant_name(self, obj):
        from apps.tenant.models import Organization
        # Try to get tenant from obj.tenant first (ForeignKey)
        if hasattr(obj, 'tenant') and obj.tenant:
            return obj.tenant.name
        # Then try to get from obj.tenant_id (UUIDField)
        elif hasattr(obj, 'tenant_id') and obj.tenant_id:
            try:
                tenant = Organization.objects.get(id=obj.tenant_id)
                return tenant.name
            except Organization.DoesNotExist:
                return None
        return None
    
    def get_tenant_id(self, obj):
        # Try to get from obj.tenant first (ForeignKey)
        if hasattr(obj, 'tenant') and obj.tenant:
            return obj.tenant.id
        # Then try to get from obj.tenant_id (UUIDField)
        elif hasattr(obj, 'tenant_id'):
            return obj.tenant_id
        return None
    
    class Meta:
        abstract = True


class BaseStatusSerializer(BaseReviewSerializer):
    """
    Base serializer for models with status workflow.
    """
    
    status = serializers.CharField(read_only=True)
    status_display = serializers.SerializerMethodField()
    
    def get_status_display(self, obj):
        return getattr(obj, 'get_status_display', lambda: obj.status)()
    
    class Meta:
        abstract = True


class DateRangeSerializer(serializers.Serializer):
    """
    Serializer for date range input.
    """
    
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError(
                "start_date must be before or equal to end_date"
            )
        return data


class ScoreSerializer(serializers.Serializer):
    """
    Serializer for score values.
    """
    
    raw_score = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    normalized_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    traffic_light = serializers.CharField(read_only=True)
    percentage = serializers.SerializerMethodField()
    
    def get_percentage(self, obj):
        if hasattr(obj, 'normalized_score') and obj.normalized_score:
            return float(obj.normalized_score)
        return None