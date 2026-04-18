from rest_framework import serializers

class TenantAwareSerializer(serializers.ModelSerializer):
    tenant_id = serializers.UUIDField(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    updated_by = serializers.StringRelatedField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class AuditTrailSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    updated_by_email = serializers.EmailField(source='updated_by.email', read_only=True)
