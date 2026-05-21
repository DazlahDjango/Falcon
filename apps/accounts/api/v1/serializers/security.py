from rest_framework import serializers
from apps.accounts.models import LoginAttempt


class LoginAttemptSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = LoginAttempt
        fields = [
            'id', 'user', 'user_email', 'identifier', 'result', 'failure_reason',
            'ip_address', 'user_agent', 'attempted_at', 'metadata',
        ]
        read_only_fields = fields

    def get_user_email(self, obj):
        return obj.user.email if obj.user_id else None


class LockoutSummarySerializer(serializers.Serializer):
    failures_last_15m = serializers.IntegerField()
    locked_attempts_last_24h = serializers.IntegerField()
    unique_ips_with_failures = serializers.IntegerField()
    top_failure_identifiers = serializers.ListField(child=serializers.DictField())
    lockout_policy = serializers.DictField(required=False)


class TenantPolicySerializer(serializers.Serializer):
    policy = serializers.DictField()
    policy_version = serializers.IntegerField()
    client_id = serializers.CharField()
