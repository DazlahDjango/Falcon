from rest_framework import serializers
from apps.configs.models import RegisteredApp, AppDependency

class RegisteredAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredApp
        fields = ['id', 'name', 'display_name', 'is_registered', 'is_critical', 'recovery_priority', 'rpo_minutes', 'rto_minutes', 'backup_retention_days', 'database_table_name', 'health_check_endpoint', 'recovery_script_path', 'metadata', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class RegisteredAppDetailSerializer(serializers.ModelSerializer):
    backup_policy = serializers.SerializerMethodField()
    dr_plans = serializers.SerializerMethodField()
    class Meta:
        model = RegisteredApp
        fields = ['id', 'name', 'display_name', 'is_registered', 'is_critical', 'recovery_priority', 'rpo_minutes', 'rto_minutes', 'backup_retention_days', 'database_table_name', 'health_check_endpoint', 'recovery_script_path', 'metadata', 'backup_policy', 'dr_plans', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    def get_backup_policy(self, obj):
        from apps.configs.api.v1.serializers.backup import BackupPolicySerializer
        if hasattr(obj, 'backup_policy'):
            return BackupPolicySerializer(obj.backup_policy).data
        return None
    def get_dr_plans(self, obj):
        from apps.configs.api.v1.serializers.disaster_recovery import DisasterRecoveryPlanSerializer
        plans = obj.dr_plans.filter(status='active')
        return DisasterRecoveryPlanSerializer(plans, many=True).data

class AppDependencySerializer(serializers.ModelSerializer):
    source_app_name = serializers.CharField(source='source_app.name', read_only=True)
    target_app_name = serializers.CharField(source='target_app.name', read_only=True)
    class Meta:
        model = AppDependency
        fields = ['id', 'source_app', 'source_app_name', 'target_app', 'target_app_name', 'dependency_type', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']