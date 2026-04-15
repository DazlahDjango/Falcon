import csv
import io
from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.accounts.models import User
from apps.kpi.models import MonthlyActual, ActualHistory, Evidence, ActualAdjustment, KPI
from ..constants import ValidationStatus
from ..validators import validate_month, validate_year, validate_non_negative_value
from ..exceptions import HistoricalDataError, EvidenceUploadError


class ActualEntry:
    def enter_actual(self, kpi_id: str, user_id: str, year: int, month: int, actual_value: Decimal, notes: str = "", evidence_file=None) -> MonthlyActual:
        validate_year(year)
        validate_month(month)
        validate_non_negative_value(actual_value)
        existing = MonthlyActual.objects.filter(
            kpi_id=kpi_id,
            user_id=user_id,
            year=year,
            month=month
        ).first()
        user = User.objects.get(id=user_id)
        with transaction.atomic():
            if existing:
                if existing.status == 'APPROVED':
                    raise HistoricalDataError("Cannot modify approved actual. Create adjustment instead.")
                old_value = existing.actual_value
                existing.actual_value = actual_value
                existing.notes = notes
                existing.status = 'PENDING'
                existing.save()
                ActualHistory.objects.create(
                    tenant_id=existing.tenant_id,
                    actual=existing,
                    action='UPDATE',
                    old_value=old_value,
                    new_value=actual_value,
                    performed_by=user,
                    reason="Updated actual entry"
                )
                return existing
            else:
                actual = MonthlyActual.objects.create(
                    tenant_id=KPI.objects.get(id=kpi_id).tenant_id,
                    kpi_id=kpi_id,
                    user_id=user_id,
                    year=year,
                    month=month,
                    actual_value=actual_value,
                    notes=notes,
                    submitted_by=user,
                    status='PENDING'
                )
                ActualHistory.objects.create(
                    tenant_id=actual.tenant_id,
                    actual=actual,
                    action='CREATE',
                    new_value=actual_value,
                    performed_by=user,
                    reason="Initial entry"
                )
                if evidence_file:
                    self._add_evidence(actual, evidence_file, user)
                return actual
    def _add_evidence(self, actual: MonthlyActual, file, user) -> Evidence:
        try:
            return Evidence.objects.create(
                tenant_id=actual.tenant_id,
                actual=actual,
                evidence_type='DOCUMENT',
                file=file,
                description="Supporting evidence",
                uploaded_by=user
            )
        except Exception as e:
            raise EvidenceUploadError(f"Failed to upload evidence: {str(e)}")

class ActualSubmitter:
    def submit_for_validation(self, actual_id: str, user) -> MonthlyActual:
        actual = MonthlyActual.objects.get(id=actual_id)
        if actual.status != 'PENDING':
            raise ValidationError(f"Cannot submit entry with status: {actual.status}")
        if actual.submitted_by != user:
            raise ValidationError("Only the entry creator can submit for validation")
        actual.submitted_at = timezone.now()
        actual.save()
        return actual
    def submit_batch(self, actual_ids: List[str], user) -> Dict:
        results = {'success': [], 'failed': []}
        for actual_id in actual_ids:
            try:
                actual = self.submit_for_validation(actual_id, user)
                results['success'].append(actual_id)
            except Exception as e:
                results['failed'].append({'id': actual_id, 'error': str(e)})
        return results

class ActualBatchUpload:
    def upload_from_csv(self, csv_content: str, tenant_id: str, user) -> Dict:
        reader = csv.DictReader(io.StringIO(csv_content))
        created = []
        errors = []
        for row_num, row in enumerate(reader, start=2):
            try:
                actual = MonthlyActual.objects.create(
                    tenant_id=tenant_id,
                    kpi_id=row['kpi_id'],
                    user_id=row['user_id'],
                    year=int(row['year']),
                    month=int(row['month']),
                    actual_value=Decimal(row['actual_value']),
                    notes=row.get('notes', ''),
                    submitted_by=user,
                    status='PENDING'
                )
                created.append(actual.id)
            except Exception as e:
                errors.append({'row': row_num, 'error': str(e)})
        return {'created': len(created), 'errors': errors}
    def validate_batch_template(self, headers: List[str]) -> List[str]:
        required = ['kpi_id', 'user_id', 'year', 'month', 'actual_value']
        missing = [r for r in required if r not in headers]
        return missing

class ActualEvidence:
    def attach_evidence(self, actual_id: str, file, description: str, user) -> Evidence:
        actual = MonthlyActual.objects.get(id=actual_id)
        if actual.status == 'APPROVED':
            raise HistoricalDataError("Cannot add evidence to approved entry")
        return Evidence.objects.create(
            tenant_id=actual.tenant_id,
            actual=actual,
            evidence_type='DOCUMENT',
            file=file,
            description=description,
            uploaded_by=user
        )
    def get_evidence(self, actual_id: str) -> List[Dict]:
        evidence = Evidence.objects.filter(actual_id=actual_id)
        return [
            {
                'id': str(e.id),
                'type': e.evidence_type,
                'url': e.file.url if e.file else e.url,
                'description': e.description,
                'uploaded_by': e.uploaded_by.email if e.uploaded_by else None,
                'uploaded_at': e.uploaded_at
            }
            for e in evidence
        ]

class ActualAdjustmentService:
    def request_adjustment(self, actual_id: str, new_value: Decimal, reason: str, user) -> Dict:
        actual = MonthlyActual.objects.get(id=actual_id)
        if actual.status != 'APPROVED':
            raise ValidationError("Only approved actuals can be adjusted")
        pending = ActualAdjustment.objects.filter(
            original_actual_id=actual_id,
            status='PENDING'
        ).exists()
        if pending:
            raise ValidationError("Pending adjustment already exists")
        with transaction.atomic():
            adjustment = ActualAdjustment.objects.create(
                tenant_id=actual.tenant_id,
                original_actual=actual,
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
    def approve_adjustment(self, adjustment_id: str, approver) -> MonthlyActual:
        adjustment = ActualAdjustment.objects.get(id=adjustment_id)
        with transaction.atomic():
            adjustment.approve(approver)
            new_actual = MonthlyActual.objects.create(
                tenant_id=adjustment.tenant_id,
                kpi=adjustment.original_actual.kpi,
                user=adjustment.original_actual.user,
                year=adjustment.original_actual.year,
                month=adjustment.original_actual.month,
                actual_value=adjustment.adjusted_value,
                status='ADJUSTED',
                notes=f"Adjusted from {adjustment.original_actual.actual_value}. Reason: {adjustment.reason}",
                submitted_by=approver
            )
            ActualHistory.objects.create(
                tenant_id=adjustment.tenant_id,
                actual=adjustment.original_actual,
                action='ADJUST',
                old_value=adjustment.original_actual.actual_value,
                new_value=adjustment.adjusted_value,
                performed_by=approver,
                reason=adjustment.reason
            )
            return new_actual