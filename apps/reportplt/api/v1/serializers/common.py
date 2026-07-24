# apps/reportplt/api/v1/serializers/common.py
from rest_framework import serializers
from django.utils import timezone
from apps.reportplt.models import BaseModel

class BaseSerializer(serializers.Serializer):
    """
    Base serializer with common fields and methods.
    """
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def validate(self, attrs):
        return attrs

class BaseModelSerializer(serializers.ModelSerializer):
    """
    Base model serializer with common fields.
    """
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    tenant_id = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    Model serializer with dynamic field selection.
    """
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        exclude = kwargs.pop('exclude', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        if exclude is not None:
            for field_name in exclude:
                if field_name in self.fields:
                    self.fields.pop(field_name)

class TenantAwareSerializer(serializers.ModelSerializer):
    """
    Serializer that automatically sets tenant_id from request context.
    """
    tenant_id = serializers.UUIDField(read_only=True)
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'tenant_id'):
            validated_data['tenant_id'] = request.tenant_id
        elif request and hasattr(request.user, 'tenant_id'):
            validated_data['tenant_id'] = request.user.tenant_id
        return super().create(validated_data)
    
    class Meta:
        abstract = True

class AuditTrailSerializer(serializers.ModelSerializer):
    """
    Serializer with audit trail fields.
    """
    created_by_id = serializers.UUIDField(read_only=True)
    created_by_name = serializers.SerializerMethodField()
    modified_by_id = serializers.UUIDField(read_only=True)
    modified_by_name = serializers.SerializerMethodField()
    
    class Meta:
        abstract = True
    
    def get_created_by_name(self, obj):
        if hasattr(obj, 'created_by') and obj.created_by:
            return obj.created_by.get_full_name()
        return None
    
    def get_modified_by_name(self, obj):
        if hasattr(obj, 'modified_by') and obj.modified_by:
            return obj.modified_by.get_full_name()
        return None

class BaseReportSerializer(BaseModelSerializer):
    """
    Base serializer for all report-related models with common fields.
    """
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        abstract = True
    
    def get_status_display(self, obj):
        if hasattr(obj, 'get_status_display'):
            return obj.get_status_display()
        return getattr(obj, 'status', None)

class BaseReportDetailSerializer(BaseReportSerializer):
    """
    Base serializer for detailed report data.
    """
    class Meta:
        abstract = True

class BaseListSerializer(serializers.ListSerializer):
    """
    Base list serializer with common list operations.
    """
    def update(self, instance, validated_data):
        return [super().update(item, data) for item, data in zip(instance, validated_data)]