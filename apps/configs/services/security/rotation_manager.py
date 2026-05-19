from django.utils import timezone
from datetime import timedelta
from apps.configs.models import EncryptionKey
from apps.configs.exceptions import EncryptionError
from apps.configs.constants import EncryptionKeyStatus
import secrets

class RotationManager:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def rotate_key(self, old_key_id, new_key_alias, key_source='aws_kms', rotated_by=None):
        old_key = EncryptionKey.objects.filter(key_id=old_key_id).first()
        if not old_key:
            raise EncryptionError(f"Key {old_key_id} not found")
        old_key.key_status = EncryptionKeyStatus.INACTIVE
        old_key.rotated_at = timezone.now()
        old_key.rotated_by = rotated_by
        old_key.rotation_reason = f"Rotated to {new_key_alias}"
        old_key.save()
        new_key = EncryptionKey.objects.create(
            key_id=f"key_{secrets.token_hex(16)}",
            key_alias=new_key_alias,
            key_source=key_source,
            key_status=EncryptionKeyStatus.ACTIVE,
            is_default=True,
            activated_at=timezone.now(),
            rotated_by=rotated_by,
            rotation_reason=f"Rotated from {old_key.key_alias}"
        )
        old_key.is_default = False
        old_key.save(update_fields=['is_default'])
        return new_key
    def check_keys_needing_rotation(self, days=90):
        cutoff = timezone.now() - timedelta(days=days)
        return EncryptionKey.objects.filter(
            key_status=EncryptionKeyStatus.ACTIVE,
            rotated_at__lt=cutoff
        ).exclude(is_default=True)
    def revoke_compromised_key(self, key_id, rotated_by=None):
        key = EncryptionKey.objects.filter(key_id=key_id).first()
        if not key:
            raise EncryptionError(f"Key {key_id} not found")
        key.key_status = EncryptionKeyStatus.COMPROMISED
        key.rotated_at = timezone.now()
        key.rotated_by = rotated_by
        key.rotation_reason = "Key compromised - emergency revocation"
        key.save()
        return key