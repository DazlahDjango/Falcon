import copy
import logging
from django.db import transaction
from django.core.cache import cache
from apps.reviews.default_reviews_system_settings import DEFAULT_REVIEWS_SYSTEM_SETTINGS
from apps.reviews.models.system_settings import ReviewsSystemSettings
logger = logging.getLogger(__name__)
CACHE_KEY = 'reviews:system_settings:v1'
CACHE_TTL = 300

def _deep_merge(base, patch):
    result = copy.deepcopy(base)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result

class ReviewsSettingsService:
    @classmethod
    def get_defaults(cls):
        return copy.deepcopy(DEFAULT_REVIEWS_SYSTEM_SETTINGS)
    @classmethod
    def get_record(cls):
        record, _ = ReviewsSystemSettings.objects.get_or_create(singleton_key=ReviewsSystemSettings.SINGLETON_KEY, defaults={'settings': cls.get_defaults()})
        if not record.settings:
            record.settings = cls.get_defaults()
            record.save(update_fields=['settings', 'updated_at'])
        return record
    @classmethod
    def get_settings(cls, use_cache=True):
        if use_cache:
            cached = cache.get(CACHE_KEY)
            if cached is not None:
                return cached
        record = cls.get_record()
        merged = _deep_merge(cls.get_defaults(), record.settings or {})
        cache.set(CACHE_KEY, merged, CACHE_TTL)
        return merged
    @classmethod
    def get_section(cls, section):
        return cls.get_settings().get(section, {})
    @classmethod
    @transaction.atomic
    def update_settings(cls, patch, user_id=None):
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
    def reset_to_defaults(cls, user_id=None):
        return cls.update_settings(cls.get_defaults(), user_id=user_id)
    @classmethod
    def invalidate_cache(cls):
        cache.delete(CACHE_KEY)