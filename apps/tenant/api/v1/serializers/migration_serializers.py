from rest_framework import serializers
from apps.tenant.models import OrganizationMigration


class MigrationSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_completed = serializers.SerializerMethodField()
    is_failed = serializers.SerializerMethodField()
    is_pending = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OrganizationMigration
        fields = [
            'id', 'organization', 'organization_name',
            'migration_name', 'app_name',
            'status', 'status_display',
            'started_at', 'completed_at',
            'error_message', 'error_traceback',
            'execution_time_ms',
            'is_rollback', 'rolled_back_from',
            'is_completed', 'is_failed', 'is_pending',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'started_at', 'completed_at', 'error_message',
            'error_traceback', 'execution_time_ms',
            'created_at', 'updated_at',
            'is_completed', 'is_failed', 'is_pending', 'status_display'
        ]

    def get_is_completed(self, obj):
        return obj.is_completed

    def get_is_failed(self, obj):
        return obj.is_failed

    def get_is_pending(self, obj):
        return obj.is_pending


class MigrationDetailSerializer(MigrationSerializer):
    class Meta(MigrationSerializer.Meta):
        fields = MigrationSerializer.Meta.fields + ['created_by', 'updated_by']
        read_only_fields = MigrationSerializer.Meta.read_only_fields + ['created_by', 'updated_by']


class MigrationCreateSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(required=True)

    class Meta:
        model = OrganizationMigration
        fields = ['organization_id', 'migration_name', 'app_name', 'is_rollback', 'rolled_back_from']

    def validate_organization_id(self, value):
        from apps.tenant.models import Organization
        try:
            Organization.objects.get(id=value, is_deleted=False)
            return value
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Organization not found")

    def validate(self, attrs):
        org_id = attrs.get('organization_id')
        migration_name = attrs.get('migration_name')
        app_name = attrs.get('app_name')
        if OrganizationMigration.objects.filter(
            organization_id=org_id,
            migration_name=migration_name,
            app_name=app_name
        ).exists():
            raise serializers.ValidationError(
                f"Migration '{app_name}.{migration_name}' already exists for this organization"
            )
        return attrs


class MigrationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMigration
        fields = ['status', 'error_message', 'error_traceback', 'execution_time_ms']

    def validate_status(self, value):
        allowed = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK']
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(allowed)}")
        return value


class MigrationStatusSerializer(serializers.Serializer):
    organization_id = serializers.UUIDField(required=True)
    status = serializers.ChoiceField(
        choices=['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK']
    )

    def validate_organization_id(self, value):
        from apps.tenant.models import Organization
        try:
            Organization.objects.get(id=value, is_deleted=False)
            return value
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Organization not found")


class MigrationStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    running = serializers.IntegerField()
    completed = serializers.IntegerField()
    failed = serializers.IntegerField()
    rolled_back = serializers.IntegerField()
    avg_execution_time_ms = serializers.FloatField(allow_null=True)
    last_migration_at = serializers.DateTimeField(allow_null=True)