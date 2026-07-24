# apps/reportplt/api/v1/serializers/execution.py
from rest_framework import serializers
from apps.reportplt.models import ReportExecution
from .common import BaseModelSerializer

class ExecutionBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportExecution model.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportExecution
        fields = [
            'id', 'report', 'schedule', 'triggered_by', 'status',
            'status_display', 'started_at', 'completed_at', 'duration',
            'duration_display', 'result_summary', 'error_message',
            'error_traceback', 'parameters_used', 'filters_used',
            'row_count', 'data_size', 'execution_log', 'retry_count',
            'created_at', 'updated_at', 'created_by', 'modified_by',
            'tenant_id', 'is_deleted'
        ]
        read_only_fields = [
            'id', 'status', 'started_at', 'completed_at', 'duration',
            'row_count', 'data_size', 'execution_log', 'retry_count',
            'created_at', 'updated_at', 'tenant_id', 'is_deleted'
        ]
    
    def get_duration_display(self, obj):
        if obj.duration:
            if obj.duration < 60:
                return f"{obj.duration:.2f}s"
            elif obj.duration < 3600:
                return f"{obj.duration / 60:.2f}m"
            else:
                return f"{obj.duration / 3600:.2f}h"
        return None

class ExecutionListSerializer(ExecutionBaseSerializer):
    """
    List serializer for ReportExecution.
    """
    report_name = serializers.SerializerMethodField()
    triggered_by_name = serializers.SerializerMethodField()
    
    class Meta(ExecutionBaseSerializer.Meta):
        fields = [
            'id', 'report', 'report_name', 'status', 'status_display',
            'started_at', 'completed_at', 'duration', 'duration_display',
            'row_count', 'triggered_by_name', 'created_at'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_triggered_by_name(self, obj):
        if obj.triggered_by:
            return obj.triggered_by.get_full_name()
        return None

class ExecutionDetailSerializer(ExecutionBaseSerializer):
    """
    Detailed serializer for ReportExecution.
    """
    report_name = serializers.SerializerMethodField()
    triggered_by_name = serializers.SerializerMethodField()
    schedule_name = serializers.SerializerMethodField()
    
    class Meta(ExecutionBaseSerializer.Meta):
        fields = ExecutionBaseSerializer.Meta.fields + [
            'report_name', 'triggered_by_name', 'schedule_name'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_triggered_by_name(self, obj):
        if obj.triggered_by:
            return obj.triggered_by.get_full_name()
        return None
    
    def get_schedule_name(self, obj):
        if obj.schedule:
            return obj.schedule.name
        return None