from rest_framework import serializers
from apps.accounts.models import AccountsSystemSettings
from apps.accounts.services.policy import AccountsPolicyService


class AccountsSystemSettingsSerializer(serializers.ModelSerializer):
    effective_settings = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AccountsSystemSettings
        fields = [
            'id', 'singleton_key', 'settings', 'version',
            'effective_settings', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'singleton_key', 'version', 'effective_settings',
            'created_at', 'updated_at',
        ]

    def get_effective_settings(self, obj):
        return AccountsPolicyService.get_system_policy(use_cache=False)

    def update(self, instance, validated_data):
        patch = validated_data.get('settings', {})
        user = self.context['request'].user
        record = AccountsPolicyService.update_system_policy(
            patch, user_id=str(user.id) if user else None,
        )
        return record
