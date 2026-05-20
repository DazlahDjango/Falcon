# apps/dashboard/api/v1/serializers/read_only.py

from rest_framework import serializers


class ReadOnlyDashboardDataSerializer(serializers.Serializer):
    """Read-only dashboard response serializer."""
    dashboard_type = serializers.CharField()
    period = serializers.CharField()
    read_only = serializers.BooleanField(default=True)
    can_edit = serializers.BooleanField(default=False)
    can_submit = serializers.BooleanField(default=False)
    can_approve = serializers.BooleanField(default=False)
    can_configure = serializers.BooleanField(default=False)
    can_export = serializers.BooleanField(default=True)
    data = serializers.DictField()
    last_updated = serializers.DateTimeField()