from rest_framework import serializers
from apps.dashboard.models import DashboardConfig, WidgetConfig
from apps.dashboard.constants import WidgetType
from apps.dashboard.validators import (
    validate_dashboard_layout, validate_dashboard_filters,
    validate_widget_config
)

class DashboardConfigSerializer(serializers.ModelSerializer):
    dashboard_type_display = serializers.CharField(source='get_dashboard_type_display', read_only=True)
    layout = serializers.JSONField(validators=[validate_dashboard_layout])
    default_filters = serializers.JSONField(validators=[validate_dashboard_filters], required=False, default=dict)
    class Meta:
        model = DashboardConfig
        fields = [
            'id', 'tenant_id', 'user_id', 'dashboard_type', 'dashboard_type_display',
            'layout', 'default_filters', 'default_time_period', 'default_view',
            'is_default', 'is_shared', 'shared_with_roles', 'name', 'description', 'version',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'version']
    
    def validate_dashboard_type(self, value):
        from apps.dashboard.constants import DashboardType
        allowed = [t[0] for t in DashboardType.CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid dashboard type. Allowed: {allowed}")
        return value
    
    def validate_default_time_period(self, value):
        allowed = ['monthly', 'quarterly', 'yearly', 'daily', 'weekly']
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid time period. Allowed: {allowed}")
        return value
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        validated_data['user_id'] = str(self.context['request'].user.id)
        validated_data['version'] = 1
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        instance.version += 1
        return super().update(instance, validated_data)


class WidgetConfigSerializer(serializers.ModelSerializer):
    widget_type_display = serializers.CharField(source='get_widget_type_display', read_only=True)
    config = serializers.JSONField()
    class Meta:
        model = WidgetConfig
        fields = [
            'id', 'tenant_id', 'dashboard', 'widget_type', 'widget_type_display',
            'row', 'col', 'width', 'height', 'config', 'title', 'show_title',
            'refresh_interval', 'is_visible', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
    
    def validate_widget_type(self, value):
        allowed = [t[0] for t in WidgetType.CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid widget type. Allowed: {allowed}")
        return value
    
    def validate(self, data):
        widget_type = data.get('widget_type')
        config = data.get('config', {})
        if widget_type and config:
            validate_widget_config(widget_type, config)
        row = data.get('row', 0)
        col = data.get('col', 0)
        width = data.get('width', 4)
        height = data.get('height', 2)
        if row < 0 or col < 0:
            raise serializers.ValidationError("Row and column cannot be negative")
        if width < 1 or width > 12:
            raise serializers.ValidationError("Width must be between 1 and 12")
        if height < 1 or height > 12:
            raise serializers.ValidationError("Height must be between 1 and 12")
        return data
    
    def create(self, validated_data):
        validated_data['tenant_id'] = self.context['request'].user.tenant_id
        return super().create(validated_data)