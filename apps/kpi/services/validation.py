from typing import List, Dict, Optional
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
from apps.accounts.models import User
from ..models import MonthlyActual, ValidationRecord, ValidationComment, RejectionReason, Escalation
from ..exceptions import ValidationNotAllowedError, ApprovalError, EscalationError
from ..validators import validate_supervisor_access


class ValidationApprover:
    def approve(self, actual_id: str, supervisor, comment: str = "") -> MonthlyActual:
        actual = MonthlyActual.objects.get(id=actual_id)
        validate_supervisor_access(supervisor.id, actual.user_id)
        if actual.status != 'PENDING':
            raise ApprovalError(f"Cannot approve entry with status: {actual.status}")
        with transaction.atomic():
            actual.approve(supervisor, comment)
            ValidationRecord.objects.create(
                tenant_id=actual.tenant_id,
                actual=actual,
                status='APPROVED',
                validated_by=supervisor,
                comment=comment
            )
            return actual
    def batch_approve(self, actual_ids: List[str], supervisor) -> Dict:
        results = {'approved': [], 'failed': []}
        for actual_id in actual_ids:
            try:
                actual = self.approve(actual_id, supervisor)
                results['approved'].append(actual_id)
            except Exception as e:
                results['failed'].append({'id': actual_id, 'error': str(e)})
        return results

class ValidationRejecter:
    def reject(self, actual_id: str, supervisor, reason_id: str = None, comment: str = "") -> MonthlyActual:
        actual = MonthlyActual.objects.get(id=actual_id)
        validate_supervisor_access(supervisor.id, actual.user_id)
        if actual.status != 'PENDING':
            raise ApprovalError(f"Cannot reject entry with status: {actual.status}")
        rejection_reason = None
        if reason_id:
            rejection_reason = RejectionReason.objects.get(id=reason_id)
        with transaction.atomic():
            actual.reject(supervisor, rejection_reason, comment)
            ValidationRecord.objects.create(
                tenant_id=actual.tenant_id,
                actual=actual,
                status='REJECTED',
                validated_by=supervisor,
                rejection_reason=rejection_reason,
                comment=comment
            )
            return actual
    def batch_reject(self, actual_ids: List[str], supervisor, reason_id: str = None) -> Dict:
        results = {'rejected': [], 'failed': []}
        for actual_id in actual_ids:
            try:
                actual = self.reject(actual_id, supervisor, reason_id)
                results['rejected'].append(actual_id)
            except Exception as e:
                results['failed'].append({'id': actual_id, 'error': str(e)})
        return results

class ValidationResubmission:
    def resubmit(self, actual_id: str, new_value: Decimal, user, notes: str = "") -> MonthlyActual:
        actual = MonthlyActual.objects.get(id=actual_id)
        if actual.user_id != user.id:
            raise ValidationNotAllowedError("Only the original submitter can resubmit")
        if actual.status != 'REJECTED':
            raise ApprovalError(f"Cannot resubmit entry with status: {actual.status}")
        with transaction.atomic():
            actual.resubmit(new_value, user, notes)
            ValidationComment.objects.create(
                tenant_id=actual.tenant_id,
                validation=actual.validations.last(),
                comment=f"Resubmitted with value {new_value}",
                commented_by=user
            )
            return actual

class ValidationEscalator:
    def escalate(self, actual_id: str, escalated_to_id: str, reason: str, user) -> Escalation:
        actual = MonthlyActual.objects.get(id=actual_id)
        if actual.status not in ['PENDING', 'REJECTED']:
            raise EscalationError(f"Cannot escalate entry with status: {actual.status}")
        with transaction.atomic():
            escalation = Escalation.objects.create(
                tenant_id=actual.tenant_id,
                actual=actual,
                escalated_by=user,
                escalated_to_id=escalated_to_id,
                reason=reason,
                status='PENDING'
            )
            actual.status = 'PENDING'
            actual.save()
            return escalation
    def resolve_escalation(self, escalation_id: str, resolution: str, resolver) -> Escalation:
        escalation = Escalation.objects.get(id=escalation_id)
        with transaction.atomic():
            escalation.resolve(resolver, resolution)
            return escalation

class BatchValidator:
    def __init__(self):
        self.approver = ValidationApprover()
        self.rejecter = ValidationRejecter()
    def validate_pending_entries(self, supervisor, year: int, month: int) -> Dict:
        pending = MonthlyActual.objects.filter(
            tenant_id=supervisor.tenant_id,
            year=year,
            month=month,
            status='PENDING',
            user_id__in=self._get_direct_reports(supervisor.id)
        )
        results = {'approved': [], 'rejected': []}
        for actual in pending:
            try:
                if self._auto_approve_criteria(actual):
                    self.approver.approve(actual.id, supervisor)
                    results['approved'].append(actual.id)
                else:
                    results['rejected'].append(actual.id)
            except Exception as e:
                results['rejected'].append({'id': actual.id, 'error': str(e)})
        return results
    def _get_direct_reports(self, supervisor_id: str) -> List[str]:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            supervisor = User.objects.get(id=supervisor_id)
            return list(supervisor.get_direct_reports().values_list('id', flat=True))
        except User.DoesNotExist:
            return []
    def _auto_approve_criteria(self, actual: MonthlyActual) -> bool:
        from ..models import MonthlyPhasing
        target = MonthlyPhasing.objects.filter(
            annual_target__kpi=actual.kpi,
            annual_target__user=actual.user,
            annual_target__year=actual.year,
            month=actual.month
        ).first()
        if target:
            variance = abs(actual.actual_value - target.target_value) / target.target_value * 100
            if variance <= 5:
                return True
        return False