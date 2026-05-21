import copy
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from django.db import transaction
from django.core.cache import cache

from apps.accounts.default_accounts_policy import DEFAULT_ACCOUNTS_POLICY
from apps.accounts.models import AccountsSystemSettings, TenantPreference

logger = logging.getLogger(__name__)

CACHE_KEY_SYSTEM = 'accounts:system_policy:v1'
CACHE_KEY_TENANT = 'accounts:tenant_policy:{client_id}:v1'
CACHE_TTL = 300


def _deep_merge(base: dict, patch: dict) -> dict:
    result = copy.deepcopy(base)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


class AccountsPolicyService:
    @classmethod
    def get_defaults(cls) -> dict:
        return copy.deepcopy(DEFAULT_ACCOUNTS_POLICY)

    @classmethod
    def get_system_record(cls) -> AccountsSystemSettings:
        record, _ = AccountsSystemSettings.objects.get_or_create(
            singleton_key=AccountsSystemSettings.SINGLETON_KEY,
            defaults={'settings': cls.get_defaults()},
        )
        if not record.settings:
            record.settings = cls.get_defaults()
            record.save(update_fields=['settings', 'updated_at'])
        return record

    @classmethod
    def get_system_policy(cls, use_cache: bool = True) -> dict:
        if use_cache:
            cached = cache.get(CACHE_KEY_SYSTEM)
            if cached is not None:
                return cached
        record = cls.get_system_record()
        merged = _deep_merge(cls.get_defaults(), record.settings or {})
        cache.set(CACHE_KEY_SYSTEM, merged, CACHE_TTL)
        return merged

    @classmethod
    @transaction.atomic
    def update_system_policy(cls, patch: dict, user_id=None) -> AccountsSystemSettings:
        record = cls.get_system_record()
        current = _deep_merge(cls.get_defaults(), record.settings or {})
        updated = _deep_merge(current, patch)
        record.settings = updated
        record.version += 1
        if user_id:
            record.modified_by_id = user_id
        record.save(update_fields=['settings', 'version', 'modified_by', 'updated_at'])
        cache.delete(CACHE_KEY_SYSTEM)
        cache.set(CACHE_KEY_SYSTEM, updated, CACHE_TTL)
        return record

    @classmethod
    def reset_system_policy(cls, user_id=None) -> AccountsSystemSettings:
        return cls.update_system_policy(cls.get_defaults(), user_id=user_id)

    @classmethod
    def _tenant_overrides(cls, pref: TenantPreference) -> dict:
        return {
            'sessions': {
                'max_concurrent_sessions': pref.max_concurrent_sessions,
                'default_timeout_minutes': pref.session_timeout_minutes,
                'retention_days': pref.session_retention_days,
            },
            'mfa': {
                'required_roles': pref.mfa_required_roles or [],
            },
            'password': {
                'expiry_days': pref.password_expiry_days,
            },
            'audit': {
                'retention_days': pref.audit_log_retention_days,
            },
        }

    @classmethod
    def get_tenant_policy(cls, client_id: str, use_cache: bool = True) -> dict:
        cache_key = CACHE_KEY_TENANT.format(client_id=client_id)
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached
        system = cls.get_system_policy(use_cache=use_cache)
        pref, _ = TenantPreference.objects.get_or_create(
            client_id=client_id,
            defaults={'tenant_id': client_id},
        )
        merged = _deep_merge(system, cls._tenant_overrides(pref))
        merged['policy_version'] = pref.policy_version
        merged['client_id'] = str(client_id)
        cache.set(cache_key, merged, CACHE_TTL)
        return merged

    @classmethod
    def tenant_requires_mfa(cls, user) -> bool:
        if not user or not getattr(user, 'role', None):
            return False
        policy = cls.get_tenant_policy(str(user.tenant_id))
        required = policy.get('mfa', {}).get('required_roles', [])
        return user.role in required

    @classmethod
    def get_lockout_config(cls, client_id: Optional[str] = None) -> dict:
        policy = cls.get_tenant_policy(client_id) if client_id else cls.get_system_policy()
        return policy.get('lockout', cls.get_defaults()['lockout'])

    @classmethod
    def get_session_config(cls, client_id: str) -> dict:
        policy = cls.get_tenant_policy(client_id)
        return policy.get('sessions', cls.get_defaults()['sessions'])

    @classmethod
    def invalidate_tenant_cache(cls, client_id: str) -> None:
        cache.delete(CACHE_KEY_TENANT.format(client_id=client_id))

    @classmethod
    @transaction.atomic
    def sync_tenant(cls, client_id: str) -> TenantPreference:
        defaults = cls.get_system_policy(use_cache=False)
        pref, created = TenantPreference.objects.get_or_create(
            client_id=client_id,
            defaults={'tenant_id': client_id},
        )
        sessions = defaults.get('sessions', {})
        mfa = defaults.get('mfa', {})
        password = defaults.get('password', {})
        audit = defaults.get('audit', {})

        if created or not pref.mfa_required_roles:
            pref.mfa_required_roles = mfa.get('required_roles', [])
        if created or pref.session_timeout_minutes == 480 and sessions.get('default_timeout_minutes'):
            pref.session_timeout_minutes = sessions.get('default_timeout_minutes', 480)
        if created or pref.max_concurrent_sessions == 5:
            pref.max_concurrent_sessions = sessions.get('max_concurrent_sessions', 5)
        if created or pref.password_expiry_days == 90:
            pref.password_expiry_days = password.get('expiry_days', 90)
        if created or pref.audit_log_retention_days == 365:
            pref.audit_log_retention_days = audit.get('retention_days', 365)
        if created or pref.session_retention_days == 90:
            pref.session_retention_days = sessions.get('retention_days', 90)

        pref.policy_version = (pref.policy_version or 0) + 1
        pref.save()
        cls.invalidate_tenant_cache(client_id)
        return pref

    @classmethod
    def sync_all_tenants(cls) -> List[str]:
        from apps.accounts.models import User

        client_ids = (
            User.objects.exclude(tenant_id__isnull=True)
            .values_list('tenant_id', flat=True)
            .distinct()
        )
        synced = []
        for cid in client_ids:
            if cid:
                cls.sync_tenant(str(cid))
                synced.append(str(cid))
        return synced
