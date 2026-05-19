from rest_framework import serializers
from apps.configs.models import EncryptionKey
from apps.configs.constants import EncryptionKeyStatus, EncryptionKeySource

class EncryptionKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = EncryptionKey
        fields = ['id', 'key_id', 'key_alias', 'key_source', 'key_status', 'key_region', 'key_arn', 'is_default', 'activated_at', 'rotated_at', 'expires_at', 'last_used_at', 'usage_count', 'rotated_by', 'rotation_reason', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at', 'key_id', 'last_used_at', 'usage_count']

class EncryptionKeyRotateSerializer(serializers.Serializer):
    old_key_id = serializers.UUIDField()
    new_key_alias = serializers.CharField(max_length=255)
    key_source = serializers.ChoiceField(choices=EncryptionKeySource.CHOICES, default=EncryptionKeySource.AWS_KMS)
    def validate_old_key_id(self, value):
        from apps.configs.models import EncryptionKey
        if not EncryptionKey.objects.filter(id=value, key_status=EncryptionKeyStatus.ACTIVE).exists():
            raise serializers.ValidationError(f"Key {value} not found or not active")
        return value