from rest_framework import serializers
from apps.configs.services.settings import ConfigSettingsService

ALLOWED_SECTIONS = ('backup', 'maintenance', 'dr', 'notifications', 'storage', 'alert_thresholds')


class ConfigSystemSettingsSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    backup = serializers.DictField(required=False)
    maintenance = serializers.DictField(required=False)
    dr = serializers.DictField(required=False)
    notifications = serializers.DictField(required=False)
    storage = serializers.DictField(required=False)
    alert_thresholds = serializers.DictField(required=False)
    updated_at = serializers.DateTimeField(read_only=True)
    updated_by = serializers.UUIDField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        settings = ConfigSettingsService.get_settings()
        return {
            'id': str(instance.id),
            'version': instance.version,
            'updated_at': instance.updated_at,
            'updated_by': str(instance.updated_by) if instance.updated_by else None,
            **settings,
        }

    def validate(self, attrs):
        unknown = set(attrs.keys()) - set(ALLOWED_SECTIONS)
        if unknown:
            raise serializers.ValidationError(f'Unknown settings sections: {", ".join(sorted(unknown))}')
        if 'notifications' in attrs:
            channels = attrs['notifications'].get('channels', [])
            if channels and not isinstance(channels, list):
                raise serializers.ValidationError({'notifications': 'channels must be a list'})
        if 'dr' in attrs:
            dr = attrs['dr']
            rpo = dr.get('default_rpo_target_minutes')
            rto = dr.get('default_rto_target_minutes')
            if rpo is not None and rto is not None and rto < rpo:
                raise serializers.ValidationError({'dr': 'default_rto_target_minutes must be >= default_rpo_target_minutes'})
        return attrs

    def update(self, instance, validated_data):
        user = self.context['request'].user
        user_id = getattr(user, 'id', None)
        record = ConfigSettingsService.update_settings(validated_data, user_id=user_id)
        return record
