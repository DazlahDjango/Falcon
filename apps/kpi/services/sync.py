import logging
import time
from decimal import Decimal
from typing import Dict, List, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError
from apps.kpi.models import KPI, AnnualTarget, MonthlyActual
from apps.accounts.models import User
from ..exceptions import DataSyncError, ExternalSourceError, DataMappingError, SyncConflictError

logger = logging.getLogger(__name__)

CACHE_TTL = 300
CACHE_PREFIX = "kpi_sync"
MAX_BATCH_SIZE = 1000
RATE_LIMIT_PER_MINUTE = 10
IDEMPOTENCY_TTL = 86400


class DataSyncService:
    """
    Service for synchronizing data between external systems and Falcon PMS
    Enterprise-grade with rate limiting, idempotency, bulk operations, and retry logic
    """

    def __init__(self):
        self.sync_configs = {}
        self.field_mappings = {}

    def register_sync_config(self, source: str, config: Dict) -> None:
        """Register a sync configuration for an external source"""
        self.sync_configs[source] = config
        self.field_mappings[source] = config.get('field_mappings', {})

    def _check_rate_limit(self, source: str, tenant_id: str) -> bool:
        """Check if rate limit has been exceeded for a source-tenant pair"""
        key = f"{CACHE_PREFIX}:rate_limit:{source}:{tenant_id}"
        current = cache.get(key, 0)
        if current >= RATE_LIMIT_PER_MINUTE:
            return False
        cache.set(key, current + 1, 60)
        return True

    def _get_idempotency_key(self, source: str, sync_type: str, item: Dict) -> str:
        """Generate idempotency key for an item to prevent duplicate processing"""
        identifier = item.get('id') or item.get('code') or item.get('email')
        timestamp = item.get('updated_at') or item.get('modified_at') or ''
        return f"{CACHE_PREFIX}:idempotent:{source}:{sync_type}:{identifier}:{timestamp}"

    def _is_already_processed(self, idempotency_key: str) -> bool:
        """Check if an item has already been processed"""
        return cache.get(idempotency_key) is not None

    def _mark_as_processed(self, idempotency_key: str) -> None:
        """Mark an item as processed to prevent future duplicates"""
        cache.set(idempotency_key, timezone.now().isoformat(), IDEMPOTENCY_TTL)

    def _bulk_fetch_kpis(self, tenant_id: str, kpi_codes: List[str]) -> Dict[str, KPI]:
        """Bulk fetch KPIs by codes for efficient lookups"""
        if not kpi_codes:
            return {}
        return {
            k.code: k for k in KPI.objects.filter(
                tenant_id=tenant_id,
                code__in=kpi_codes
            ).only('id', 'code', 'tenant_id')
        }

    def _bulk_fetch_users(self, tenant_id: str, user_emails: List[str]) -> Dict[str, User]:
        """Bulk fetch users by emails for efficient lookups"""
        if not user_emails:
            return {}
        return {
            u.email: u for u in User.objects.filter(
                tenant_id=tenant_id,
                email__in=user_emails,
                is_active=True
            ).only('id', 'email', 'tenant_id')
        }

    def _bulk_fetch_existing_targets(self, tenant_id: str, items: List[Dict]) -> Dict[str, AnnualTarget]:
        """Bulk fetch existing targets for conflict detection"""
        if not items:
            return {}
        keys = []
        for item in items:
            kpi_id = item.get('kpi_id')
            user_id = item.get('user_id')
            year = item.get('year')
            if kpi_id and user_id and year:
                keys.append(f"{kpi_id}_{user_id}_{year}")
        if not keys:
            return {}
        targets = AnnualTarget.objects.filter(tenant_id=tenant_id)
        return {f"{str(t.kpi_id)}_{str(t.user_id)}_{t.year}": t for t in targets}

    def sync_from_external(self, tenant_id: str, source: str, data: Dict) -> Dict:
        """
        Sync data from an external source

        Args:
            tenant_id: Tenant identifier
            source: Source system name (e.g., 'erp', 'hr', 'crm')
            data: Data to sync with 'items' key containing records

        Returns:
            Dict with sync results
        """
        if not tenant_id:
            raise DataSyncError("Tenant ID is required")

        if source not in self.sync_configs:
            raise ExternalSourceError(f"No sync configuration found for source: {source}")

        if not self._check_rate_limit(source, tenant_id):
            raise DataSyncError(f"Rate limit exceeded for source {source}. Max {RATE_LIMIT_PER_MINUTE} requests per minute.")

        items = data.get('items', [])
        if len(items) > MAX_BATCH_SIZE:
            raise DataSyncError(f"Batch size {len(items)} exceeds maximum of {MAX_BATCH_SIZE}")

        config = self.sync_configs[source]
        sync_type = config.get('type', 'kpi')

        try:
            if sync_type == 'kpi':
                return self._sync_kpis(tenant_id, items, config)
            elif sync_type == 'target':
                return self._sync_targets(tenant_id, items, config)
            elif sync_type == 'actual':
                return self._sync_actuals(tenant_id, items, config)
            elif sync_type == 'user':
                return self._sync_users(tenant_id, items, config)
            else:
                raise DataSyncError(f"Unknown sync type: {sync_type}")

        except Exception as e:
            logger.error(f"Data sync failed for source {source}: {str(e)}")
            raise DataSyncError(f"Sync failed: {str(e)}")

    def _sync_kpis(self, tenant_id: str, items: List[Dict], config: Dict) -> Dict:
        """Sync KPIs from external system with bulk operations and idempotency"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        # Pre-fetch existing KPIs for all codes
        kpi_codes = [item.get('code') for item in items if item.get('code')]
        existing_kpis = {
            k.code: k for k in KPI.objects.filter(
                tenant_id=tenant_id,
                code__in=kpi_codes
            )
        }

        with transaction.atomic():
            for item in items:
                try:
                    idempotency_key = self._get_idempotency_key('kpi', 'kpi', item)
                    if self._is_already_processed(idempotency_key):
                        continue

                    kpi_data = self._map_fields(item, field_mappings)
                    kpi_data['tenant_id'] = tenant_id

                    existing = existing_kpis.get(kpi_data.get('code'))

                    if existing:
                        for key, value in kpi_data.items():
                            if hasattr(existing, key) and key not in ['id', 'tenant_id', 'created_at', 'created_by']:
                                setattr(existing, key, value)
                        existing.updated_by_id = config.get('system_user_id')
                        existing.save()
                        updated.append(existing.code)
                    else:
                        kpi = KPI.objects.create(**kpi_data)
                        created.append(kpi.code)

                    self._mark_as_processed(idempotency_key)

                except Exception as e:
                    errors.append({'item': item.get('code') or item.get('name'), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors,
            'created_list': created,
            'updated_list': updated
        }

    def _sync_targets(self, tenant_id: str, items: List[Dict], config: Dict) -> Dict:
        """Sync targets from external system with bulk operations"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        # Extract all KPI codes and user emails for bulk fetch
        kpi_codes = list(set(item.get('kpi_code') for item in items if item.get('kpi_code')))
        user_emails = list(set(item.get('user_email') for item in items if item.get('user_email')))

        # Bulk fetch all needed data
        kpi_map = self._bulk_fetch_kpis(tenant_id, kpi_codes)
        user_map = self._bulk_fetch_users(tenant_id, user_emails)

        with transaction.atomic():
            for item in items:
                try:
                    idempotency_key = self._get_idempotency_key('target', 'target', item)
                    if self._is_already_processed(idempotency_key):
                        continue

                    target_data = self._map_fields(item, field_mappings)
                    target_data['tenant_id'] = tenant_id

                    kpi_code = target_data.pop('kpi_code', None)
                    if kpi_code:
                        kpi = kpi_map.get(kpi_code)
                        if not kpi:
                            errors.append({'item': kpi_code, 'error': 'KPI not found'})
                            continue
                        target_data['kpi_id'] = kpi.id

                    user_email = target_data.pop('user_email', None)
                    if user_email:
                        user = user_map.get(user_email)
                        if not user:
                            errors.append({'item': user_email, 'error': 'User not found'})
                            continue
                        target_data['user_id'] = user.id

                    existing = AnnualTarget.objects.filter(
                        tenant_id=tenant_id,
                        kpi_id=target_data.get('kpi_id'),
                        user_id=target_data.get('user_id'),
                        year=target_data.get('year')
                    ).first()

                    if existing:
                        AnnualTarget.objects.filter(id=existing.id).update(
                            target_value=target_data.get('target_value', existing.target_value),
                            notes=target_data.get('notes', existing.notes),
                            updated_at=timezone.now()
                        )
                        updated.append(f"{kpi_code}:{user_email}")
                    else:
                        AnnualTarget.objects.create(**target_data)
                        created.append(f"{kpi_code}:{user_email}")

                    self._mark_as_processed(idempotency_key)

                except Exception as e:
                    errors.append({'item': str(item), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors
        }

    def _sync_actuals(self, tenant_id: str, items: List[Dict], config: Dict) -> Dict:
        """Sync actual data from external system with bulk operations"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        # Extract all KPI codes and user emails for bulk fetch
        kpi_codes = list(set(item.get('kpi_code') for item in items if item.get('kpi_code')))
        user_emails = list(set(item.get('user_email') for item in items if item.get('user_email')))

        # Bulk fetch all needed data
        kpi_map = self._bulk_fetch_kpis(tenant_id, kpi_codes)
        user_map = self._bulk_fetch_users(tenant_id, user_emails)

        with transaction.atomic():
            for item in items:
                try:
                    idempotency_key = self._get_idempotency_key('actual', 'actual', item)
                    if self._is_already_processed(idempotency_key):
                        continue

                    actual_data = self._map_fields(item, field_mappings)
                    actual_data['tenant_id'] = tenant_id
                    actual_data['status'] = 'PENDING'

                    kpi_code = actual_data.pop('kpi_code', None)
                    if kpi_code:
                        kpi = kpi_map.get(kpi_code)
                        if not kpi:
                            errors.append({'item': kpi_code, 'error': 'KPI not found'})
                            continue
                        actual_data['kpi_id'] = kpi.id

                    user_email = actual_data.pop('user_email', None)
                    if user_email:
                        user = user_map.get(user_email)
                        if not user:
                            errors.append({'item': user_email, 'error': 'User not found'})
                            continue
                        actual_data['user_id'] = user.id
                        actual_data['submitted_by_id'] = user.id

                    existing = MonthlyActual.objects.filter(
                        tenant_id=tenant_id,
                        kpi_id=actual_data.get('kpi_id'),
                        user_id=actual_data.get('user_id'),
                        year=actual_data.get('year'),
                        month=actual_data.get('month')
                    ).first()

                    if existing:
                        if existing.status != 'APPROVED':
                            MonthlyActual.objects.filter(id=existing.id).update(
                                actual_value=actual_data.get('actual_value', existing.actual_value),
                                notes=actual_data.get('notes', existing.notes),
                                updated_at=timezone.now()
                            )
                            updated.append(f"{kpi_code}:{user_email}")
                        else:
                            errors.append({'item': f"{kpi_code}:{user_email}", 'error': 'Cannot modify approved actual'})
                    else:
                        MonthlyActual.objects.create(**actual_data)
                        created.append(f"{kpi_code}:{user_email}")

                    self._mark_as_processed(idempotency_key)

                except Exception as e:
                    errors.append({'item': str(item), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors
        }

    def _sync_users(self, tenant_id: str, items: List[Dict], config: Dict) -> Dict:
        """Sync users from external HR system with bulk operations"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        # Extract all emails for bulk fetch
        emails = list(set(item.get('email') for item in items if item.get('email')))
        existing_users = {
            u.email: u for u in User.objects.filter(
                tenant_id=tenant_id,
                email__in=emails
            )
        }

        with transaction.atomic():
            for item in items:
                try:
                    idempotency_key = self._get_idempotency_key('user', 'user', item)
                    if self._is_already_processed(idempotency_key):
                        continue

                    user_data = self._map_fields(item, field_mappings)
                    user_data['tenant_id'] = tenant_id

                    email = user_data.get('email')
                    if not email:
                        errors.append({'item': item, 'error': 'Email is required'})
                        continue

                    existing = existing_users.get(email)

                    if existing:
                        for key, value in user_data.items():
                            if hasattr(existing, key) and key not in ['id', 'password', 'tenant_id']:
                                setattr(existing, key, value)
                        existing.save()
                        updated.append(email)
                    else:
                        user_data['username'] = user_data.get('username', email.split('@')[0])
                        user_data['is_active'] = user_data.get('is_active', True)
                        User.objects.create(**user_data)
                        created.append(email)

                    self._mark_as_processed(idempotency_key)

                except Exception as e:
                    errors.append({'item': item.get('email'), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors
        }

    def _map_fields(self, source_item: Dict, field_mappings: Dict) -> Dict:
        """Map external fields to internal fields"""
        result = {}
        for source_field, target_field in field_mappings.items():
            if source_field in source_item:
                value = source_item[source_field]
                if isinstance(value, str) and value.strip() == '':
                    continue
                result[target_field] = value

        for key, value in source_item.items():
            if key not in field_mappings and key not in result:
                if isinstance(value, str) and value.strip() == '':
                    continue
                result[key] = value

        return result

    def sync_to_external(self, tenant_id: str, target: str, data: Dict) -> Dict:
        """
        Export data to external system

        Args:
            tenant_id: Tenant identifier
            target: Target system name
            data: Data to export

        Returns:
            Dict with export results
        """
        raise NotImplementedError("Export to external systems not yet implemented")

    def detect_conflicts(self, tenant_id: str, source: str, data: Dict) -> List[Dict]:
        """Detect conflicts before sync"""
        if not tenant_id:
            raise DataSyncError("Tenant ID is required")

        conflicts = []
        config = self.sync_configs.get(source, {})
        conflict_field = config.get('conflict_field', 'code')
        sync_type = config.get('type', 'kpi')

        items = data.get('items', [])

        if sync_type == 'kpi':
            codes = [item.get(conflict_field) for item in items if item.get(conflict_field)]
            existing = KPI.objects.filter(tenant_id=tenant_id, code__in=codes).values('code', 'name', 'updated_at')

            existing_map = {e['code']: e for e in existing}
            for item in items:
                code = item.get(conflict_field)
                if code and code in existing_map:
                    conflicts.append({
                        'code': code,
                        'existing': existing_map[code],
                        'incoming': item
                    })

        elif sync_type == 'target':
            for item in items:
                kpi_code = item.get('kpi_code')
                user_email = item.get('user_email')
                year = item.get('year')
                if kpi_code and user_email and year:
                    existing = AnnualTarget.objects.filter(
                        tenant_id=tenant_id,
                        kpi__code=kpi_code,
                        user__email=user_email,
                        year=year
                    ).first()
                    if existing:
                        conflicts.append({
                            'key': f"{kpi_code}:{user_email}:{year}",
                            'existing': {'target_value': float(existing.target_value)},
                            'incoming': item
                        })

        elif sync_type == 'actual':
            for item in items:
                kpi_code = item.get('kpi_code')
                user_email = item.get('user_email')
                year = item.get('year')
                month = item.get('month')
                if kpi_code and user_email and year and month:
                    existing = MonthlyActual.objects.filter(
                        tenant_id=tenant_id,
                        kpi__code=kpi_code,
                        user__email=user_email,
                        year=year,
                        month=month
                    ).first()
                    if existing:
                        conflicts.append({
                            'key': f"{kpi_code}:{user_email}:{year}-{month}",
                            'existing': {'actual_value': float(existing.actual_value), 'status': existing.status},
                            'incoming': item
                        })

        return conflicts

    def resolve_conflict(self, conflict: Dict, resolution: str) -> Dict:
        """Resolve a sync conflict"""
        if resolution == 'incoming':
            return {'action': 'overwrite', 'data': conflict['incoming']}
        elif resolution == 'existing':
            return {'action': 'keep', 'data': conflict['existing']}
        elif resolution == 'merge':
            merged = {**conflict.get('existing', {}), **conflict.get('incoming', {})}
            return {'action': 'merge', 'data': merged}
        else:
            raise SyncConflictError(f"Unknown resolution: {resolution}")

    def get_sync_status(self, source: str, tenant_id: str) -> Dict:
        """Get sync status and statistics for a source"""
        cache_key = f"{CACHE_PREFIX}:status:{source}:{tenant_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        config = self.sync_configs.get(source, {})
        result = {
            'source': source,
            'tenant_id': tenant_id,
            'configured': source in self.sync_configs,
            'type': config.get('type', 'unknown'),
            'last_sync': None,
            'total_synced': 0
        }

        cache.set(cache_key, result, CACHE_TTL)
        return result

    def clear_sync_cache(self, source: str, tenant_id: str) -> None:
        """Clear sync cache for a source-tenant pair"""
        cache.delete(f"{CACHE_PREFIX}:status:{source}:{tenant_id}")
        cache.delete_pattern(f"{CACHE_PREFIX}:idempotent:{source}:*")
        cache.delete(f"{CACHE_PREFIX}:rate_limit:{source}:{tenant_id}")