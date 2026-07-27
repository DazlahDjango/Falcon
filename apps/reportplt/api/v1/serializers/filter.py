# apps/reportplt/api/v1/serializers/filter.py
from rest_framework import serializers
from apps.reportplt.models import ReportFilter
from apps.reportplt.constants import FilterType
from .common import BaseModelSerializer

class FilterBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportFilter model.
    """
    filter_type_display = serializers.CharField(source='get_filter_type_display', read_only=True)
    
    class Meta:
        model = ReportFilter
        fields = [
            'id', 'name', 'filter_type', 'filter_type_display',
            'owner', 'is_global', 'is_system', 'is_default',
            'config', 'values', 'display_label', 'placeholder',
            'help_text', 'required', 'multiple', 'options',
            'default_values', 'validation', 'dependencies',
            'created_at', 'updated_at', 'created_by', 'modified_by',
            'tenant_id', 'is_deleted'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by',
            'modified_by', 'tenant_id', 'is_deleted'
        ]

class FilterListSerializer(FilterBaseSerializer):
    """
    List serializer for ReportFilter.
    """
    owner_name = serializers.SerializerMethodField()
    
    class Meta(FilterBaseSerializer.Meta):
        fields = [
            'id', 'name', 'filter_type', 'filter_type_display',
            'owner', 'owner_name', 'is_global', 'is_system',
            'is_default', 'display_label', 'created_at'
        ]
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None

class FilterDetailSerializer(FilterBaseSerializer):
    """
    Detailed serializer for ReportFilter.
    """
    owner_name = serializers.SerializerMethodField()
    
    class Meta(FilterBaseSerializer.Meta):
        fields = FilterBaseSerializer.Meta.fields + ['owner_name']
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None

class FilterCreateSerializer(FilterBaseSerializer):
    """
    Create serializer for ReportFilter.
    """
    class Meta(FilterBaseSerializer.Meta):
        fields = [
            'id', 'name', 'filter_type', 'config', 'values',
            'display_label', 'placeholder', 'help_text',
            'required', 'multiple', 'options', 'default_values',
            'validation', 'dependencies', 'is_global'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        validated_data['owner'] = request.user if request else None
        return super().create(validated_data)

class FilterUpdateSerializer(FilterBaseSerializer):
    """
    Update serializer for ReportFilter.
    """
    class Meta(FilterBaseSerializer.Meta):
        fields = [
            'name', 'config', 'values', 'display_label',
            'placeholder', 'help_text', 'required', 'multiple',
            'options', 'default_values', 'validation', 'dependencies'
        ]

class FilterApplySerializer(serializers.Serializer):
    """
    Serializer for applying filters.
    """
    filter_id = serializers.UUIDField(required=False)
    values = serializers.DictField(required=True)
    
    def validate(self, attrs):
        if not attrs.get('filter_id'):
            request = self.context.get('request')
            if not request or not request.user:
                raise serializers.ValidationError("User context required")
        return attrs