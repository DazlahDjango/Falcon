from rest_framework import serializers
from apps.kpi.models.system_settings import KpiSystemSettings
from apps.kpi.services.settings import KpiSettingsService


class KpiSystemSettingsSerializer(serializers.ModelSerializer):
    effective_settings = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = KpiSystemSettings
        fields = [
            'id', 'singleton_key', 'settings', 'version',
            'effective_settings', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'singleton_key', 'version', 'effective_settings',
            'created_at', 'updated_at',
        ]

    def get_effective_settings(self, obj):
        return KpiSettingsService.get_settings(use_cache=False)

    def update(self, instance, validated_data):
        patch = validated_data.get('settings', {})
        user = self.context['request'].user
        return KpiSettingsService.update_settings(
            patch, user_id=str(user.id) if user else None,
        )
