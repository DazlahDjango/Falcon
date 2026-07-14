import csv
import json
import io
from decimal import Decimal
from datetime import datetime
from django.db import transaction
from typing import List, Dict, Any, Optional, Tuple
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.cache import cache
from apps.kpi.models import KPI, KPIHistory, KPICategory, KPIWeight, KPIDependency
from ..constants import KPIStatus, KPIType, CalculationLogic, MeasureType
from ..validators import validate_kpi_code, validate_kpi_name, validate_positive_value, validate_target_range, validate_decimal_precision
from ..exceptions import DuplicateKPICodeError, WeightSumError, KPIValidationError, HistoricalDataError, PermissionDenied

CACHE_TTL = 300
CACHE_PREFIX = "kpi_service"

def _safe_delete_pattern(pattern: str) -> None:
    """Safely delete cache pattern if supported"""
    try:
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern)
    except AttributeError:
        pass 

class KPICreator:
    def create(self, data: Dict, user) -> KPI:
        if not user.tenant_id:
            raise PermissionDenied("User has no tenant association")

        # Check for Super Admin
        is_super_admin = False
        role = str(getattr(user, 'role', '')).lower()
        if role in ['super_admin', 'superadmin', 'platform_admin']:
            is_super_admin = True

        kpi_exists_query = KPI.objects.filter(
            code=data['code']
        )
        if not is_super_admin:
            kpi_exists_query = kpi_exists_query.filter(tenant_id=user.tenant_id)
            
        if kpi_exists_query.exists():
            raise DuplicateKPICodeError("KPI code must be unique within the tenant.")

        validate_kpi_name(data['name'])
        validate_kpi_code(data['code'])
        validate_target_range(data.get('target_min'), data.get('target_max'))

        if data.get('target_min'):
            validate_decimal_precision(data['target_min'])
        if data.get('target_max'):
            validate_decimal_precision(data['target_max'])

        with transaction.atomic():
            kpi = KPI.objects.create(
                tenant_id=user.tenant_id if not is_super_admin else data.get('tenant_id', user.tenant_id),
                name=data['name'],
                code=data['code'],
                description=data.get('description', ''),
                category_id=data.get('category_id'),
                kpi_type=data['kpi_type'],
                calculation_logic=data.get('calculation_logic', CalculationLogic.HIGHER_IS_BETTER),
                measure_type=data.get('measure_type', MeasureType.CUMULATIVE),
                unit=data.get('unit', ''),
                decimal_places=data.get('decimal_places', 2),
                target_min=data.get('target_min'),
                target_max=data.get('target_max'),
                formula=data.get('formula', {}),
                owner_id=data['owner_id'],
                department_id=data.get('department_id'),
                strategic_objective=data.get('strategic_objective', ''),
                metadata=data.get('metadata', {}),
                is_active=data.get('is_active', True),
                activation_date=timezone.now().date() if data.get('is_active', True) else None,
                created_by=user,
                updated_by=user
            )

            KPIHistory.objects.create(
                tenant_id=kpi.tenant_id,
                kpi=kpi,
                action='CREATE',
                snapshot=self._serialize_kpi(kpi),
                performed_by=user,
                reason="KPI created"
            )

            self._invalidate_caches(kpi.id)
            return kpi

    def _serialize_kpi(self, kpi: KPI) -> Dict:
        return {
            'id': str(kpi.id),
            'name': kpi.name,
            'code': kpi.code,
            'description': kpi.description,
            'kpi_type': kpi.kpi_type,
            'calculation_logic': kpi.calculation_logic,
            'measure_type': kpi.measure_type,
            'target_min': str(kpi.target_min) if kpi.target_min else None,
            'target_max': str(kpi.target_max) if kpi.target_max else None,
        }

    def _invalidate_caches(self, kpi_id: str = None) -> None:
        if kpi_id:
            cache.delete(f"{CACHE_PREFIX}:kpi_{kpi_id}")
        _safe_delete_pattern(f"{CACHE_PREFIX}:kpi_list_*")


class KPIUpdater:
    def update(self, kpi_id: str, data: Dict, user) -> KPI:
        kpi = KPI.objects.filter(id=kpi_id, tenant_id=user.tenant_id).first()
        if not kpi:
            raise ValidationError("KPI not found or access denied")

        changes = {}

        with transaction.atomic():
            for field, new_value in data.items():
                if field == 'reason':
                    continue
                if hasattr(kpi, field):
                    old_value = getattr(kpi, field)
                    if old_value != new_value:
                        changes[field] = {
                            'old': str(old_value) if old_value else None,
                            'new': str(new_value) if new_value else None
                        }
                        setattr(kpi, field, new_value)

            if changes:
                kpi.updated_by = user
                kpi.save()

                KPIHistory.objects.create(
                    tenant_id=kpi.tenant_id,
                    kpi=kpi,
                    action='UPDATE',
                    snapshot=self._serialize_kpi(kpi),
                    changes=changes,
                    performed_by=user,
                    reason=data.get('reason', 'KPI updated')
                )

                self._invalidate_caches(kpi.id)

        return kpi

    def _serialize_kpi(self, kpi: KPI) -> Dict:
        return {
            'id': str(kpi.id),
            'name': kpi.name,
            'code': kpi.code,
            'description': kpi.description,
            'is_active': kpi.is_active,
            'updated_at': kpi.updated_at.isoformat() if kpi.updated_at else None,
        }

    def _invalidate_caches(self, kpi_id: str) -> None:
        cache.delete(f"{CACHE_PREFIX}:kpi_{kpi_id}")
        _safe_delete_pattern(f"{CACHE_PREFIX}:kpi_list_*")


class KPIActivator:
    def activate(self, kpi_id: str, user) -> KPI:
        kpi = KPI.objects.filter(id=kpi_id, tenant_id=user.tenant_id).first()
        if not kpi:
            raise ValidationError("KPI not found or access denied")

        if kpi.is_active:
            return kpi

        with transaction.atomic():
            kpi.activate(user)

            KPIHistory.objects.create(
                tenant_id=kpi.tenant_id,
                kpi=kpi,
                action='ACTIVATE',
                snapshot=self._serialize_kpi(kpi),
                performed_by=user,
                reason="KPI activated"
            )

            self._invalidate_caches(kpi.id)

        return kpi

    def deactivate(self, kpi_id: str, user, reason: str = "") -> KPI:
        kpi = KPI.objects.filter(id=kpi_id, tenant_id=user.tenant_id).first()
        if not kpi:
            raise ValidationError("KPI not found or access denied")

        if not kpi.is_active:
            return kpi

        with transaction.atomic():
            kpi.deactivate(user)

            KPIHistory.objects.create(
                tenant_id=kpi.tenant_id,
                kpi=kpi,
                action='DEACTIVATE',
                snapshot=self._serialize_kpi(kpi),
                performed_by=user,
                reason=reason or "KPI deactivated"
            )

            self._invalidate_caches(kpi.id)

        return kpi

    def _serialize_kpi(self, kpi: KPI) -> Dict:
        return {
            'id': str(kpi.id),
            'name': kpi.name,
            'is_active': kpi.is_active,
            'activation_date': kpi.activation_date.isoformat() if kpi.activation_date else None,
            'deactivation_date': kpi.deactivation_date.isoformat() if kpi.deactivation_date else None,
        }

    def _invalidate_caches(self, kpi_id: str) -> None:
        cache.delete(f"{CACHE_PREFIX}:kpi_{kpi_id}")


class KPIValidator:
    def validate_kpi_completeness(self, kpi: KPI) -> List[str]:
        errors = []
        if not kpi.name:
            errors.append("KPI name is required.")
        if not kpi.code:
            errors.append("KPI code is required.")
        if not kpi.owner:
            errors.append("KPI owner is required.")
        return errors

    def validate_weight_sum(self, kpi_id: str, user_id: str = None) -> Tuple[bool, str]:
        cache_key = f"{CACHE_PREFIX}:weight_validation_{kpi_id}_{user_id or 'all'}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        weights = KPIWeight.objects.filter(kpi_id=kpi_id)
        if user_id:
            weights = weights.filter(user_id=user_id)

        if not weights.exists():
            result = (False, "No weights defined for this KPI.")
            cache.set(cache_key, result, CACHE_TTL)
            return result

        total = sum(w.weight for w in weights)
        if abs(total - 100) > 0.01:
            result = (False, f"Total weight must sum to 100%. Current total: {total:.2f}%.")
            cache.set(cache_key, result, CACHE_TTL)
            return result

        result = (True, "Weights are valid.")
        cache.set(cache_key, result, CACHE_TTL)
        return result

    def validate_circular_dependency(self, kpi_id: str) -> Tuple[bool, List[str]]:
        visited = set()
        path = []

        def dfs(current_id):
            if current_id in visited:
                return False
            if current_id in path:
                return True
            path.append(current_id)
            dependencies = KPIDependency.objects.filter(source_kpi_id=current_id)
            for dep in dependencies:
                if dfs(str(dep.target_kpi_id)):
                    return True
            path.pop()
            visited.add(current_id)
            return False

        has_cycle = dfs(kpi_id)
        return (not has_cycle, path if has_cycle else [])

    def validate_measurement_period(self, kpi: KPI, year: int, month: int) -> Tuple[bool, str]:
        now = timezone.now()
        if kpi.activation_date and (year < kpi.activation_date.year or (year == kpi.activation_date.year and month < kpi.activation_date.month)):
            return False, f'KPI was activated on {kpi.activation_date}'
        if kpi.deactivation_date and (year > kpi.deactivation_date.year or (year == kpi.deactivation_date.year and month > kpi.deactivation_date.month)):
            return False, f'KPI was deactivated on {kpi.deactivation_date}'
        return True, "Measurement period is valid."


class KPIImportExport:
    def export_to_csv(self, tenant_id: str) -> str:
        kpis = KPI.objects.filter(tenant_id=tenant_id).select_related('category', 'owner')
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Code', 'Name', 'Description', 'Type', 'Calculation Logic',
            'Measure Type', 'Unit', 'Decimal Places', 'Target Min', 'Target Max',
            'Category', 'Owner Email', 'Department', 'Strategic Objective'
        ])

        for kpi in kpis:
            writer.writerow([
                kpi.code, kpi.name, kpi.description, kpi.kpi_type, kpi.calculation_logic,
                kpi.measure_type, kpi.unit, kpi.decimal_places, kpi.target_min, kpi.target_max,
                kpi.category.name if kpi.category else '',
                kpi.owner.email, kpi.department_id, kpi.strategic_objective
            ])

        return output.getvalue()

    def import_from_csv(self, csv_content: str, tenant_id: str, user, dry_run: bool = False) -> Dict:
        try:
            reader = csv.DictReader(io.StringIO(csv_content))
            if not reader.fieldnames:
                raise ValidationError("CSV has no headers")

            required_headers = ['Code', 'Name', 'Type']
            missing = [h for h in required_headers if h not in reader.fieldnames]
            if missing:
                raise ValidationError(f"Missing required columns: {', '.join(missing)}")
        except csv.Error as e:
            raise ValidationError(f"Invalid CSV format: {str(e)}")

        created = []
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                with transaction.atomic():
                    kpi = KPI.objects.create(
                        tenant_id=tenant_id,
                        code=row['Code'],
                        name=row['Name'],
                        description=row.get('Description', ''),
                        kpi_type=row['Type'],
                        calculation_logic=row.get('Calculation Logic', CalculationLogic.HIGHER_IS_BETTER),
                        measure_type=row.get('Measure Type', MeasureType.CUMULATIVE),
                        unit=row.get('Unit', ''),
                        decimal_places=int(row.get('Decimal Places', 2)),
                        target_min=Decimal(row['Target Min']) if row.get('Target Min') else None,
                        target_max=Decimal(row['Target Max']) if row.get('Target Max') else None,
                        owner_id=user.id,
                        strategic_objective=row.get('Strategic Objective', ''),
                        created_by=user,
                        updated_by=user
                    )
                    created.append(kpi.code)
                    if dry_run:
                        transaction.set_rollback(True)
            except Exception as e:
                errors.append({'row': row_num, 'code': row.get('Code'), 'error': str(e)})

        return {'created': created, 'errors': errors, 'total': len(created) + len(errors)}