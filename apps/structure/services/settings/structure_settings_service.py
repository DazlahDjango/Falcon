import copy
from django.db import transaction
from django.core.cache import cache
from apps.structure.models import StructureSystemSettings
from apps.structure.default_structure_system_settings import DEFAULT_STRUCTURE_SYSTEM_SETTINGS

CACHE_KEY = 'structure:system_settings:v1'
CACHE_TTL = 300


def _deep_merge(base: dict, patch: dict) -> dict:
    result = copy.deepcopy(base)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


class StructureSettingsService:
    @classmethod
    def get_defaults(cls) -> dict:
        return copy.deepcopy(DEFAULT_STRUCTURE_SYSTEM_SETTINGS)

    @classmethod
    def get_record(cls) -> StructureSystemSettings:
        record, _ = StructureSystemSettings.objects.get_or_create(
            singleton_key=StructureSystemSettings.SINGLETON_KEY,
            defaults={'settings': cls.get_defaults()},
        )
        if not record.settings:
            record.settings = cls.get_defaults()
            record.save(update_fields=['settings', 'updated_at'])
        return record

    @classmethod
    def get_settings(cls, use_cache: bool = True) -> dict:
        if use_cache:
            cached = cache.get(CACHE_KEY)
            if cached is not None:
                return cached
        record = cls.get_record()
        merged = _deep_merge(cls.get_defaults(), record.settings or {})
        cache.set(CACHE_KEY, merged, CACHE_TTL)
        return merged

    @classmethod
    def get_section(cls, section: str) -> dict:
        return cls.get_settings().get(section, {})

    @classmethod
    @transaction.atomic
    def update_settings(cls, patch: dict, user_id=None) -> StructureSystemSettings:
        record = cls.get_record()
        current = _deep_merge(cls.get_defaults(), record.settings or {})
        updated = _deep_merge(current, patch)
        record.settings = updated
        record.version += 1
        if user_id:
            record.updated_by_id = user_id
        record.save(update_fields=['settings', 'version', 'updated_by', 'updated_at'])
        cache.delete(CACHE_KEY)
        cache.set(CACHE_KEY, updated, CACHE_TTL)
        return record

    @classmethod
    def reset_to_defaults(cls, user_id=None) -> StructureSystemSettings:
        return cls.update_settings(cls.get_defaults(), user_id=user_id)
