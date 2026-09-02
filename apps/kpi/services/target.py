from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import F
from apps.accounts.models import User
from apps.kpi.models import AnnualTarget, MonthlyPhasing, PhasingLock, TargetHistory, KPI, ActualAdjustment
from apps.kpi.engine.phasing import PhasingEngine
from ..validators import validate_positive_value, validate_year, validate_month, validate_future_period
from ..exceptions import TargetPhasingError, PhasingLockedError, DuplicatePhasingError, PermissionDenied

CACHE_TTL = 3600
CACHE_PREFIX = "kpi_target"


class TargetSetter:
    def set_annual_target(
        self,
        kpi_id: str,
        user_id: str,
        year: int,
        target_value: Decimal,
        user
    ) -> AnnualTarget:
        year = int(year)
        target_value = Decimal(str(target_value))
        validate_positive_value(target_value)
        validate_year(year)
        validate_future_period(year, 1)


        if not hasattr(user, 'tenant_id') or not user.tenant_id:
            raise PermissionDenied("User has no tenant association")

        kpi = KPI.objects.filter(id=kpi_id, tenant_id=user.tenant_id).first()
        if not kpi:
            raise DjangoValidationError(f"KPI {kpi_id} not found in tenant")

        existing = AnnualTarget.objects.filter(
            tenant_id=user.tenant_id,
            kpi_id=kpi_id,
            user_id=user_id,
            year=year
        ).first()

        with transaction.atomic():
            if existing:
                old_value = existing.target_value
                AnnualTarget.objects.filter(id=existing.id).update(
                    target_value=target_value,
                    updated_by=user,
                    updated_at=timezone.now()
                )
                existing.refresh_from_db()

                TargetHistory.objects.create(
                    tenant_id=existing.tenant_id,
                    annual_target=existing,
                    action='UPDATE',
                    old_value=old_value,
                    new_value=target_value,
                    performed_by=user,
                    notes="Annual target updated"
                )
                self._invalidate_caches(kpi_id, user_id, year)
                return existing
            else:
                target = AnnualTarget.objects.create(
                    tenant_id=user.tenant_id,
                    kpi_id=kpi_id,
                    user_id=user_id,
                    year=year,
                    target_value=target_value,
                    created_by=user,
                    updated_by=user
                )
                TargetHistory.objects.create(
                    tenant_id=target.tenant_id,
                    annual_target=target,
                    action='CREATE',
                    new_value=target_value,
                    performed_by=user,
                    notes="Annual target created"
                )
                self._invalidate_caches(kpi_id, user_id, year)
                return target

    def _invalidate_caches(self, kpi_id: str, user_id: str, year: int) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:annual_target_{kpi_id}_{user_id}_{year}")
        cache.delete(f"{CACHE_PREFIX}:user_targets_{user_id}_{year}")
        safe_delete_pattern(f"{CACHE_PREFIX}:monthly_phasing_*")


class TargetPhaser:
    def __init__(self):
        self.engine = PhasingEngine()

    def phase_target(
        self,
        annual_target_id: str,
        strategy: str = 'equal_split',
        strategy_params: Optional[Dict] = None,
        user = None,
        overwrite: bool = True
    ) -> List[MonthlyPhasing]:
        if user and hasattr(user, 'tenant_id') and user.tenant_id:
            annual_target = AnnualTarget.objects.filter(id=annual_target_id, tenant_id=user.tenant_id).select_related('kpi', 'user').first()
        else:
            annual_target = AnnualTarget.objects.filter(id=annual_target_id).select_related('kpi', 'user').first()

        if not annual_target:
            raise DjangoValidationError(f"Annual target {annual_target_id} not found")

        if user and annual_target.tenant_id != user.tenant_id:
            raise PermissionDenied("Target does not belong to your tenant")

        existing = MonthlyPhasing.objects.filter(annual_target=annual_target)
        if existing.exists():
            if existing.filter(is_locked=True).exists():
                raise PhasingLockedError(f"Target already phased and one or more months are locked for {annual_target.kpi.name}")
            if not overwrite:
                raise DuplicatePhasingError(f"Target already phased for {annual_target.kpi.name}")

        if self._is_phasing_locked(annual_target.tenant_id, annual_target.year):
            raise PhasingLockedError(f"Phasing is locked for {annual_target.year}")

        if strategy_params:
            self._validate_strategy_params(strategy, strategy_params)

        with transaction.atomic():
            monthly_phasing = self.engine.phase_target(
                annual_target,
                strategy,
                strategy_params,
                overwrite=overwrite
            )

            TargetHistory.objects.create(
                tenant_id=annual_target.tenant_id,
                annual_target=annual_target,
                action='PHASE',
                new_value=annual_target.target_value,
                performed_by=user,
                notes=f"Phased using {strategy} strategy"
            )

            cache.delete(f"{CACHE_PREFIX}:monthly_phasing_{annual_target_id}")
            return monthly_phasing

    def _is_phasing_locked(self, tenant_id: str, year: int) -> bool:
        return PhasingLock.objects.filter(
            tenant_id=tenant_id,
            performance_cycle__contains=str(year)
        ).exists()

    def _validate_strategy_params(self, strategy: str, params: Dict) -> None:
        if strategy == 'custom_pattern':
            if 'pattern' not in params:
                raise DjangoValidationError("custom_pattern requires 'pattern' parameter")
            pattern = params['pattern']
            if len(pattern) != 12:
                raise DjangoValidationError("Pattern must have exactly 12 values")
            if not all(isinstance(v, (int, float)) and v >= 0 for v in pattern):
                raise DjangoValidationError("Pattern values must be non-negative numbers")

        if strategy == 'seasonal':
            if 'weights' in params:
                weights = params['weights']
                for month, weight in weights.items():
                    if not isinstance(month, int) or month < 1 or month > 12:
                        raise DjangoValidationError(f"Invalid month key: {month}")
                    if not isinstance(weight, (int, float)) or weight < 0 or weight > 1:
                        raise DjangoValidationError(f"Weight for month {month} must be between 0 and 1")


class TargetLocker:
    def lock_phasing_for_cycle(self, tenant_id: str, performance_cycle: str, user) -> int:
        import re
        with transaction.atomic():
            PhasingLock.objects.get_or_create(
                tenant_id=tenant_id,
                performance_cycle=performance_cycle,
                defaults={
                    'locked_by': user,
                    'reason': "Performance cycle started"
                }
            )
            match = re.search(r'\d{4}', str(performance_cycle))
            year = int(match.group()) if match else timezone.now().year
            updated = MonthlyPhasing.objects.filter(
                tenant_id=tenant_id,
                annual_target__year=year
            ).update(
                is_locked=True,
                locked_at=timezone.now(),
                locked_by=user
            )
            from apps.kpi.utils.cache_keys import safe_delete_pattern
            safe_delete_pattern(f"{CACHE_PREFIX}:monthly_phasing_*")
            return updated

    def unlock_phasing_for_cycle(self, tenant_id: str, performance_cycle: str, user) -> int:
        import re
        with transaction.atomic():
            PhasingLock.objects.filter(
                tenant_id=tenant_id,
                performance_cycle=performance_cycle
            ).delete()
            match = re.search(r'\d{4}', str(performance_cycle))
            year = int(match.group()) if match else timezone.now().year
            updated = MonthlyPhasing.objects.filter(
                tenant_id=tenant_id,
                annual_target__year=year
            ).update(
                is_locked=False,
                locked_at=None,
                locked_by=None
            )
            from apps.kpi.utils.cache_keys import safe_delete_pattern
            safe_delete_pattern(f"{CACHE_PREFIX}:monthly_phasing_*")
            return updated



class TargetAdjuster:
    def request_adjustment(
        self,
        annual_target_id: str,
        new_value: Decimal,
        reason: str,
        user
    ) -> Dict:
        annual_target = AnnualTarget.objects.filter(
            id=annual_target_id,
            tenant_id=user.tenant_id
        ).first()

        if not annual_target:
            raise DjangoValidationError("Target not found")

        pending = ActualAdjustment.objects.filter(
            original_actual_id=annual_target_id,
            status='PENDING'
        ).exists()

        if pending:
            raise TargetPhasingError("A pending adjustment already exists for this target")

        with transaction.atomic():
            adjustment = ActualAdjustment.objects.create(
                tenant_id=annual_target.tenant_id,
                original_actual_id=annual_target_id,
                adjusted_value=new_value,
                reason=reason,
                requested_by=user,
                status='PENDING'
            )
            return {
                'adjustment_id': str(adjustment.id),
                'status': 'PENDING',
                'message': 'Adjustment request submitted for approval'
            }

    def approve_adjustment(self, adjustment_id: str, approver) -> AnnualTarget:
        adjustment = ActualAdjustment.objects.filter(
            id=adjustment_id,
            tenant_id=approver.tenant_id
        ).select_related('original_actual').first()

        if not adjustment:
            raise DjangoValidationError("Adjustment not found")

        annual_target = adjustment.original_actual

        with transaction.atomic():
            old_value = annual_target.target_value
            AnnualTarget.objects.filter(id=annual_target.id).update(
                target_value=adjustment.adjusted_value,
                updated_by=approver,
                updated_at=timezone.now()
            )
            annual_target.refresh_from_db()

            TargetHistory.objects.create(
                tenant_id=annual_target.tenant_id,
                annual_target=annual_target,
                action='ADJUST',
                old_value=old_value,
                new_value=adjustment.adjusted_value,
                performed_by=approver,
                notes=adjustment.reason
            )

            adjustment.status = 'APPROVED'
            adjustment.approved_by = approver
            adjustment.approved_at = timezone.now()
            adjustment.save()

            cache.delete(f"{CACHE_PREFIX}:annual_target_{annual_target.kpi_id}_{annual_target.user_id}_{annual_target.year}")
            return annual_target


class TargetValidator:
    def validate_phasing_sum(self, annual_target_id: str) -> Dict:
        annual_target = AnnualTarget.objects.get(id=annual_target_id)
        monthly_phasing = MonthlyPhasing.objects.filter(annual_target=annual_target)

        if not monthly_phasing.exists():
            return {
                'valid': False,
                'error': 'No phasing found',
                'total': 0,
                'target': annual_target.target_value
            }

        total_phased = sum(p.target_value for p in monthly_phasing)
        diff = abs(total_phased - annual_target.target_value)

        return {
            'valid': diff < Decimal('0.01'),
            'total': float(total_phased),
            'target': float(annual_target.target_value),
            'difference': float(diff)
        }

    def validate_monthly_targets(self, annual_target_id: str) -> List[Dict]:
        monthly_phasing = MonthlyPhasing.objects.filter(
            annual_target_id=annual_target_id
        ).order_by('month')

        validation_results = []
        for phase in monthly_phasing:
            errors = []
            if phase.target_value < 0:
                errors.append("Negative value")
            validation_results.append({
                'month': phase.month,
                'target': float(phase.target_value),
                'is_locked': phase.is_locked,
                'errors': errors
            })
        return validation_results


class TargetImporter:
    def import_from_csv(self, csv_content: str, tenant_id: str, user) -> Dict:
        import csv
        import io

        try:
            reader = csv.DictReader(io.StringIO(csv_content))
            if not reader.fieldnames:
                raise DjangoValidationError("CSV has no headers")

            required_fields = ['kpi_id', 'user_id', 'year', 'target_value']
            missing = [f for f in required_fields if f not in reader.fieldnames]
            if missing:
                raise DjangoValidationError(f"Missing required columns: {', '.join(missing)}")

        except csv.Error as e:
            raise DjangoValidationError(f"Invalid CSV format: {str(e)}")

        created = []
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                if not all(row.get(f) for f in required_fields):
                    raise DjangoValidationError(f"Missing required field in row {row_num}")

                target = AnnualTarget.objects.create(
                    tenant_id=tenant_id,
                    kpi_id=row['kpi_id'],
                    user_id=row['user_id'],
                    year=int(row['year']),
                    target_value=Decimal(row['target_value']),
                    notes=row.get('notes', ''),
                    created_by=user,
                    updated_by=user
                )
                created.append(str(target.id))
            except Exception as e:
                errors.append({'row': row_num, 'error': str(e)})

        return {'created': len(created), 'errors': errors, 'total': len(created) + len(errors)}

    def export_to_csv(self, tenant_id: str, year: int = None) -> str:
        import csv
        import io

        targets = AnnualTarget.objects.filter(tenant_id=tenant_id).select_related('kpi', 'user')
        if year:
            targets = targets.filter(year=year)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['kpi_id', 'kpi_code', 'kpi_name', 'user_id', 'user_email', 'year', 'target_value', 'notes'])

        for target in targets:
            writer.writerow([
                str(target.kpi_id),
                target.kpi.code,
                target.kpi.name,
                str(target.user_id),
                target.user.email,
                target.year,
                float(target.target_value),
                target.notes or ''
            ])

        return output.getvalue()


class TargetBatchPhaser:
    def __init__(self):
        self.phaser = TargetPhaser()

    @transaction.atomic
    def phase_all_targets(
        self,
        year: int,
        tenant_id: str = None,
        strategy: str = 'equal_split',
        user = None,
        batch_size: int = 100
    ) -> Dict:
        targets = AnnualTarget.objects.filter(year=year)
        if tenant_id:
            targets = targets.filter(tenant_id=tenant_id)

        target_ids = list(targets.values_list('id', flat=True))
        total = len(target_ids)
        results = {'success': [], 'failed': [], 'total': total}

        for i in range(0, total, batch_size):
            batch_ids = target_ids[i:i + batch_size]
            for target_id in batch_ids:
                try:
                    self.phaser.phase_target(str(target_id), strategy, {}, user)
                    results['success'].append(str(target_id))
                except Exception as e:
                    results['failed'].append({'id': str(target_id), 'error': str(e)})
                    if len(results['failed']) > 50:
                        raise TargetPhasingError(f"Too many failures ({len(results['failed'])}). Aborting.")

        return results