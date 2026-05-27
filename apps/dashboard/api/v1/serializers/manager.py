# apps/dashboard/api/v1/serializers/manager.py

from rest_framework import serializers
from apps.dashboard.constants import TrafficLight


class KPICardSerializer(serializers.Serializer):
    """KPI card data for manager dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    target = serializers.FloatField(required=False, allow_null=True)
    actual = serializers.FloatField(required=False, allow_null=True)
    score = serializers.FloatField(required=False, allow_null=True)
    traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    unit = serializers.CharField(required=False, allow_blank=True)
    weight = serializers.IntegerField(default=1)


class TeamMemberCardSerializer(serializers.Serializer):
    """Team member card for manager dashboard."""
    user_id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    department = serializers.CharField(required=False, allow_blank=True)
    green_count = serializers.IntegerField(default=0)
    yellow_count = serializers.IntegerField(default=0)
    red_count = serializers.IntegerField(default=0)
    overall_score = serializers.FloatField(required=False, allow_null=True)
    traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    has_pending_approval = serializers.BooleanField(default=False)


class TeamSummarySerializer(serializers.Serializer):
    """Team summary for manager dashboard."""
    total_members = serializers.IntegerField()
    average_score = serializers.FloatField(required=False, allow_null=True)
    total_green = serializers.IntegerField()
    total_yellow = serializers.IntegerField()
    total_red = serializers.IntegerField()


class ManagerUserInfoSerializer(serializers.Serializer):
    """User info for manager dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    department = serializers.CharField(required=False, allow_blank=True)


class ManagerDashboardDataSerializer(serializers.Serializer):
    """Manager Dashboard aggregated data serializer."""
    dashboard_type = serializers.CharField(default='manager')
    period = serializers.CharField()
    user = ManagerUserInfoSerializer()
    personal_kpis = KPICardSerializer(many=True)
    personal_score = serializers.FloatField(required=False, allow_null=True)
    personal_traffic_light = serializers.ChoiceField(choices=TrafficLight.CHOICES)
    pending_approvals = serializers.IntegerField(default=0)
    team_members = TeamMemberCardSerializer(many=True, required=False)
    team_summary = TeamSummarySerializer(required=False)
    last_updated = serializers.CharField()