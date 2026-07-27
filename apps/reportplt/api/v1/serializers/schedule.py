# apps/reportplt/api/v1/serializers/schedule.py
from rest_framework import serializers
from django.utils import timezone
from apps.reportplt.models import ReportSchedule
from apps.reportplt.constants import ScheduleFrequency
from .common import BaseModelSerializer, AuditTrailSerializer

class ScheduleBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportSchedule model.
    """
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_due = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    cc_recipients = serializers.JSONField(required=False, default=list)
    bcc_recipients = serializers.JSONField(required=False, default=list)
    custom_params = serializers.JSONField(required=False, default=dict)
    
    class Meta:
        model = ReportSchedule
        fields = [
            'id', 'report', 'name', 'frequency', 'frequency_display',
            'status', 'status_display', 'is_active', 'is_paused', 'owner',
            'recipients', 'cc_recipients', 'bcc_recipients', 'delivery_method',
            'webhook_url', 's3_path', 'next_run_at', 'last_run_at',
            'last_run_status', 'started_at', 'completed_at', 'expires_at',
            'retry_count', 'max_retries', 'retry_delay', 'cron_expression',
            'timezone', 'custom_params', 'include_attachments',
            'compress_attachments', 'password_protect', 'expiry_days',
            'created_at', 'updated_at', 'created_by', 'modified_by',
            'tenant_id', 'is_deleted', 'is_due', 'is_expired'
        ]
        read_only_fields = [
            'id', 'status', 'next_run_at', 'last_run_at', 'last_run_status',
            'started_at', 'completed_at', 'retry_count', 'created_at',
            'updated_at', 'created_by', 'modified_by', 'tenant_id', 'is_deleted'
        ]
    
    def get_is_due(self, obj):
        return obj.is_due()
    
    def get_is_expired(self, obj):
        return obj.is_expired()

class ScheduleListSerializer(ScheduleBaseSerializer):
    """
    List serializer for ReportSchedule.
    """
    report_name = serializers.SerializerMethodField()
    
    class Meta(ScheduleBaseSerializer.Meta):
        fields = [
            'id', 'name', 'report', 'report_name', 'frequency',
            'frequency_display', 'status', 'status_display', 'is_active',
            'is_paused', 'next_run_at', 'last_run_at', 'is_due', 'is_expired'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None

class ScheduleDetailSerializer(ScheduleBaseSerializer):
    """
    Detailed serializer for ReportSchedule.
    """
    owner_name = serializers.SerializerMethodField()
    report_name = serializers.SerializerMethodField()
    execution_count = serializers.SerializerMethodField()
    
    class Meta(ScheduleBaseSerializer.Meta):
        fields = ScheduleBaseSerializer.Meta.fields + [
            'owner_name', 'report_name', 'execution_count'
        ]
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_execution_count(self, obj):
        return obj.executions.count()

class ScheduleCreateSerializer(ScheduleBaseSerializer):
    """
    Create serializer for ReportSchedule.
    """
    class Meta(ScheduleBaseSerializer.Meta):
        fields = [
            'report', 'name', 'frequency', 'cron_expression',
            'recipients', 'cc_recipients', 'bcc_recipients',
            'delivery_method', 'webhook_url', 's3_path', 'is_active',
            'max_retries', 'retry_delay', 'timezone', 'custom_params',
            'include_attachments', 'compress_attachments',
            'password_protect', 'password', 'expiry_days'
        ]
    
    def validate(self, attrs):
        frequency = attrs.get('frequency')
        if frequency == ScheduleFrequency.CUSTOM and not attrs.get('cron_expression'):
            raise serializers.ValidationError({"cron_expression": "Cron expression is required for custom frequency"})
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        validated_data['owner'] = request.user if request else None
        validated_data['status'] = 'pending'
        from apps.reportplt.services.scheduler.schedule_manager import ScheduleManager
        manager = ScheduleManager(request.user)
        return manager.create_schedule(validated_data)

class ScheduleUpdateSerializer(ScheduleBaseSerializer):
    """
    Update serializer for ReportSchedule.
    """
    class Meta(ScheduleBaseSerializer.Meta):
        fields = [
            'name', 'frequency', 'cron_expression', 'recipients',
            'cc_recipients', 'bcc_recipients', 'delivery_method',
            'webhook_url', 's3_path', 'max_retries', 'retry_delay',
            'timezone', 'custom_params', 'include_attachments',
            'compress_attachments', 'password_protect', 'password',
            'expiry_days'
        ]

class ScheduleActionSerializer(serializers.Serializer):
    """
    Serializer for schedule actions.
    """
    action = serializers.ChoiceField(choices=[
        ('pause', 'Pause'),
        ('resume', 'Resume'),
        ('activate', 'Activate'),
        ('deactivate', 'Deactivate'),
        ('run_now', 'Run Now'),
    ])
    
    def validate(self, attrs):
        request = self.context.get('request')
        schedule = self.context.get('schedule')
        if request and schedule:
            from apps.reportplt.services.security.report_rbac import ReportRBAC
            rbac = ReportRBAC(request.user)
            if not rbac.can_edit_report(schedule.report):
                raise serializers.ValidationError("You do not have permission to modify this schedule")
        return attrs