# apps/dashboard/api/v1/serializers/staff.py

from rest_framework import serializers
from apps.dashboard.constants import TrafficLight


class StaffKPICardSerializer(serializers.Serializer):
    """KPI card with status for staff dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    target = serializers.FloatField(required=False, allow_null=True)
    actual = serializers.FloatField(required=False, allow_null=True)
    score = serializers.FloatField(required=False, allow_null=True)
    traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    unit = serializers.CharField(required=False, allow_blank=True)
    weight = serializers.IntegerField(default=1)
    status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected', 'not_submitted', 'submitted']
    )


class PendingSubmissionSerializer(serializers.Serializer):
    """Pending submission serializer."""
    id = serializers.UUIDField()
    kpi_id = serializers.UUIDField()
    kpi_name = serializers.CharField()
    actual_value = serializers.FloatField()
    submitted_at = serializers.CharField(required=False, allow_null=True)


class StaffSupervisorInfoSerializer(serializers.Serializer):
    """Supervisor information for staff dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()


class StaffUserInfoSerializer(serializers.Serializer):
    """User info for staff dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    department = serializers.CharField(required=False, allow_blank=True)
    supervisor = StaffSupervisorInfoSerializer(required=False, allow_null=True)


class StaffDashboardDataSerializer(serializers.Serializer):
    """Staff Dashboard aggregated data serializer."""
    dashboard_type = serializers.CharField(default='staff')
    period = serializers.CharField()
    user = StaffUserInfoSerializer()
    kpis = StaffKPICardSerializer(many=True)
    overall_score = serializers.FloatField(required=False, allow_null=True)
    traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    green_count = serializers.IntegerField(default=0)
    yellow_count = serializers.IntegerField(default=0)
    red_count = serializers.IntegerField(default=0)
    pending_submissions = PendingSubmissionSerializer(many=True)
    last_updated = serializers.CharField()