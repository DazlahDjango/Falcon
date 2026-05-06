from rest_framework import serializers
from django.utils import timezone
from apps.tenant.models import ConnectionPool, ConnectionStatus
from .base import BaseSerializer

class ConnectionStatusSerializer(BaseSerializer):
    status = serializers.ChoiceField(choices=ConnectionStatus.choices)
    error_message = serializers.CharField(required=False, allow_blank=True)
    def validate(self, attrs):
        status = attrs.get('status')
        error_message = attrs.get('error_message', '')

        if status == ConnectionStatus.ERROR and not error_message:
            raise serializers.ValidationError(
                "Error message required when marking connection as ERROR"
            )
        return attrs

class ConnectionPoolListSerializer(BaseSerializer):
    id = serializers.UUIDField(read_only=True)
    connection_id = serializers.CharField(read_only=True)
    tenant_id = serializers.UUIDField(read_only=True)
    tenant_name = serializers.SerializerMethodField(read_only=True)
    status = serializers.ChoiceField(choices=ConnectionStatus.choices, read_only=True)
    database_name = serializers.CharField(read_only=True)
    schema_name = serializers.CharField(read_only=True)
    connected_at = serializers.DateTimeField(read_only=True)
    last_used_at = serializers.DateTimeField(read_only=True)
    closed_at = serializers.DateTimeField(read_only=True)
    error_message = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    idle_duration_seconds = serializers.IntegerField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    class Meta:
        model = ConnectionPool
        fields = [
            'id', 'connection_id', 'tenant_id', 'tenant_name', 'status',
            'database_name', 'schema_name', 'connected_at', 'last_used_at',
            'closed_at', 'error_message', 'is_active', 'idle_duration_seconds',
            'created_at', 'updated_at'
        ]
    def get_tenant_name(self, obj):
        return obj.tenant.name if obj.tenant else None


class ConnectionPoolDetailSerializer(ConnectionPoolListSerializer):
    class Meta(ConnectionPoolListSerializer.Meta):
        fields = ConnectionPoolListSerializer.Meta.fields + [
            'metadata'
        ]

class ConnectionPoolCreateSerializer(BaseSerializer):
    tenant_id = serializers.UUIDField(required=True)
    database_name = serializers.CharField(required=False, allow_blank=True)
    schema_name = serializers.CharField(required=False, allow_blank=True)
    def validate_tenant_id(self, value):
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=value, is_active=True)
            return value
        except Client.DoesNotExist:
            raise serializers.ValidationError("Tenant not found or inactive")


class ConnectionMetricsSerializer(BaseSerializer):
    total_connections = serializers.IntegerField()
    active_connections = serializers.IntegerField()
    idle_connections = serializers.IntegerField()
    error_connections = serializers.IntegerField()
    closed_connections = serializers.IntegerField()
    avg_connection_duration_seconds = serializers.FloatField(allow_null=True)
    max_concurrent_connections = serializers.IntegerField()
    connections_last_hour = serializers.IntegerField()
    connections_last_24h = serializers.IntegerField()

class ConnectionHealthCheckSerializer(BaseSerializer):
    tenant_id = serializers.UUIDField()
    is_healthy = serializers.BooleanField()
    response_time_ms = serializers.IntegerField()
    error_message = serializers.CharField(required=False, allow_blank=True)
    last_successful_check = serializers.DateTimeField()
    connection_status = serializers.CharField()


class ConnectionManagerActionSerializer(BaseSerializer):
    action = serializers.ChoiceField(
        choices=['close', 'reset', 'recycle', 'close_all_idle'],
        required=True
    )
    tenant_id = serializers.UUIDField(required=False, allow_null=True)
    idle_minutes = serializers.IntegerField(
        required=False,
        default=30,
        min_value=1,
        max_value=1440  # 24 hours max
    )
    def validate(self, attrs):
        action = attrs.get('action')
        tenant_id = attrs.get('tenant_id')
        if action in ['close', 'reset', 'recycle'] and not tenant_id:
            raise serializers.ValidationError(
                f"tenant_id required for action: {action}"
            )
        return attrs