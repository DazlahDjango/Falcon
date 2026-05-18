from rest_framework import serializers
from apps.configs.models import HealthCheck, HealthCheckHistory

class HealthCheckSerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    class Meta:
        model = HealthCheck
        fields = ['id', 'app', 'app_name', 'status', 'status_code', 'response_time_ms', 'error_rate_percent', 'message', 'details', 'consecutive_failures', 'last_successful_check', 'created_at']
        read_only_fields = ['id', 'created_at']

class HealthCheckHistorySerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    class Meta:
        model = HealthCheckHistory
        fields = ['id', 'app', 'app_name', 'previous_status', 'new_status', 'changed_at', 'trigger_conditional_maintenance', 'maintenance_window']
        read_only_fields = ['id', 'changed_at']