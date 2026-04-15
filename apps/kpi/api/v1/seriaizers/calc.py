from rest_framework import serializers

class TriggerCalculationSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="Optional list of specific users to calculate"
    )
    force = serializers.BooleanField(default=False)
    def validate(self, data):
        from ....utils.date_utils import validate_period
        try:
            validate_period(data['year'], data['month'], allow_future=True)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return data

class CalculationStatusSerializer(serializers.Serializer):
    task_id = serializers.CharField()
    status = serializers.CharField()
    result = serializers.DictField(required=False)
    error = serializers.CharField(required=False)
    started_at = serializers.DateTimeField(required=False)
    completed_at = serializers.DateTimeField(required=False)