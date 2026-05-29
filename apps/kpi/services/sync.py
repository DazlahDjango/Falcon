import logging
from decimal import Decimal
from typing import Dict, List, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from ..models import KPI, AnnualTarget, MonthlyActual
from apps.accounts.models import User
from ..exceptions import DataSyncError, ExternalSourceError, DataMappingError, SyncConflictError

logger = logging.getLogger(__name__)


class DataSyncService:
    """
    Service for synchronizing data between external systems and Falcon PMS
    """

    def __init__(self):
        self.sync_configs = {}
        self.field_mappings = {}

    def register_sync_config(self, source: str, config: Dict):
        """Register a sync configuration for an external source"""
        self.sync_configs[source] = config
        self.field_mappings[source] = config.get('field_mappings', {})

    def sync_from_external(self, tenant_id: str, source: str, data: Dict) -> Dict:
        """
        Sync data from an external source

        Args:
            tenant_id: Tenant identifier
            source: Source system name (e.g., 'erp', 'hr', 'crm')
            data: Data to sync

        Returns:
            Dict with sync results
        """
        if source not in self.sync_configs:
            raise ExternalSourceError(f"No sync configuration found for source: {source}")

        config = self.sync_configs[source]
        sync_type = config.get('type', 'kpi')

        try:
            if sync_type == 'kpi':
                return self._sync_kpis(tenant_id, data, config)
            elif sync_type == 'target':
                return self._sync_targets(tenant_id, data, config)
            elif sync_type == 'actual':
                return self._sync_actuals(tenant_id, data, config)
            elif sync_type == 'user':
                return self._sync_users(tenant_id, data, config)
            else:
                raise DataSyncError(f"Unknown sync type: {sync_type}")

        except Exception as e:
            logger.error(f"Data sync failed for source {source}: {str(e)}")
            raise DataSyncError(f"Sync failed: {str(e)}")

    def _sync_kpis(self, tenant_id: str, data: Dict, config: Dict) -> Dict:
        """Sync KPIs from external system"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        with transaction.atomic():
            for item in data.get('items', []):
                try:
                    # Map external fields to internal fields
                    kpi_data = self._map_fields(item, field_mappings)

                    # Add tenant_id
                    kpi_data['tenant_id'] = tenant_id

                    # Check if KPI exists
                    existing = KPI.objects.filter(
                        tenant_id=tenant_id,
                        code=kpi_data.get('code')
                    ).first()

                    if existing:
                        # Update existing
                        for key, value in kpi_data.items():
                            if hasattr(existing, key):
                                setattr(existing, key, value)
                        existing.save()
                        updated.append(existing.code)
                    else:
                        # Create new
                        kpi = KPI.objects.create(**kpi_data)
                        created.append(kpi.code)

                except Exception as e:
                    errors.append({'item': item.get('code'), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors,
            'created_list': created,
            'updated_list': updated
        }

    def _sync_targets(self, tenant_id: str, data: Dict, config: Dict) -> Dict:
        """Sync targets from external system"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        with transaction.atomic():
            for item in data.get('items', []):
                try:
                    target_data = self._map_fields(item, field_mappings)
                    target_data['tenant_id'] = tenant_id

                    # Find KPI by code
                    kpi_code = target_data.pop('kpi_code', None)
                    if kpi_code:
                        kpi = KPI.objects.filter(tenant_id=tenant_id, code=kpi_code).first()
                        if not kpi:
                            errors.append({'item': kpi_code, 'error': 'KPI not found'})
                            continue
                        target_data['kpi_id'] = kpi.id

                    # Find user by email
                    user_email = target_data.pop('user_email', None)
                    if user_email:
                        user = User.objects.filter(tenant_id=tenant_id, email=user_email).first()
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
                        existing.target_value = target_data.get('target_value', existing.target_value)
                        existing.save()
                        updated.append(f"{kpi_code}:{user_email}")
                    else:
                        target = AnnualTarget.objects.create(**target_data)
                        created.append(f"{kpi_code}:{user_email}")

                except Exception as e:
                    errors.append({'item': str(item), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors
        }

    def _sync_actuals(self, tenant_id: str, data: Dict, config: Dict) -> Dict:
        """Sync actual data from external system"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        with transaction.atomic():
            for item in data.get('items', []):
                try:
                    actual_data = self._map_fields(item, field_mappings)
                    actual_data['tenant_id'] = tenant_id
                    actual_data['status'] = 'PENDING'  # Pending validation

                    # Find KPI by code
                    kpi_code = actual_data.pop('kpi_code', None)
                    if kpi_code:
                        kpi = KPI.objects.filter(tenant_id=tenant_id, code=kpi_code).first()
                        if not kpi:
                            errors.append({'item': kpi_code, 'error': 'KPI not found'})
                            continue
                        actual_data['kpi_id'] = kpi.id

                    # Find user by email
                    user_email = actual_data.pop('user_email', None)
                    if user_email:
                        user = User.objects.filter(tenant_id=tenant_id, email=user_email).first()
                        if not user:
                            errors.append({'item': user_email, 'error': 'User not found'})
                            continue
                        actual_data['user_id'] = user.id

                    existing = MonthlyActual.objects.filter(
                        tenant_id=tenant_id,
                        kpi_id=actual_data.get('kpi_id'),
                        user_id=actual_data.get('user_id'),
                        year=actual_data.get('year'),
                        month=actual_data.get('month')
                    ).first()

                    if existing:
                        existing.actual_value = actual_data.get('actual_value', existing.actual_value)
                        existing.notes = actual_data.get('notes', existing.notes)
                        existing.save()
                        updated.append(f"{kpi_code}:{user_email}")
                    else:
                        actual = MonthlyActual.objects.create(**actual_data)
                        created.append(f"{kpi_code}:{user_email}")

                except Exception as e:
                    errors.append({'item': str(item), 'error': str(e)})

        return {
            'status': 'success',
            'created': len(created),
            'updated': len(updated),
            'errors': errors
        }

    def _sync_users(self, tenant_id: str, data: Dict, config: Dict) -> Dict:
        """Sync users from external HR system"""
        field_mappings = config.get('field_mappings', {})
        created = []
        updated = []
        errors = []

        with transaction.atomic():
            for item in data.get('items', []):
                try:
                    user_data = self._map_fields(item, field_mappings)
                    user_data['tenant_id'] = tenant_id

                    email = user_data.get('email')
                    if not email:
                        errors.append({'item': item, 'error': 'Email is required'})
                        continue

                    existing = User.objects.filter(tenant_id=tenant_id, email=email).first()

                    if existing:
                        # Update existing user
                        for key, value in user_data.items():
                            if hasattr(existing, key) and key not in ['id', 'password']:
                                setattr(existing, key, value)
                        existing.save()
                        updated.append(email)
                    else:
                        # Create new user
                        user_data['username'] = user_data.get('username', email.split('@')[0])
                        user = User.objects.create(**user_data)
                        created.append(email)

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
                result[target_field] = source_item[source_field]

        # Include unmapped fields as-is
        for key, value in source_item.items():
            if key not in field_mappings:
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
        # This would integrate with external API endpoints
        # Implementation depends on specific external system
        raise NotImplementedError("Export to external systems not yet implemented")

    def detect_conflicts(self, tenant_id: str, source: str, data: Dict) -> List[Dict]:
        """Detect conflicts before sync"""
        conflicts = []
        config = self.sync_configs.get(source, {})
        conflict_field = config.get('conflict_field', 'code')

        for item in data.get('items', []):
            code = item.get(conflict_field)
            if code:
                existing = KPI.objects.filter(tenant_id=tenant_id, code=code).first()
                if existing:
                    conflicts.append({
                        'code': code,
                        'existing': {
                            'name': existing.name,
                            'target_value': getattr(existing, 'target_value', None)
                        },
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
            merged = {**conflict['existing'], **conflict['incoming']}
            return {'action': 'merge', 'data': merged}
        else:
            raise SyncConflictError(f"Unknown resolution: {resolution}")