# apps/reportplt/api/v1/serializers/audit.py
from rest_framework import serializers
from apps.reportplt.models import ReportAudit
from apps.reportplt.constants import AuditAction
from .common import BaseModelSerializer

class AuditBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportAudit model.
    """
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = ReportAudit
        fields = [
            'id', 'report', 'dashboard', 'user', 'action',
            'action_display', 'ip_address', 'user_agent',
            'session_id', 'details', 'changes', 'previous_value',
            'new_value', 'success', 'error_message', 'duration',
            'created_at', 'updated_at', 'created_by', 'modified_by',
            'tenant_id', 'is_deleted'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by',
            'modified_by', 'tenant_id', 'is_deleted'
        ]

class AuditListSerializer(AuditBaseSerializer):
    """
    List serializer for ReportAudit.
    """
    user_name = serializers.SerializerMethodField()
    report_name = serializers.SerializerMethodField()
    
    class Meta(AuditBaseSerializer.Meta):
        fields = [
            'id', 'user', 'user_name', 'report', 'report_name',
            'action', 'action_display', 'ip_address', 'success',
            'duration', 'created_at'
        ]
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return 'Anonymous'
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None

class AuditDetailSerializer(AuditBaseSerializer):
    """
    Detailed serializer for ReportAudit.
    """
    user_name = serializers.SerializerMethodField()
    report_name = serializers.SerializerMethodField()
    dashboard_name = serializers.SerializerMethodField()
    
    class Meta(AuditBaseSerializer.Meta):
        fields = AuditBaseSerializer.Meta.fields + [
            'user_name', 'report_name', 'dashboard_name'
        ]
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return 'Anonymous'
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_dashboard_name(self, obj):
        if obj.dashboard:
            return obj.dashboard.name
        return None