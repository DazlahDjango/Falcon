from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import AuditLog
from apps.accounts.constants import AuditSeverity, AuditActionTypes
from .base import DynamicFieldsModelSerializer
from .user import UserMinimalSerializer

class AuditLogListSerializer(DynamicFieldsModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    severity_display = serializers.SerializerMethodField()
    action_type_display = serializers.SerializerMethodField()
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'action', 'action_type', 'action_type_display',
            'severity', 'severity_display', 'ip_address', 'content_type',
            'object_id', 'object_repr', 'timestamp', 'created_at'
        ]
        read_only_fields = ['id', 'timestamp', 'created_at']

    def get_severity_display(self, obj):
        return dict(AuditSeverity.CHOICES).get(obj.severity. obj.severity)
    def get_action_type_display(self, obj):
        return dict(AuditActionTypes.CHOICES).get(obj.action_type, obj.action_type)
    
class AuditLogDetailSerializer(AuditLogListSerializer):
    class Meta(AuditLogListSerializer.Meta):
        fields = AuditLogListSerializer.Meta.fields + [
            'user_agent', 'referer', 'request_method', 'request_path',
            'old_value', 'new_value', 'changes', 'metadata'
        ]

class AuditLogSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'timestamp', 'tenant_id']

class AuditLogExportSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    format = serializers.ChoiceField(choices=['json', 'csv', 'excel'], default='json')
    severity = serializers.ChoiceField(choices=AuditSeverity.CHOICES, required=False)
    action_type = serializers.ChoiceField(choices=AuditActionTypes.CHOICES, required=False)