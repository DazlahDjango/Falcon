"""SHA-256 checksums on sensitive records to detect tampering (CIA Integrity)."""

import hashlib
import json
import logging

from apps.reviews.services.settings import ReviewsSettingsService

logger = logging.getLogger(__name__)


class IntegrityService:
    @classmethod
    def is_enabled(cls) -> bool:
        return ReviewsSettingsService.get_section('security').get(
            'integrity_checksums_enabled', True,
        )

    @classmethod
    def compute_checksum(cls, payload: dict) -> str:
        """Stable checksum from ordered JSON payload."""
        normalized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    @classmethod
    def checksum_for_instance(cls, instance, field_names: list) -> str:
        data = {f: getattr(instance, f, None) for f in field_names}
        data['id'] = str(getattr(instance, 'id', ''))
        data['updated_at'] = str(getattr(instance, 'updated_at', ''))
        return cls.compute_checksum(data)

    @classmethod
    def apply_checksum(cls, instance, field_names: list, checksum_field: str = 'integrity_checksum') -> None:
        if not cls.is_enabled() or not hasattr(instance, checksum_field):
            return
        setattr(instance, checksum_field, cls.checksum_for_instance(instance, field_names))

    @classmethod
    def verify(cls, instance, field_names: list, checksum_field: str = 'integrity_checksum') -> bool:
        if not cls.is_enabled():
            return True
        stored = getattr(instance, checksum_field, '') or ''
        if not stored:
            return True
        expected = cls.checksum_for_instance(instance, field_names)
        ok = stored == expected
        if not ok:
            logger.warning(
                'Integrity checksum mismatch for %s id=%s',
                instance.__class__.__name__,
                getattr(instance, 'id', '?'),
            )
        return ok
