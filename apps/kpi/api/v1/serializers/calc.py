from rest_framework import serializers

class TriggerCalculationSerializer(serializers.Serializer):
    year = serializers.IntegerField(min_value=2020, max_value=2100)
    month = serializers.IntegerField(min_value=1, max_value=12)
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="Optional list of specific users to calculate"
    )
    force = serializers.BooleanField(default=False)

    def validate(self, data):
        year = data.get('year')
        month = data.get('month')
        from django.utils import timezone
        now = timezone.now()
        if year > now.year + 1:
            raise serializers.ValidationError("Cannot calculate for years beyond next year")
        return data

class CalculationStatusSerializer(serializers.Serializer):
    task_id = serializers.CharField(required=False, allow_null=True)
    status = serializers.CharField()
    result = serializers.DictField(required=False)
    error = serializers.CharField(required=False, allow_null=True)
    started_at = serializers.DateTimeField(required=False, allow_null=True)
    completed_at = serializers.DateTimeField(required=False, allow_null=True)