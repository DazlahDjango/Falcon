from rest_framework import serializers
from apps.configs.models import MaintenanceWindow, MaintenanceLog
from apps.configs.constants import MaintenanceType, MaintenanceStatus

class MaintenanceWindowSerializer(serializers.ModelSerializer):
    affected_app_names = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    class Meta:
        model = MaintenanceWindow
        fields = ['id', 'title', 'maintenance_type', 'status', 'affected_apps', 'affected_app_names', 'scheduled_start', 'scheduled_end', 'duration_minutes', 'actual_start', 'actual_end', 'triggered_by', 'triggered_by_role', 'reason', 'expected_downtime_minutes', 'is_weekday_only', 'notification_sent_at', 'notification_message', 'rollback_plan', 'completed_by', 'created_at']
        read_only_fields = ['id', 'created_at', 'actual_start', 'actual_end', 'notification_sent_at']
    def get_affected_app_names(self, obj):
        return list(obj.affected_apps.values_list('name', flat=True))
    def get_duration_minutes(self, obj):
        if obj.actual_start and obj.actual_end:
            return int((obj.actual_end - obj.actual_start).total_seconds() / 60)
        return None

class MaintenanceWindowDetailSerializer(serializers.ModelSerializer):
    affected_app_names = serializers.SerializerMethodField()
    logs = serializers.SerializerMethodField()
    class Meta:
        model = MaintenanceWindow
        fields = ['id', 'title', 'maintenance_type', 'status', 'affected_apps', 'affected_app_names', 'scheduled_start', 'scheduled_end', 'actual_start', 'actual_end', 'triggered_by', 'triggered_by_role', 'reason', 'expected_downtime_minutes', 'is_weekday_only', 'notification_sent_at', 'notification_message', 'rollback_plan', 'logs', 'created_at']
        read_only_fields = ['id', 'created_at']
    def get_affected_app_names(self, obj):
        return list(obj.affected_apps.values_list('name', flat=True))
    def get_logs(self, obj):
        return MaintenanceLogSerializer(obj.logs.all(), many=True).data

class MaintenanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceLog
        fields = ['id', 'maintenance_window', 'action', 'performed_by', 'performed_by_role', 'performed_at', 'details', 'previous_status', 'new_status', 'duration_seconds']
        read_only_fields = ['id', 'performed_at']

class MaintenanceActionSerializer(serializers.Serializer):
    window_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['start', 'stop', 'cancel', 'extend'])
    extend_minutes = serializers.IntegerField(min_value=15, max_value=1440, required=False)
    def validate_window_id(self, value):
        from apps.configs.models import MaintenanceWindow
        if not MaintenanceWindow.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Maintenance window {value} not found")
        return value