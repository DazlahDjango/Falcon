from rest_framework import serializers
from apps.billing.models import BillingSystemSettings
from apps.billing.services.settings import BillingSettingsService


class BillingSystemSettingsSerializer(serializers.ModelSerializer):
    effective_settings = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = BillingSystemSettings
        fields = [
            'id', 'singleton_key', 'settings', 'version',
            'effective_settings', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'singleton_key', 'version', 'effective_settings',
            'created_at', 'updated_at',
        ]

    def get_effective_settings(self, obj):
        return BillingSettingsService.get_settings(use_cache=False)

    def update(self, instance, validated_data):
        patch = validated_data.get('settings', {})
        user = self.context['request'].user
        return BillingSettingsService.update_settings(
            patch, user_id=str(user.id) if user else None,
        )
