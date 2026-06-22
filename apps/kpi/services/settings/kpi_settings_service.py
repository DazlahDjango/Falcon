import copy
import logging
from typing import Dict, Any, Optional
from django.db import transaction
from django.core.cache import cache
from django.core.exceptions import ValidationError
from apps.kpi.default_kpi_system_settings import DEFAULT_KPI_SYSTEM_SETTINGS
from apps.kpi.models.system_settings import KpiSystemSettings

logger = logging.getLogger(__name__)

CACHE_KEY = 'kpi:system_settings:v1'
CACHE_TTL = 300


def _deep_merge(base: Dict, patch: Dict) -> Dict:
    result = copy.deepcopy(base)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def _validate_settings(settings_dict: Dict) -> None:
    required_sections = ['realtime', 'notifications', 'calculations', 'security', 'cache']
    for section in required_sections:
        if section not in settings_dict:
            raise ValidationError(f"Missing required section: {section}")

    if not isinstance(settings_dict.get('realtime', {}).get('websocket_enabled', True), bool):
        raise ValidationError("realtime.websocket_enabled must be boolean")

    if not isinstance(settings_dict.get('notifications', {}).get('email_enabled', True), bool):
        raise ValidationError("notifications.email_enabled must be boolean")


class KpiSettingsService:
    @classmethod
    def get_defaults(cls) -> Dict:
        return copy.deepcopy(DEFAULT_KPI_SYSTEM_SETTINGS)

    @classmethod
    def get_record(cls) -> KpiSystemSettings:
        record, created = KpiSystemSettings.objects.get_or_create(
            singleton_key=KpiSystemSettings.SINGLETON_KEY,
            defaults={'settings': cls.get_defaults()}
        )
        if not record.settings:
            record.settings = cls.get_defaults()
            record.save(update_fields=['settings', 'updated_at'])
        return record

    @classmethod
    def get_settings(cls, use_cache: bool = True) -> Dict:
        if use_cache:
            cached = cache.get(CACHE_KEY)
            if cached is not None:
                return cached

        record = cls.get_record()
        merged = _deep_merge(cls.get_defaults(), record.settings or {})
        cache.set(CACHE_KEY, merged, CACHE_TTL)
        return merged

    @classmethod
    def get_section(cls, section: str) -> Dict:
        return cls.get_settings().get(section, {})

    @classmethod
    @transaction.atomic
    def update_settings(cls, patch: Dict, user_id: str = None) -> KpiSystemSettings:
        record = cls.get_record()
        current = _deep_merge(cls.get_defaults(), record.settings or {})
        updated = _deep_merge(current, patch)

        _validate_settings(updated)

        record.settings = updated
        record.version += 1
        if user_id:
            record.updated_by_id = user_id
        record.save(update_fields=['settings', 'version', 'updated_by', 'updated_at'])

        cache.delete(CACHE_KEY)
        cache.set(CACHE_KEY, updated, CACHE_TTL)

        logger.info(f"KPI system settings updated to version {record.version} by user {user_id}")
        return record

    @classmethod
    @transaction.atomic
    def reset_to_defaults(cls, user_id: str = None) -> KpiSystemSettings:
        return cls.update_settings(cls.get_defaults(), user_id=user_id)

    @classmethod
    def is_feature_enabled(cls, feature: str) -> bool:
        settings = cls.get_settings()
        parts = feature.split('.')
        current = settings
        for part in parts:
            if not isinstance(current, dict):
                return False
            current = current.get(part)
            if current is None:
                return False
        return bool(current)