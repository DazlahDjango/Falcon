from rest_framework import serializers
from apps.tenant.models import OrganizationSchema, Organization


class SchemaSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = OrganizationSchema
        fields = [
            'id', 'schema_name', 'organization', 'organization_name',
            'status', 'is_ready', 'created_at_schema',
            'last_migration_at', 'last_migration_name',
            'table_count', 'size_mb', 'error_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at_schema', 'last_migration_at',
            'last_migration_name', 'table_count', 'size_mb',
            'error_message', 'created_at', 'updated_at'
        ]


class SchemaCreateSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = OrganizationSchema
        fields = ['schema_name', 'organization_id']

    def validate_schema_name(self, value):
        import re
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]{0,62}$', value):
            raise serializers.ValidationError(
                "Schema name must start with a letter and contain only letters, numbers, and underscores"
            )
        if OrganizationSchema.objects.filter(schema_name=value).exists():
            raise serializers.ValidationError(f"Schema '{value}' already exists")
        return value

    def validate_organization_id(self, value):
        if not Organization.objects.filter(id=value, is_deleted=False).exists():
            raise serializers.ValidationError(f"Organization with ID '{value}' not found")
        if OrganizationSchema.objects.filter(organization_id=value).exists():
            raise serializers.ValidationError(f"Organization already has a schema")
        return value

    def create(self, validated_data):
        from apps.tenant.services import SchemaService
        service = SchemaService()
        org_id = validated_data.pop('organization_id')
        return service.create_schema(org_id, validated_data['schema_name'])


class SchemaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSchema
        fields = ['status', 'is_ready', 'error_message']

    def validate_status(self, value):
        allowed = ['ACTIVE', 'MIGRATING', 'FAILED']
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(allowed)}")
        return value


class SchemaDetailSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationSchema
        fields = [
            'id', 'schema_name', 'organization', 'organization_name',
            'status', 'is_ready', 'is_active',
            'created_at_schema', 'last_migration_at', 'last_migration_name',
            'table_count', 'size_mb', 'error_message',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = '__all__'

    def get_is_active(self, obj):
        return obj.is_active