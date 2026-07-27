# apps/reportplt/api/v1/serializers/template.py
from rest_framework import serializers
from apps.reportplt.models import ReportTemplate
from apps.reportplt.constants import TemplateType, SectorType
from .common import BaseModelSerializer, AuditTrailSerializer

class TemplateBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportTemplate model.
    """
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'template_type', 'template_type_display',
            'category', 'sector', 'sector_display', 'department', 'owner',
            'is_system', 'is_published', 'is_default', 'is_popular',
            'has_prebuilt_charts', 'has_dynamic_filters', 'has_parameters',
            'layout_config', 'widget_config', 'filter_config', 'parameter_config',
            'chart_config', 'table_config', 'style_config', 'export_config',
            'applicable_industries', 'org_size', 'version', 'created_at',
            'updated_at', 'created_by', 'modified_by', 'tenant_id', 'is_deleted'
        ]
        read_only_fields = [
            'id', 'version', 'created_at', 'updated_at', 'created_by',
            'modified_by', 'tenant_id', 'is_deleted'
        ]

class TemplateListSerializer(TemplateBaseSerializer):
    """
    List serializer for ReportTemplate.
    """
    class Meta(TemplateBaseSerializer.Meta):
        fields = [
            'id', 'name', 'template_type', 'template_type_display',
            'sector', 'sector_display', 'is_system', 'is_published',
            'is_default', 'is_popular', 'version'
        ]

class TemplateDetailSerializer(TemplateBaseSerializer):
    """
    Detailed serializer for ReportTemplate.
    """
    owner_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta(TemplateBaseSerializer.Meta):
        fields = TemplateBaseSerializer.Meta.fields + ['owner_name', 'created_by_name']
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

class TemplateCreateSerializer(TemplateBaseSerializer):
    """
    Create serializer for ReportTemplate.
    """
    class Meta(TemplateBaseSerializer.Meta):
        fields = [
            'id', 'name', 'description', 'template_type', 'category', 'sector',
            'department', 'layout_config', 'widget_config', 'filter_config',
            'parameter_config', 'chart_config', 'table_config', 'style_config',
            'export_config', 'applicable_industries', 'org_size'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        validated_data['owner'] = request.user if request else None
        validated_data['version'] = 1
        return super().create(validated_data)

class TemplateUpdateSerializer(TemplateBaseSerializer):
    """
    Update serializer for ReportTemplate.
    """
    class Meta(TemplateBaseSerializer.Meta):
        fields = [
            'name', 'description', 'category', 'sector', 'department',
            'layout_config', 'widget_config', 'filter_config',
            'parameter_config', 'chart_config', 'table_config',
            'style_config', 'export_config', 'applicable_industries',
            'org_size', 'is_published', 'is_default', 'is_popular'
        ]
    
    def update(self, instance, validated_data):
        validated_data['modified_by'] = self.context.get('request').user if self.context.get('request') else None
        validated_data['version'] = instance.version + 1
        return super().update(instance, validated_data)

class TemplateActionSerializer(serializers.Serializer):
    """
    Serializer for template actions.
    """
    action = serializers.ChoiceField(choices=[
        ('publish', 'Publish'),
        ('unpublish', 'Unpublish'),
        ('set_default', 'Set Default'),
        ('duplicate', 'Duplicate'),
    ])
    new_name = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        request = self.context.get('request')
        template = self.context.get('template')
        if request and template:
            from apps.reportplt.services.security.report_rbac import ReportRBAC
            rbac = ReportRBAC(request.user)
            if attrs.get('action') in ['publish', 'unpublish', 'set_default']:
                if not rbac.can_edit_template(template):
                    raise serializers.ValidationError("You do not have permission to modify this template")
        return attrs