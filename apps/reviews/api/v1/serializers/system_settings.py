from rest_framework import serializers

from apps.reviews.models.system_settings import ReviewsSystemSettings
from apps.reviews.services.settings import ReviewsSettingsService


class ReviewsSystemSettingsSerializer(serializers.ModelSerializer):
    settings = serializers.JSONField(required=False)

    class Meta:
        model = ReviewsSystemSettings
        fields = ['id', 'singleton_key', 'settings', 'version', 'updated_at', 'updated_by']
        read_only_fields = ['id', 'singleton_key', 'version', 'updated_at', 'updated_by']

    def validate_settings(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('settings must be a JSON object')
        return value

    def update(self, instance, validated_data):
        patch = validated_data.get('settings')
        if patch is not None:
            user = self.context.get('request')
            user_id = str(user.user.id) if user and user.user.is_authenticated else None
            instance = ReviewsSettingsService.update_settings(patch, user_id=user_id)
        return instance
