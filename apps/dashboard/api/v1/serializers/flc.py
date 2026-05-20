from rest_framework import serializers
from django.utils import timezone
from django.core.validators import ValidationError
from apps.dashboard.models import (
    DashboardConfig, WidgetConfig, FavoriteKPI, DashboardAlert,
    ExportSchedule, PeriodComparison, DashboardAccessLog,
    ExecutiveViewPreset, TenantOverviewSnapshot
)
from apps.dashboard.constants import DashboardType, WidgetType, TrafficLight, ExportFormat, ScheduleType, AlertType
from apps.dashboard.validators import (
    validate_dashboard_layout, validate_dashboard_filters,
    validate_widget_config, validate_alert_config
)



class DepartmentPerformanceSerializer(serializers.Serializer):
    """Serializer for department performance data."""
    
    id = serializers.UUIDField()
    name = serializers.CharField()
    employee_count = serializers.IntegerField()
    average_score = serializers.FloatField()
    status = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    trend = serializers.CharField()


class KPITrendSerializer(serializers.Serializer):
    """Serializer for KPI trend data."""
    
    kpi_id = serializers.UUIDField()
    kpi_name = serializers.CharField()
    current_score = serializers.FloatField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    trend = serializers.ListField(child=serializers.DictField())


class ExportScheduleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing export schedules."""
    
    class Meta:
        model = ExportSchedule
        fields = ['id', 'name', 'dashboard_type', 'format', 'schedule_type', 'is_active', 'next_run_at']
        read_only_fields = '__all__',


class DashboardAlertListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing dashboard alerts."""
    
    class Meta:
        model = DashboardAlert
        fields = ['id', 'alert_type', 'severity', 'is_active', 'last_triggered_at']
        read_only_fields = '__all__',


class BulkWidgetUpdateSerializer(serializers.Serializer):
    """Serializer for bulk widget position updates."""
    
    id = serializers.UUIDField()
    row = serializers.IntegerField(min_value=0)
    col = serializers.IntegerField(min_value=0)
    
    def validate(self, data):
        if data['row'] < 0 or data['col'] < 0:
            raise serializers.ValidationError("Row and column cannot be negative")
        return data


class DashboardCloneSerializer(serializers.Serializer):
    source_dashboard_id = serializers.UUIDField()
    new_name = serializers.CharField(max_length=100)
    def validate_new_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Dashboard name is required")
        return value.strip()