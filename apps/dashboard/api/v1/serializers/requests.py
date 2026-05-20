# apps/dashboard/api/v1/serializers/requests.py

from rest_framework import serializers


class DashboardFilterSerializer(serializers.Serializer):
    """Query parameters for dashboard requests."""
    period = serializers.CharField(required=False, default='current')
    department_id = serializers.UUIDField(required=False, allow_null=True)
    user_id = serializers.UUIDField(required=False, allow_null=True)
    include_team = serializers.BooleanField(required=False, default=True)
    view_type = serializers.CharField(required=False, default='executive')


class SubmitKPISerializer(serializers.Serializer):
    """Request serializer for KPI submission."""
    kpi_id = serializers.UUIDField(required=True)
    value = serializers.FloatField(required=True, min_value=0)
    comments = serializers.CharField(required=False, allow_blank=True)

    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Value cannot be negative")
        return value


class ApprovalActionSerializer(serializers.Serializer):
    """Request serializer for approval actions."""
    submission_id = serializers.UUIDField(required=True)
    comments = serializers.CharField(required=False, allow_blank=True)


class UpdateConfigSerializer(serializers.Serializer):
    """Request serializer for updating dashboard config."""
    user_id = serializers.UUIDField(required=False)
    config = serializers.DictField(required=True)


class KPIAssignmentSerializer(serializers.Serializer):
    """Request serializer for KPI assignment."""
    kpi_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['add', 'remove'])


class WeightUpdateSerializer(serializers.Serializer):
    """Request serializer for weight updates."""
    weights = serializers.DictField(child=serializers.IntegerField(min_value=0, max_value=100))


class TargetUpdateSerializer(serializers.Serializer):
    """Request serializer for target updates."""
    targets = serializers.DictField(child=serializers.FloatField(min_value=0))
    period = serializers.CharField(required=False, default='current')