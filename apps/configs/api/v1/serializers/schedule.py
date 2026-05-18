from rest_framework import serializers
from apps.configs.models import Schedule

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'name', 'schedule_type', 'status', 'cron_expression', 'timezone', 'weekday_only', 'start_date', 'end_date', 'last_run_at', 'next_run_at', 'last_run_status', 'run_count', 'failure_count', 'max_consecutive_failures', 'is_disaster_override', 'created_by', 'created_by_role', 'associated_backup_policy', 'associated_maintenance', 'associated_dr_plan', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_run_at', 'next_run_at', 'run_count', 'failure_count']

class ScheduleDetailSerializer(serializers.ModelSerializer):
    schedule_type_display = serializers.CharField(source='get_schedule_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    next_runs = serializers.SerializerMethodField()
    class Meta:
        model = Schedule
        fields = ['id', 'name', 'schedule_type', 'schedule_type_display', 'status', 'status_display', 'cron_expression', 'timezone', 'weekday_only', 'start_date', 'end_date', 'last_run_at', 'next_run_at', 'next_runs', 'last_run_status', 'run_count', 'failure_count', 'max_consecutive_failures', 'is_disaster_override', 'created_by', 'created_by_role', 'associated_backup_policy', 'associated_maintenance', 'associated_dr_plan', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    def get_next_runs(self, obj):
        from apps.configs.services.scheduling.cron_parser import CronParser
        parser = CronParser()
        try:
            next_runs = parser.get_multiple_runs(obj.cron_expression, count=5)
            return [run.isoformat() for run in next_runs]
        except:
            return []