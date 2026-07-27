# apps/reportplt/api/v1/serializers/dashboard.py
from rest_framework import serializers
from apps.reportplt.models import ReportDashboard
from apps.reportplt.constants import DashboardType
from .common import BaseModelSerializer, AuditTrailSerializer
from .widget import WidgetListSerializer

class DashboardBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportDashboard model.
    """
    dashboard_type_display = serializers.CharField(source='get_dashboard_type_display', read_only=True)
    
    class Meta:
        model = ReportDashboard
        fields = [
            'id', 'name', 'description', 'dashboard_type',
            'dashboard_type_display', 'owner', 'is_default',
            'is_shared', 'is_published', 'layout', 'config',
            'theme', 'widgets_order', 'refresh_interval',
            'allowed_roles', 'allowed_users', 'allowed_departments',
            'tags', 'last_viewed_at', 'view_count', 'created_at',
            'updated_at', 'created_by', 'modified_by', 'tenant_id',
            'is_deleted'
        ]
        read_only_fields = [
            'id', 'view_count', 'last_viewed_at', 'created_at',
            'updated_at', 'created_by', 'modified_by', 'tenant_id',
            'is_deleted'
        ]

class DashboardListSerializer(DashboardBaseSerializer):
    """
    List serializer for ReportDashboard.
    """
    owner_name = serializers.SerializerMethodField()
    widget_count = serializers.SerializerMethodField()
    
    class Meta(DashboardBaseSerializer.Meta):
        fields = [
            'id', 'name', 'dashboard_type', 'dashboard_type_display',
            'owner', 'owner_name', 'is_default', 'is_shared',
            'is_published', 'view_count', 'widget_count', 'created_at'
        ]
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None
    
    def get_widget_count(self, obj):
        return obj.widgets.filter(is_active=True).count()

class DashboardDetailSerializer(DashboardBaseSerializer):
    """
    Detailed serializer for ReportDashboard.
    """
    owner_name = serializers.SerializerMethodField()
    widgets = WidgetListSerializer(source='widgets.filter', many=True, read_only=True)
    
    class Meta(DashboardBaseSerializer.Meta):
        fields = DashboardBaseSerializer.Meta.fields + ['owner_name', 'widgets']
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None

class DashboardCreateSerializer(DashboardBaseSerializer):
    """
    Create serializer for ReportDashboard.
    """
    class Meta(DashboardBaseSerializer.Meta):
        fields = [
            'id', 'name', 'description', 'dashboard_type', 'layout',
            'config', 'theme', 'refresh_interval', 'allowed_roles',
            'allowed_users', 'allowed_departments', 'tags'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        validated_data['owner'] = request.user if request else None
        return super().create(validated_data)

class DashboardUpdateSerializer(DashboardBaseSerializer):
    """
    Update serializer for ReportDashboard.
    """
    class Meta(DashboardBaseSerializer.Meta):
        fields = [
            'name', 'description', 'layout', 'config', 'theme',
            'refresh_interval', 'allowed_roles', 'allowed_users',
            'allowed_departments', 'tags', 'is_shared', 'is_published'
        ]

class DashboardLayoutSerializer(serializers.Serializer):
    """
    Serializer for dashboard layout updates.
    """
    layout = serializers.DictField(required=True)
    
    def validate_layout(self, value):
        required_keys = ['grid_columns', 'row_height', 'spacing']
        for key in required_keys:
            if key not in value:
                raise serializers.ValidationError(f"Missing required key: {key}")
        return value

class DashboardActionSerializer(serializers.Serializer):
    """
    Serializer for dashboard actions.
    """
    action = serializers.ChoiceField(choices=[
        ('set_default', 'Set Default'),
        ('publish', 'Publish'),
        ('unpublish', 'Unpublish'),
        ('share', 'Share'),
        ('unshare', 'Unshare'),
        ('duplicate', 'Duplicate'),
    ])
    new_name = serializers.CharField(required=False, allow_blank=True)
    roles = serializers.ListField(child=serializers.CharField(), required=False)
    users = serializers.ListField(child=serializers.UUIDField(), required=False)
    departments = serializers.ListField(child=serializers.UUIDField(), required=False)