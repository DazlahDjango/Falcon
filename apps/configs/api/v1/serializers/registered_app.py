from rest_framework import serializers
from apps.configs.models import RegisteredApp, AppDependency


class RegisteredAppSerializer(serializers.ModelSerializer):
    dependency_count = serializers.SerializerMethodField()
    cia_classification = serializers.SerializerMethodField()
    name_display = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = RegisteredApp
        fields = [
            'id', 'name', 'name_display', 'display_name', 'is_registered', 'is_critical',
            'recovery_priority', 'rpo_minutes', 'rto_minutes', 'backup_retention_days',
            'database_table_name', 'health_check_endpoint', 'recovery_script_path',
            'metadata', 'dependency_count', 'cia_classification', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'name', 'created_at', 'updated_at']

    def get_dependency_count(self, obj):
        return obj.dependencies_as_source.count()

    def get_cia_classification(self, obj):
        cia = (obj.metadata or {}).get('cia', {})
        return {
            'confidentiality': cia.get('confidentiality_level', 'internal'),
            'integrity': cia.get('integrity_level', 'high'),
            'availability': cia.get('availability_tier', 'standard'),
            'is_critical': obj.is_critical,
        }

    def validate_recovery_priority(self, value):
        if value not in (1, 2, 3, 4):
            raise serializers.ValidationError('Recovery priority must be between 1 (critical) and 4 (low).')
        return value

    def validate(self, attrs):
        rpo = attrs.get('rpo_minutes', getattr(self.instance, 'rpo_minutes', None))
        rto = attrs.get('rto_minutes', getattr(self.instance, 'rto_minutes', None))
        if rpo is not None and rto is not None and rto < rpo:
            raise serializers.ValidationError({'rto_minutes': 'RTO must be greater than or equal to RPO (availability constraint).'})
        return attrs


class RegisteredAppDetailSerializer(RegisteredAppSerializer):
    backup_policy = serializers.SerializerMethodField()
    dr_plans = serializers.SerializerMethodField()
    dependencies = serializers.SerializerMethodField()

    class Meta(RegisteredAppSerializer.Meta):
        fields = RegisteredAppSerializer.Meta.fields + ['backup_policy', 'dr_plans', 'dependencies']

    def get_backup_policy(self, obj):
        from apps.configs.api.v1.serializers.backup import BackupPolicySerializer
        if hasattr(obj, 'backup_policy'):
            return BackupPolicySerializer(obj.backup_policy).data
        return None

    def get_dr_plans(self, obj):
        from apps.configs.api.v1.serializers.disaster_recovery import DisasterRecoveryPlanSerializer
        plans = obj.dr_plans.filter(status='active')
        return DisasterRecoveryPlanSerializer(plans, many=True).data

    def get_dependencies(self, obj):
        deps = obj.dependencies_as_source.select_related('target_app')
        return [
            {
                'id': str(dep.id),
                'target_app': dep.target_app.name,
                'target_display': dep.target_app.display_name,
                'dependency_type': dep.dependency_type,
                'description': dep.description,
            }
            for dep in deps
        ]


class AppDependencySerializer(serializers.ModelSerializer):
    source_app_name = serializers.CharField(source='source_app.name', read_only=True)
    target_app_name = serializers.CharField(source='target_app.name', read_only=True)

    class Meta:
        model = AppDependency
        fields = [
            'id', 'source_app', 'source_app_name', 'target_app', 'target_app_name',
            'dependency_type', 'description', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        source = attrs.get('source_app') or getattr(self.instance, 'source_app', None)
        target = attrs.get('target_app') or getattr(self.instance, 'target_app', None)
        if source and target and source.id == target.id:
            raise serializers.ValidationError('An app cannot depend on itself.')
        return attrs
