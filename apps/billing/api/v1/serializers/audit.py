from rest_framework import serializers

class AuditLogSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    user_email = serializers.EmailField()
    user_role = serializers.CharField()
    user_ip = serializers.CharField(allow_null=True)
    tenant_id = serializers.UUIDField()
    action = serializers.CharField()
    resource_type = serializers.CharField()
    resource_id = serializers.CharField()
    resource_name = serializers.CharField()
    changes = serializers.DictField()
    success = serializers.BooleanField()
    error_message = serializers.CharField()
    reason = serializers.CharField()
    metadata = serializers.DictField()
    created_at = serializers.DateTimeField()

class AuditLogListSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    user_email = serializers.EmailField()
    action = serializers.CharField()
    resource_type = serializers.CharField()
    resource_name = serializers.CharField()
    success = serializers.BooleanField()
    created_at = serializers.DateTimeField()

class AuditLogDetailSerializer(AuditLogSerializer):
    before = serializers.DictField()
    after = serializers.DictField()
    related_transaction_id = serializers.CharField(allow_null=True)
    related_subscription_id = serializers.CharField(allow_null=True)
    related_invoice_id = serializers.CharField(allow_null=True)

class AuditLogFilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    action = serializers.CharField(required=False)
    resource_type = serializers.CharField(required=False)
    user_email = serializers.EmailField(required=False)
    success = serializers.BooleanField(required=False)
    tenant_id = serializers.UUIDField(required=False)
    limit = serializers.IntegerField(default=50, min_value=1, max_value=500)
    offset = serializers.IntegerField(default=0, min_value=0)