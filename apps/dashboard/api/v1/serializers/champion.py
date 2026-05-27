# apps/dashboard/api/v1/serializers/champion.py

from rest_framework import serializers


class ChampionUserInfoSerializer(serializers.Serializer):
    """User info for champion dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    department = serializers.CharField(required=False, allow_blank=True)


class AssignedKPISerializer(serializers.Serializer):
    """Assigned KPI for champion dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    target = serializers.FloatField(required=False, allow_null=True)
    actual = serializers.FloatField(required=False, allow_null=True)
    weight = serializers.IntegerField()
    is_active = serializers.BooleanField()
    category = serializers.CharField(required=False, allow_blank=True)


class AvailableKPISerializer(serializers.Serializer):
    """Available KPI for champion dashboard."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    target = serializers.FloatField(required=False, allow_null=True)
    category = serializers.CharField(required=False, allow_blank=True)


class ChampionDashboardConfigSerializer(serializers.Serializer):
    """Dashboard configuration serializer for champion."""
    layout = serializers.DictField(default=dict)
    filters = serializers.DictField(default=dict)
    widgets = serializers.ListField(default=list)


class ChampionDashboardDataSerializer(serializers.Serializer):
    """Champion Dashboard aggregated data serializer."""
    target_user = ChampionUserInfoSerializer()
    period = serializers.CharField()
    is_editable = serializers.BooleanField(default=True)
    assigned_kpis = AssignedKPISerializer(many=True)
    available_kpis = AvailableKPISerializer(many=True)
    dashboard_config = ChampionDashboardConfigSerializer()
    last_updated = serializers.CharField()