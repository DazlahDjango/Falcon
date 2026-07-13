from rest_framework import serializers
from django.utils import timezone
from apps.tenant.models import OrganizationConnection


class ConnectionSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_active = serializers.SerializerMethodField()
    idle_duration_seconds = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OrganizationConnection
        fields = [
            'id', 'connection_id', 'organization', 'organization_name',
            'status', 'status_display', 'database_name', 'schema_name',
            'connected_at', 'last_used_at', 'closed_at', 'error_message',
            'is_active', 'idle_duration_seconds',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'connection_id', 'connected_at', 'last_used_at',
            'closed_at', 'error_message', 'created_at', 'updated_at',
            'is_active', 'idle_duration_seconds', 'status_display'
        ]

    def get_is_active(self, obj):
        return obj.is_active

    def get_idle_duration_seconds(self, obj):
        return obj.idle_duration_seconds


class ConnectionDetailSerializer(ConnectionSerializer):
    class Meta(ConnectionSerializer.Meta):
        fields = ConnectionSerializer.Meta.fields + ['created_by', 'updated_by']
        read_only_fields = ConnectionSerializer.Meta.read_only_fields + ['created_by', 'updated_by']


class ConnectionCreateSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(required=True)

    class Meta:
        model = OrganizationConnection
        fields = ['organization_id', 'database_name', 'schema_name']

    def validate_organization_id(self, value):
        from apps.tenant.models import Organization
        try:
            Organization.objects.get(id=value, is_deleted=False)
            return value
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Organization not found")


class ConnectionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationConnection
        fields = ['status', 'error_message']

    def validate_status(self, value):
        allowed = ['ACTIVE', 'IDLE', 'CLOSED', 'ERROR']
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(allowed)}")
        return value

    def validate(self, attrs):
        status = attrs.get('status')
        error_message = attrs.get('error_message', '')
        if status == 'ERROR' and not error_message:
            raise serializers.ValidationError("Error message required when marking connection as ERROR")
        return attrs


class ConnectionStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['ACTIVE', 'IDLE', 'CLOSED', 'ERROR'])
    error_message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        status = attrs.get('status')
        error_message = attrs.get('error_message', '')
        if status == 'ERROR' and not error_message:
            raise serializers.ValidationError("Error message required when marking connection as ERROR")
        return attrs


class ConnectionMetricsSerializer(serializers.Serializer):
    total_connections = serializers.IntegerField()
    active_connections = serializers.IntegerField()
    idle_connections = serializers.IntegerField()
    error_connections = serializers.IntegerField()
    closed_connections = serializers.IntegerField()
    avg_connection_duration_seconds = serializers.FloatField(allow_null=True)
    max_concurrent_connections = serializers.IntegerField(required=False, allow_null=True)
    connections_last_hour = serializers.IntegerField()
    connections_last_24h = serializers.IntegerField()
    local_acquisitions = serializers.IntegerField(required=False)
    local_failures = serializers.IntegerField(required=False)
    local_recycles = serializers.IntegerField(required=False)
    avg_lock_wait_time_seconds = serializers.FloatField(required=False)


class ConnectionHealthCheckSerializer(serializers.Serializer):
    organization_id = serializers.UUIDField()
    is_healthy = serializers.BooleanField()
    response_time_ms = serializers.IntegerField()
    error_message = serializers.CharField(required=False, allow_blank=True)
    last_successful_check = serializers.DateTimeField()
    connection_status = serializers.CharField()


class ConnectionActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=['close', 'reset', 'recycle', 'close_all_idle', 'pause', 'resume', 'prewarm', 'drain'],
        required=True
    )
    organization_id = serializers.UUIDField(required=False, allow_null=True)
    idle_minutes = serializers.IntegerField(
        required=False,
        default=30,
        min_value=1,
        max_value=1440
    )

    def validate(self, attrs):
        action = attrs.get('action')
        org_id = attrs.get('organization_id')
        if action in ['close', 'reset', 'recycle', 'pause', 'resume'] and not org_id:
            raise serializers.ValidationError(
                f"organization_id required for action: {action}"
            )
        return attrs