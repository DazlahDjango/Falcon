from rest_framework import serializers
from django.utils import timezone

class UsageRecordSerializer(serializers.Serializer):
    usage_type = serializers.CharField()
    current_value = serializers.IntegerField()
    limit_value = serializers.IntegerField()
    percentage_used = serializers.DecimalField(max_digits=5, decimal_places=2)
    remaining = serializers.IntegerField()
    is_soft_limit_exceeded = serializers.BooleanField()
    is_hard_limit_exceeded = serializers.BooleanField()

class UsageTrackSerializer(serializers.Serializer):
    usage_type = serializers.CharField()
    delta = serializers.IntegerField(default=1, min_value=1, max_value=10000)
    def validate_usage_type(self, value):
        valid_types = ['users', 'kpis', 'api_calls', 'storage', 'departments']
        if value not in valid_types:
            raise serializers.ValidationError(f"Usage type must be one of: {', '.join(valid_types)}")
        return value

class UsageSummarySerializer(serializers.Serializer):
    tenant_id = serializers.UUIDField()
    subscription_id = serializers.UUIDField()
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
    usage = serializers.DictField(child=UsageRecordSerializer())
    days_remaining = serializers.IntegerField()
    alerts = serializers.ListField()

class UsageAlertSerializer(serializers.Serializer):
    alert_type = serializers.ChoiceField(choices=['soft', 'hard'])
    usage_type = serializers.CharField()
    current_value = serializers.IntegerField()
    limit_value = serializers.IntegerField()
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    message = serializers.CharField()
    sent_at = serializers.DateTimeField()