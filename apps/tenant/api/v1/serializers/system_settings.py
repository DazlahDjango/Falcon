from rest_framework import serializers
from apps.tenant.models import TenantSystemSettings
from apps.tenant.services.settings import TenantSettingsService


class TenantSystemSettingsSerializer(serializers.ModelSerializer):
    effective_settings = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TenantSystemSettings
        fields = [
            'id', 'singleton_key', 'settings', 'version',
            'effective_settings', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'singleton_key', 'version', 'effective_settings',
            'created_at', 'updated_at',
        ]

    def get_effective_settings(self, obj):
        return TenantSettingsService.get_settings(use_cache=False)

    def update(self, instance, validated_data):
        patch = validated_data.get('settings', {})
        user = self.context['request'].user
        return TenantSettingsService.update_settings(
            patch, user_id=str(user.id) if user else None,
        )
