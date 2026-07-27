# apps/reportplt/api/v1/serializers/widget.py
from rest_framework import serializers
from apps.reportplt.models import ReportWidget
from apps.reportplt.constants import WidgetType
from .common import BaseModelSerializer

class WidgetBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportWidget model.
    """
    widget_type_display = serializers.CharField(source='get_widget_type_display', read_only=True)
    
    class Meta:
        model = ReportWidget
        fields = [
            'id', 'dashboard', 'name', 'widget_type',
            'widget_type_display', 'config', 'data_config',
            'style_config', 'position', 'size', 'is_active',
            'is_visible', 'auto_refresh', 'refresh_interval',
            'title', 'subtitle', 'data_source', 'data_query',
            'filters', 'sort', 'aggregation', 'limit',
            'created_at', 'updated_at', 'created_by', 'modified_by',
            'tenant_id', 'is_deleted'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by',
            'modified_by', 'tenant_id', 'is_deleted'
        ]

class WidgetListSerializer(WidgetBaseSerializer):
    """
    List serializer for ReportWidget.
    """
    class Meta(WidgetBaseSerializer.Meta):
        fields = [
            'id', 'name', 'widget_type', 'widget_type_display',
            'title', 'is_active', 'is_visible', 'position', 'size'
        ]

class WidgetDetailSerializer(WidgetBaseSerializer):
    """
    Detailed serializer for ReportWidget.
    """
    dashboard_name = serializers.SerializerMethodField()
    
    class Meta(WidgetBaseSerializer.Meta):
        fields = WidgetBaseSerializer.Meta.fields + ['dashboard_name']
    
    def get_dashboard_name(self, obj):
        if obj.dashboard:
            return obj.dashboard.name
        return None

class WidgetCreateSerializer(WidgetBaseSerializer):
    """
    Create serializer for ReportWidget.
    """
    class Meta(WidgetBaseSerializer.Meta):
        fields = [
            'dashboard', 'name', 'widget_type', 'config',
            'data_config', 'style_config', 'position', 'size',
            'is_active', 'is_visible', 'auto_refresh',
            'refresh_interval', 'title', 'subtitle', 'data_source',
            'data_query', 'filters', 'sort', 'aggregation', 'limit'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        return super().create(validated_data)

class WidgetUpdateSerializer(WidgetBaseSerializer):
    """
    Update serializer for ReportWidget.
    """
    class Meta(WidgetBaseSerializer.Meta):
        fields = [
            'name', 'config', 'data_config', 'style_config',
            'position', 'size', 'is_active', 'is_visible',
            'auto_refresh', 'refresh_interval', 'title', 'subtitle',
            'data_source', 'data_query', 'filters', 'sort',
            'aggregation', 'limit'
        ]

class WidgetDataSerializer(serializers.Serializer):
    """
    Serializer for widget data response.
    """
    data = serializers.DictField()
    widget_id = serializers.UUIDField()
    widget_type = serializers.CharField()
    title = serializers.CharField()
    rendered_at = serializers.DateTimeField()

class WidgetActionSerializer(serializers.Serializer):
    """
    Serializer for widget actions.
    """
    action = serializers.ChoiceField(choices=[
        ('activate', 'Activate'),
        ('deactivate', 'Deactivate'),
        ('show', 'Show'),
        ('hide', 'Hide'),
        ('refresh', 'Refresh'),
    ])