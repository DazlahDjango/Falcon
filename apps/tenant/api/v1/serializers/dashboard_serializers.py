from rest_framework import serializers


class OrganizationStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    active = serializers.IntegerField()
    suspended = serializers.IntegerField()
    archived = serializers.IntegerField()


class DomainStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    active = serializers.IntegerField()
    pending = serializers.IntegerField()
    failed = serializers.IntegerField()
    expiring_soon = serializers.IntegerField()


class ResourceStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    exceeded = serializers.IntegerField()
    warning = serializers.IntegerField()


class SuperAdminDashboardSerializer(serializers.Serializer):
    organizations = OrganizationStatsSerializer()
    domains = DomainStatsSerializer()
    resources = ResourceStatsSerializer()
    recent_organizations = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    system_health = serializers.DictField()
    total_users = serializers.IntegerField()


class ClientAdminDashboardSerializer(serializers.Serializer):
    organization = serializers.DictField(allow_null=True)
    total_users = serializers.IntegerField()
    total_domains = serializers.IntegerField()
    domains_status = serializers.DictField()
    resource_usage = serializers.ListField(child=serializers.DictField(), default=list)
    recent_activity = serializers.ListField(child=serializers.DictField(), default=list)