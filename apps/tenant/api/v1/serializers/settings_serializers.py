from rest_framework import serializers
from apps.tenant.models import OrganizationSettings


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSettings
        fields = ['id', 'settings', 'version', 'created_at', 'updated_at', 'updated_by']
        read_only_fields = ['id', 'version', 'created_at', 'updated_at', 'updated_by']


class SettingsUpdateSerializer(serializers.Serializer):
    settings = serializers.JSONField(required=True)

    def validate_settings(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Settings must be a JSON object")
        return value