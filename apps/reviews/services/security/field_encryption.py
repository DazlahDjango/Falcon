import base64
import logging

from apps.reviews.services.settings import ReviewsSettingsService

logger = logging.getLogger(__name__)

ENC_PREFIX = 'enc:v1:'


class ReviewFieldEncryptionService:
    """Encrypt/decrypt narrative fields at rest when security.field_encryption_enabled."""

    @classmethod
    def is_enabled(cls) -> bool:
        return ReviewsSettingsService.get_section('security').get(
            'field_encryption_enabled', True,
        )

    @classmethod
    def encrypt(cls, plaintext: str) -> str:
        if not plaintext or not cls.is_enabled():
            return plaintext
        if plaintext.startswith(ENC_PREFIX):
            return plaintext
        try:
            from apps.configs.services.security.backup_encryption_service import (
                BackupEncryptionService,
            )
            service = BackupEncryptionService()
            raw = plaintext.encode('utf-8')
            encrypted, key_id, iv_b64 = service.encrypt_backup(raw)
            payload = base64.b64encode(encrypted).decode('ascii')
            return f'{ENC_PREFIX}{key_id}:{iv_b64}:{payload}'
        except Exception as exc:
            logger.warning('Review field encryption failed, storing plaintext: %s', exc)
            return plaintext

    @classmethod
    def decrypt(cls, value: str) -> str:
        if not value or not value.startswith(ENC_PREFIX):
            return value
        try:
            from apps.configs.services.security.backup_encryption_service import (
                BackupEncryptionService,
            )
            parts = value[len(ENC_PREFIX):].split(':', 2)
            if len(parts) != 3:
                return value
            key_id, iv_b64, payload_b64 = parts
            encrypted = base64.b64decode(payload_b64)
            service = BackupEncryptionService()
            raw = service.decrypt_backup(encrypted, key_id, iv_b64)
            return raw.decode('utf-8')
        except Exception as exc:
            logger.warning('Review field decryption failed: %s', exc)
            return value

    @classmethod
    def encrypt_model_text_fields(cls, instance, field_names: list) -> None:
        """Encrypt listed TextField values in-place before save."""
        if not cls.is_enabled():
            return
        for name in field_names:
            val = getattr(instance, name, None)
            if val and isinstance(val, str):
                setattr(instance, name, cls.encrypt(val))

    @classmethod
    def decrypt_model_text_fields(cls, instance, field_names: list) -> dict:
        """Return decrypted copy of fields for API/serializers."""
        out = {}
        for name in field_names:
            val = getattr(instance, name, None)
            if val:
                out[name] = cls.decrypt(val)
        return out
