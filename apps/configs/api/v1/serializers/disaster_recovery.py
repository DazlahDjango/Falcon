# apps/config/api/v1/serializers/disaster_recovery.py
from rest_framework import serializers
from apps.configs.models import DisasterRecoveryPlan, DisasterRecoveryExecution
from apps.configs.constants import DisasterRecoveryType

class DisasterRecoveryPlanSerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    class Meta:
        model = DisasterRecoveryPlan
        fields = ['id', 'app', 'app_name', 'name', 'version', 'status', 'rpo_target_minutes', 'rto_target_minutes', 'recovery_steps', 'validation_steps', 'failover_script_path', 'failback_script_path', 'standby_replica_arn', 'standby_endpoint', 'last_tested_at', 'test_frequency_days', 'test_successful', 'test_notes', 'owned_by', 'reviewed_by', 'reviewed_at', 'approval_required', 'approved_by', 'approved_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_tested_at', 'reviewed_at', 'approved_at']

class DisasterRecoveryPlanDetailSerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    executions = serializers.SerializerMethodField()
    class Meta:
        model = DisasterRecoveryPlan
        fields = ['id', 'app', 'app_name', 'name', 'version', 'status', 'rpo_target_minutes', 'rto_target_minutes', 'recovery_steps', 'validation_steps', 'failover_script_path', 'failback_script_path', 'standby_replica_arn', 'standby_endpoint', 'last_tested_at', 'test_frequency_days', 'test_successful', 'test_notes', 'owned_by', 'reviewed_by', 'reviewed_at', 'approval_required', 'approved_by', 'approved_at', 'executions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    def get_executions(self, obj):
        return DisasterRecoveryExecutionSerializer(obj.executions.all()[:10], many=True).data

class DisasterRecoveryExecutionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='dr_plan.name', read_only=True)
    app_name = serializers.CharField(source='dr_plan.app.name', read_only=True)
    class Meta:
        model = DisasterRecoveryExecution
        fields = ['id', 'dr_plan', 'plan_name', 'app_name', 'execution_type', 'status', 'triggered_by', 'triggered_by_role', 'triggered_at', 'started_at', 'completed_at', 'backup_job_used', 'rto_achieved_minutes', 'rpo_achieved_minutes', 'steps_executed', 'validation_results', 'issues_encountered', 'notes', 'customer_notified']
        read_only_fields = ['id', 'triggered_at', 'started_at', 'completed_at']

class DRExecuteSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    execution_type = serializers.ChoiceField(choices=DisasterRecoveryType.CHOICES, default=DisasterRecoveryType.ACTUAL)
    def validate_plan_id(self, value):
        from apps.configs.models import DisasterRecoveryPlan
        if not DisasterRecoveryPlan.objects.filter(id=value, status='active').exists():
            raise serializers.ValidationError(f"DR Plan {value} not found or not active")
        return value