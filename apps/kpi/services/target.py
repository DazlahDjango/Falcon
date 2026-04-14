from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from apps.kpi.models import AnnualTarget, MonthlyPhasing, PhasingLock, TargetHistory, KPI, ActualAdjustment
from apps.kpi.engine import PhasingEngine
from ..validators import validate_positive_value, validate_year, validate_month, validate_future_period
from ..exceptions import TargetPhasingError, PhasingLockedError, DuplicatePhasingError

class TargetSetter:
    def set_annual_target(self, kpi_id: str, user_id: str, year: int, target_value: Decimal, user) -> AnnualTarget:
        validate_positive_value(target_value)
        validate_year(year)
        validate_future_period(year, 1)
        existing = AnnualTarget.objects.filter(kpi_id=kpi_id, user_id=user_id, year=year).first()
        with transaction.atomic():
            if existing:
                old_value = existing.target_value
                existing.target_value = target_value
                existing.updated_by = user
                existing.save()
                TargetHistory.objects.create(
                    tenant_id=existing.tenant_id,
                    annual_target=existing,
                    action='UPDATE',
                    old_value=old_value,
                    new_value=target_value,
                    performed_by=user,
                    notes="Annual target updated"
                )
                return existing
            else:
                target = AnnualTarget.objects.create(
                    tenant_id=KPI.objects.get(id=kpi_id).tenant_id,
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
                cache.delete(f"annual_target_{kpi_id}_{user_id}_{year}")
                return target
            
class TargetPhaser:
    def __init__(self):
        self.engine = PhasingEngine()
    def phase_target(self, annual_target_id: str, strategy: str = 'equal_split', strategy_params: Optional[Dict] = None, user=None) -> List[MonthlyPhasing]:
        annual_target = AnnualTarget.objects.get(id=annual_target_id)
        if MonthlyPhasing.objects.filter(annual_target=annual_target).exists():
            raise DuplicatePhasingError(f"Target already phased for {annual_target.kpi.name}")
        if self._is_phasing_locked(annual_target.tenant_id, annual_target.year):
            raise PhasingLockedError(f"Phasing is locked for {annual_target.year}")
        with transaction.atomic():
            monthly_values = self.engine.phase_target(annual_target_id, strategy, strategy_params)
            TargetHistory.objects.create(
                tenant_id=annual_target.tenant_id,
                annual_target=annual_target,
                action='PHASE',
                new_value=annual_target.target_value,
                performed_by=user,
                notes=f"Phased using {strategy} strategy"
            )
            cache.delete(f"monthly_phasing_{annual_target_id}")
            return monthly_values
    def _is_phasing_locked(self, tenant_id: str, year: int) -> bool:
        return PhasingLock.objects.filter(tenant_id=tenant_id, perfomance_cycle__contains=str(year)).exists()

class TargetLocker:
    def lock_phasing_for_cycle(self, tenant_id: str, performance_cycle: str, user) -> int:
        with transaction.atomic():
            PhasingLock.objects.create(
                tenant_id=tenant_id,
                performance_cycle=performance_cycle,
                locked_by=user,
                reason="Perfomance cycle started"
            )
            year = int(performance_cycle[-4:])
            updated = MonthlyPhasing.objects.filter(tenant_id=tenant_id, annual_target__year=year).update(is_locked=True, locked_at=timezone.now(), locked_by=user)
            return updated
        
    def unlock_phasing_for_cycle(self, tenant_id: str, performance_cycle: str, user) -> int:
        with transaction.atomic():
            PhasingLock.objects.filter(
                tenant_id=tenant_id,
                performance_cycle=performance_cycle
            ).delete()
            year = int(performance_cycle[-4:])
            updated = MonthlyPhasing.objects.filter(
                tenant_id=tenant_id,
                annual_target__year=year
            ).update(
                is_locked=False,
                locked_at=None,
                locked_by=None
            )    
            return updated
    
class TargetAdjuster:
    def request_adjustment(self, annual_target_id: str, new_value: Decimal, reason: str, user) -> Dict:
        annual_target = AnnualTarget.objects.get(id=annual_target_id)
        pending = ActualAdjustment.objects.filter(original_actual_id=annual_target_id, status='PENDING').exists()
        if pending:
            raise TargetPhasingError("There is already a pending adjustment for this target")
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
        adjustment = ActualAdjustment.objects.get(id=adjustment_id)
        annual_target = adjustment.original_actual
        with transaction.atomic():
            old_value = annual_target.target_value
            annual_target.target_value = adjustment.adjusted_value
            annual_target.updated_by = approver
            annual_target.save()
            TargetHistory.objects.create(
                tenant_id=annual_target.tenant_id,
                annual_target=annual_target,
                action='ADJUST',
                old_value=old_value,
                new_value=adjustment.adjusted_value,
                performed_by=approver,
                notes=adjustment.reason
            )
            return annual_target
        
class TargetValidator:
    def validate_phasing_sum(self, annual_target_id: str) -> Dict:
        annual_target = AnnualTarget.objects.get(id=annual_target_id)
        monthly_phasing = MonthlyPhasing.objects.filter(annual_target=annual_target)
        if not monthly_phasing.exists():
            return {'valid': False, 'error': 'No phasing found', 'total': 0, 'target': annual_target.target_value}
        total_phased = sum(p.target_value for p in monthly_phasing)
        diff = abs(total_phased - annual_target.target_value)
        return {
            'valid': diff < Decimal('0.01'),
            'total': total_phased,
            'target': annual_target.target_value,
            'difference': diff
        }
    def validate_monthly_targets(self, annual_target_id: str) -> List[Dict]:
        monthly_phasing = MonthlyPhasing.objects.filter(annual_target_id=annual_target_id).order_by('month')
        validation_results = []
        for phase in monthly_phasing:
            errors = []
            if phase.target_value < 0:
                errors.append("Negative value")
            validation_results.append({
                'month': phase.month,
                'target': phase.target_value,
                'is_locked': phase.is_locked,
                'errors': errors
            })
        return validation_results