from typing import List, Dict, Optional, Any
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q, F
from apps.accounts.models import User
from apps.kpi.models import MonthlyActual, ValidationRecord, ValidationComment, RejectionReason, Escalation, MonthlyPhasing
from ..exceptions import ValidationNotAllowedError, ApprovalError, EscalationError, PermissionDenied

CACHE_TTL = 300
CACHE_PREFIX = "kpi_validation"


class ValidationApprover:
    def approve(self, actual_id: str, supervisor, comment: str = "") -> MonthlyActual:
        actual = MonthlyActual.objects.select_related('kpi', 'user').filter(
            id=actual_id
        ).first()

        if not actual:
            raise DjangoValidationError("Actual entry not found")

        self._validate_supervisor_access(supervisor, actual.user_id)

        if actual.status != 'PENDING':
            raise ApprovalError(f"Cannot approve entry with status: {actual.status}")

        tenant_id = actual.tenant_id or getattr(supervisor, 'tenant_id', None) or getattr(actual.kpi, 'tenant_id', None)

        with transaction.atomic():
            if not actual.tenant_id and tenant_id:
                actual.tenant_id = tenant_id
                actual.save(update_fields=['tenant_id'])

            actual.approve(supervisor, comment)
            self._invalidate_caches(actual.user_id, actual.year, actual.month)
            return actual

    def batch_approve(self, actual_ids: List[str], supervisor) -> Dict:
        actuals = MonthlyActual.objects.filter(
            id__in=actual_ids,
            tenant_id=supervisor.tenant_id,
            status='PENDING'
        ).select_related('kpi', 'user')

        direct_reports = self._get_direct_reports(supervisor.id)
        valid_actuals = [a for a in actuals if str(a.user_id) in direct_reports]

        results = {'approved': [], 'failed': []}

        with transaction.atomic():
            for actual in valid_actuals:
                try:
                    actual.approve(supervisor, "")
                    ValidationRecord.objects.create(
                        tenant_id=actual.tenant_id,
                        actual=actual,
                        status='APPROVED',
                        validated_by=supervisor
                    )
                    results['approved'].append(str(actual.id))
                    self._invalidate_caches(actual.user_id, actual.year, actual.month)
                except Exception as e:
                    results['failed'].append({'id': str(actual.id), 'error': str(e)})

        return results

    def _validate_supervisor_access(self, supervisor, user_id: str) -> None:
        role = str(getattr(supervisor, 'role', '')).lower()
        if role in ['super_admin', 'superadmin', 'client_admin', 'admin', 'dashboard_champion', 'manager', 'supervisor', 'executive'] or getattr(supervisor, 'is_superuser', False):
            return

        direct_reports = self._get_direct_reports(supervisor.id)
        if str(user_id) in direct_reports:
            return

        try:
            from apps.structure.models import Employment
            emp = Employment.objects.filter(user_id=user_id, is_current=True, is_active=True).first()
            if emp and emp.effective_manager_user_id and str(emp.effective_manager_user_id) == str(supervisor.id):
                return
        except Exception:
            pass

        raise PermissionDenied("You are not authorized to validate this entry")

    def _get_direct_reports(self, supervisor_id: str) -> List[str]:
        cache_key = f"{CACHE_PREFIX}:direct_reports:{supervisor_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        reports = []
        try:
            supervisor = User.objects.get(id=supervisor_id)
            if hasattr(supervisor, 'get_direct_reports'):
                directs = list(supervisor.get_direct_reports().values_list('id', flat=True))
                reports.extend([str(r) for r in directs])
        except User.DoesNotExist:
            pass

        try:
            from apps.structure.models import Employment
            employments = Employment.objects.filter(is_current=True, is_active=True)
            for emp in employments:
                mgr_id = emp.effective_manager_user_id
                if mgr_id and str(mgr_id) == str(supervisor_id):
                    reports.append(str(emp.user_id))
        except Exception:
            pass

        reports = list(set(reports))
        cache.set(cache_key, reports, CACHE_TTL)
        return reports

    def _invalidate_caches(self, user_id: str, year: int, month: int) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:pending_count_{user_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:dashboard_*_{user_id}_*")


class ValidationRejecter:
    def reject(
        self,
        actual_id: str,
        supervisor,
        reason_id: str = None,
        comment: str = ""
    ) -> MonthlyActual:
        actual = MonthlyActual.objects.select_related('kpi', 'user').filter(
            id=actual_id
        ).first()

        if not actual:
            raise DjangoValidationError("Actual entry not found")

        self._validate_supervisor_access(supervisor, actual.user_id)

        if actual.status != 'PENDING':
            raise ApprovalError(f"Cannot reject entry with status: {actual.status}")

        tenant_id = actual.tenant_id or getattr(supervisor, 'tenant_id', None) or getattr(actual.kpi, 'tenant_id', None)

        rejection_reason = None
        if reason_id:
            rejection_reason = RejectionReason.objects.filter(
                id=reason_id
            ).first()

        with transaction.atomic():
            if not actual.tenant_id and tenant_id:
                actual.tenant_id = tenant_id
            actual.status = 'REJECTED'
            actual.updated_by = supervisor
            actual.save()

            ValidationRecord.objects.create(
                tenant_id=tenant_id,
                actual=actual,
                status='REJECTED',
                validated_by=supervisor,
                rejection_reason=rejection_reason,
                comment=comment
            )
            self._invalidate_caches(actual.user_id, actual.year, actual.month)
            return actual

    def batch_reject(
        self,
        actual_ids: List[str],
        supervisor,
        reason_id: str = None
    ) -> Dict:
        actuals = MonthlyActual.objects.filter(
            id__in=actual_ids,
            tenant_id=supervisor.tenant_id,
            status='PENDING'
        ).select_related('kpi', 'user')

        direct_reports = self._get_direct_reports(supervisor.id)
        valid_actuals = [a for a in actuals if str(a.user_id) in direct_reports]

        results = {'rejected': [], 'failed': []}

        with transaction.atomic():
            for actual in valid_actuals:
                try:
                    actual.status = 'REJECTED'
                    actual.updated_by = supervisor
                    actual.save()

                    ValidationRecord.objects.create(
                        tenant_id=actual.tenant_id,
                        actual=actual,
                        status='REJECTED',
                        validated_by=supervisor,
                        rejection_reason_id=reason_id
                    )
                    results['rejected'].append(str(actual.id))
                    self._invalidate_caches(actual.user_id, actual.year, actual.month)
                except Exception as e:
                    results['failed'].append({'id': str(actual.id), 'error': str(e)})

        return results

    def _validate_supervisor_access(self, supervisor, user_id: str) -> None:
        direct_reports = self._get_direct_reports(supervisor.id)
        if str(user_id) not in direct_reports:
            raise PermissionDenied("You are not authorized to validate this entry")

    def _get_direct_reports(self, supervisor_id: str) -> List[str]:
        cache_key = f"{CACHE_PREFIX}:direct_reports:{supervisor_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            supervisor = User.objects.get(id=supervisor_id)
            reports = list(supervisor.get_direct_reports().values_list('id', flat=True))
            reports = [str(r) for r in reports]
            cache.set(cache_key, reports, CACHE_TTL)
            return reports
        except User.DoesNotExist:
            return []

    def _invalidate_caches(self, user_id: str, year: int, month: int) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:pending_count_{user_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:dashboard_*_{user_id}_*")


class ValidationResubmission:
    def resubmit(
        self,
        actual_id: str,
        new_value: Decimal,
        user,
        notes: str = ""
    ) -> MonthlyActual:
        actual = MonthlyActual.objects.select_related('kpi').filter(
            id=actual_id,
            tenant_id=user.tenant_id
        ).first()

        if not actual:
            raise DjangoValidationError("Actual entry not found")

        if actual.user_id != user.id:
            raise ValidationNotAllowedError("Only the original submitter can resubmit")

        if actual.status != 'REJECTED':
            raise ApprovalError(f"Cannot resubmit entry with status: {actual.status}")

        with transaction.atomic():
            actual.actual_value = new_value
            actual.status = 'PENDING'
            actual.notes = notes or actual.notes
            actual.submitted_by = user
            actual.submitted_at = timezone.now()
            actual.save()

            last_validation = actual.validations.order_by('-validated_at').first()
            if last_validation:
                ValidationComment.objects.create(
                    tenant_id=actual.tenant_id,
                    validation=last_validation,
                    comment=f"Resubmitted with value {new_value}. Notes: {notes}" if notes else f"Resubmitted with value {new_value}",
                    commented_by=user
                )

            self._invalidate_caches(actual.user_id, actual.year, actual.month)
            return actual

    def _invalidate_caches(self, user_id: str, year: int, month: int) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:pending_count_{user_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:dashboard_*_{user_id}_*")


class ValidationEscalator:
    def escalate(
        self,
        actual_id: str,
        escalated_to_id: str,
        reason: str,
        user
    ) -> Escalation:
        actual = MonthlyActual.objects.select_related('kpi').filter(
            id=actual_id,
            tenant_id=user.tenant_id
        ).first()

        if not actual:
            raise DjangoValidationError("Actual entry not found")

        if actual.status not in ['PENDING', 'REJECTED']:
            raise EscalationError(f"Cannot escalate entry with status: {actual.status}")

        escalated_to = User.objects.filter(
            id=escalated_to_id,
            tenant_id=user.tenant_id,
            is_active=True
        ).first()

        if not escalated_to:
            raise DjangoValidationError("Target supervisor not found")

        with transaction.atomic():
            escalation = Escalation.objects.create(
                tenant_id=actual.tenant_id,
                actual=actual,
                escalated_by=user,
                escalated_to=escalated_to,
                reason=reason,
                status='PENDING'
            )
            actual.status = 'PENDING'
            actual.notes = f"[ESCALATED] {reason}\n{actual.notes}" if actual.notes else f"[ESCALATED] {reason}"
            actual.save()

            self._invalidate_caches(actual.user_id, actual.year, actual.month)
            return escalation

    def resolve_escalation(self, escalation_id: str, resolution: str, resolver) -> Escalation:
        escalation = Escalation.objects.filter(
            id=escalation_id,
            tenant_id=resolver.tenant_id
        ).select_related('actual').first()

        if not escalation:
            raise DjangoValidationError("Escalation not found")

        if escalation.escalated_to_id != resolver.id:
            raise PermissionDenied("Only the assigned resolver can resolve this escalation")

        with transaction.atomic():
            escalation.resolve(resolver, resolution)
            return escalation

    def _invalidate_caches(self, user_id: str, year: int, month: int) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:pending_count_{user_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:dashboard_*_{user_id}_*")


class BatchValidator:
    def __init__(self):
        self.approver = ValidationApprover()
        self.rejecter = ValidationRejecter()

    def validate_pending_entries(
        self,
        supervisor,
        year: int,
        month: int,
        auto_approve_threshold: int = 5
    ) -> Dict:
        direct_reports = self._get_direct_reports(supervisor.id)
        if not direct_reports:
            return {'approved': [], 'rejected': [], 'total': 0}

        pending = MonthlyActual.objects.filter(
            tenant_id=supervisor.tenant_id,
            year=year,
            month=month,
            status='PENDING',
            user_id__in=direct_reports
        ).select_related('kpi')

        results = {'approved': [], 'rejected': [], 'total': pending.count()}

        for actual in pending:
            try:
                if self._auto_approve_criteria(actual, auto_approve_threshold):
                    self.approver.approve(str(actual.id), supervisor)
                    results['approved'].append(str(actual.id))
                else:
                    results['rejected'].append(str(actual.id))
            except Exception as e:
                results['rejected'].append({'id': str(actual.id), 'error': str(e)})

        return results

    def _get_direct_reports(self, supervisor_id: str) -> List[str]:
        cache_key = f"{CACHE_PREFIX}:direct_reports:{supervisor_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            supervisor = User.objects.get(id=supervisor_id)
            reports = list(supervisor.get_direct_reports().values_list('id', flat=True))
            reports = [str(r) for r in reports]
            cache.set(cache_key, reports, CACHE_TTL)
            return reports
        except User.DoesNotExist:
            return []

    def _auto_approve_criteria(self, actual: MonthlyActual, threshold: int = 5) -> bool:
        target = MonthlyPhasing.objects.filter(
            annual_target__kpi=actual.kpi,
            annual_target__user=actual.user,
            annual_target__year=actual.year,
            month=actual.month,
            is_locked=True
        ).first()

        if not target:
            return False

        if target.target_value == 0:
            return actual.actual_value == 0

        variance = abs(actual.actual_value - target.target_value) / target.target_value * 100
        if variance <= threshold:
            return True

        previous_approved = MonthlyActual.objects.filter(
            kpi=actual.kpi,
            user=actual.user,
            year=actual.year,
            month__lt=actual.month,
            status='APPROVED'
        ).count()

        return previous_approved == actual.month - 1


class AutoApprovalService:
    def __init__(self):
        self.approver = ValidationApprover()

    def auto_approve_if_eligible(
        self,
        actual_id: str,
        supervisor,
        threshold: int = 5
    ) -> Dict:
        actual = MonthlyActual.objects.select_related('kpi').filter(
            id=actual_id,
            tenant_id=supervisor.tenant_id
        ).first()

        if not actual:
            return {'status': 'ERROR', 'method': 'none', 'error': 'Entry not found'}

        if self._meets_auto_approve_criteria(actual, threshold):
            self.approver.approve(actual_id, supervisor, "Auto-approved by system")
            return {'status': 'APPROVED', 'method': 'auto'}

        return {'status': 'PENDING', 'method': 'manual'}

    def _meets_auto_approve_criteria(self, actual: MonthlyActual, threshold: int = 5) -> bool:
        target = MonthlyPhasing.objects.filter(
            annual_target__kpi=actual.kpi,
            annual_target__user=actual.user,
            annual_target__year=actual.year,
            month=actual.month,
            is_locked=True
        ).first()

        if not target:
            return False

        variance = abs(actual.actual_value - target.target_value) / target.target_value * 100
        if variance <= threshold:
            return True

        previous_approved = MonthlyActual.objects.filter(
            kpi=actual.kpi,
            user=actual.user,
            year=actual.year,
            month__lt=actual.month,
            status='APPROVED'
        ).count()

        return previous_approved == actual.month - 1

    def batch_auto_approve(
        self,
        supervisor_id: str,
        year: int,
        month: int,
        threshold: int = 5
    ) -> Dict:
        try:
            supervisor = User.objects.get(id=supervisor_id)
        except User.DoesNotExist:
            return {'approved': [], 'pending': [], 'error': 'Supervisor not found'}

        direct_reports = self._get_direct_reports(supervisor_id)
        if not direct_reports:
            return {'approved': [], 'pending': [], 'total': 0}

        pending = MonthlyActual.objects.filter(
            tenant_id=supervisor.tenant_id,
            user_id__in=direct_reports,
            year=year,
            month=month,
            status='PENDING'
        ).select_related('kpi')

        results = {'approved': [], 'pending': [], 'total': pending.count()}

        for actual in pending:
            result = self.auto_approve_if_eligible(str(actual.id), supervisor, threshold)
            if result['status'] == 'APPROVED':
                results['approved'].append(str(actual.id))
            else:
                results['pending'].append(str(actual.id))

        return results

    def _get_direct_reports(self, supervisor_id: str) -> List[str]:
        cache_key = f"{CACHE_PREFIX}:direct_reports:{supervisor_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            supervisor = User.objects.get(id=supervisor_id)
            reports = list(supervisor.get_direct_reports().values_list('id', flat=True))
            reports = [str(r) for r in reports]
            cache.set(cache_key, reports, CACHE_TTL)
            return reports
        except User.DoesNotExist:
            return []


def pending_validation_count_for_supervisor(supervisor) -> int:
    if not supervisor or not hasattr(supervisor, 'id'):
        return 0

    cache_key = f"{CACHE_PREFIX}:pending_count_supervisor:{supervisor.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        direct_reports = supervisor.get_direct_reports().values_list('id', flat=True)
        if not direct_reports:
            return 0

        count = MonthlyActual.objects.filter(
            tenant_id=supervisor.tenant_id,
            user_id__in=direct_reports,
            status='PENDING'
        ).count()

        cache.set(cache_key, count, CACHE_TTL // 2)
        return count
    except Exception:
        return 0


def pending_validation_count_for_supervisor_id(supervisor_id: Optional[str]) -> int:
    if not supervisor_id:
        return 0

    cache_key = f"{CACHE_PREFIX}:pending_count_supervisor_id:{supervisor_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        supervisor = User.objects.filter(id=supervisor_id).first()
        if not supervisor:
            return 0
        return pending_validation_count_for_supervisor(supervisor)
    except Exception:
        return 0