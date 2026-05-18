from rest_framework import serializers
from apps.configs.models import ConfigAuditLog

class ConfigAuditLogSerializer(serializers.ModelSerializer):
    target_app_name = serializers.CharField(source='target_app.name', read_only=True)
    performed_by_email_display = serializers.CharField(source='performed_by_email', read_only=True)
    class Meta:
        model = ConfigAuditLog
        fields = ['id', 'action', 'performed_by', 'performed_by_role', 'performed_by_email', 'performed_by_email_display', 'performed_at', 'ip_address', 'user_agent', 'target_app', 'target_app_name', 'target_id', 'details', 'result', 'error_message', 'request_id', 'created_at']
        read_only_fields = ['id', 'created_at', 'performed_at']