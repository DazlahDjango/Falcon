# actual.py
import csv
import io
from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db.models import Q, F
from apps.accounts.models import User
from apps.kpi.models import MonthlyActual, ActualHistory, Evidence, ActualAdjustment, KPI
from ..constants import ValidationStatus
from ..validators import validate_month, validate_year, validate_non_negative_value
from ..exceptions import HistoricalDataError, EvidenceUploadError, PermissionDenied

CACHE_TTL = 300
CACHE_PREFIX = "kpi_actual"


class ActualEntry:
    def enter_actual(
        self,
        kpi_id: str,
        user_id: str,
        year: int,
        month: int,
        actual_value: Decimal,
        notes: str = "",
        evidence_file=None,
        user=None
    ) -> MonthlyActual:
        validate_year(year)
        validate_month(month)
        validate_non_negative_value(actual_value)

        if user and not self._user_belongs_to_tenant(user, kpi_id):
            raise PermissionDenied("User does not have access to this KPI")

        existing = MonthlyActual.objects.filter(
            tenant_id=user.tenant_id if user else None,
            kpi_id=kpi_id,
            user_id=user_id,
            year=year,
            month=month
        ).first()

        submitter = User.objects.filter(id=user_id).first()
        if not submitter:
            raise ValidationError(f"User {user_id} not found")

        with transaction.atomic():
            if existing:
                if existing.status == 'APPROVED':
                    raise HistoricalDataError("Cannot modify approved actual. Create adjustment instead.")

                old_value = existing.actual_value
                existing.actual_value = actual_value
                existing.notes = notes
                existing.status = 'PENDING'
                existing.updated_by = user
                existing.save()

                ActualHistory.objects.create(
                    tenant_id=existing.tenant_id,
                    actual=existing,
                    action='UPDATE',
                    old_value=old_value,
                    new_value=actual_value,
                    performed_by=submitter,
                    reason="Updated actual entry"
                )
                self._invalidate_caches(kpi_id, user_id, year, month)
                return existing
            else:
                kpi = KPI.objects.filter(id=kpi_id).first()
                if not kpi:
                    raise ValidationError(f"KPI {kpi_id} not found")

                actual = MonthlyActual.objects.create(
                    tenant_id=kpi.tenant_id,
                    kpi_id=kpi_id,
                    user_id=user_id,
                    year=year,
                    month=month,
                    actual_value=actual_value,
                    notes=notes,
                    submitted_by=submitter,
                    status='PENDING'
                )

                ActualHistory.objects.create(
                    tenant_id=actual.tenant_id,
                    actual=actual,
                    action='CREATE',
                    new_value=actual_value,
                    performed_by=submitter,
                    reason="Initial entry"
                )

                if evidence_file:
                    self._add_evidence(actual, evidence_file, submitter)

                self._invalidate_caches(kpi_id, user_id, year, month)
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

    def _user_belongs_to_tenant(self, user, kpi_id: str) -> bool:
        kpi = KPI.objects.filter(id=kpi_id).only('tenant_id').first()
        if not kpi:
            return False
        return user.tenant_id == kpi.tenant_id

    def _invalidate_caches(self, kpi_id: str, user_id: str, year: int, month: int) -> None:
        cache.delete(f"{CACHE_PREFIX}:actual_{kpi_id}_{user_id}_{year}_{month}")
        cache.delete_pattern(f"{CACHE_PREFIX}:user_actuals_{user_id}_{year}_*")


class ActualSubmitter:
    def submit_for_validation(self, actual_id: str, user) -> MonthlyActual:
        actual = MonthlyActual.objects.filter(
            id=actual_id,
            tenant_id=user.tenant_id
        ).first()

        if not actual:
            raise ValidationError("Actual entry not found")

        if actual.status != 'PENDING':
            raise ValidationError(f"Cannot submit entry with status: {actual.status}")

        if actual.submitted_by_id != user.id:
            raise PermissionDenied("Only the entry creator can submit for validation")

        actual.submitted_at = timezone.now()
        actual.save()

        self._invalidate_caches(actual.kpi_id, actual.user_id, actual.year, actual.month)
        return actual

    def submit_batch(self, actual_ids: List[str], user) -> Dict:
        actuals = MonthlyActual.objects.filter(
            id__in=actual_ids,
            tenant_id=user.tenant_id,
            status='PENDING',
            submitted_by_id=user.id
        )

        results = {'success': [], 'failed': []}

        with transaction.atomic():
            for actual in actuals:
                try:
                    actual.submitted_at = timezone.now()
                    actual.save()
                    results['success'].append(str(actual.id))
                    self._invalidate_caches(actual.kpi_id, actual.user_id, actual.year, actual.month)
                except Exception as e:
                    results['failed'].append({'id': str(actual.id), 'error': str(e)})

        return results

    def _invalidate_caches(self, kpi_id: str, user_id: str, year: int, month: int) -> None:
        cache.delete(f"{CACHE_PREFIX}:actual_{kpi_id}_{user_id}_{year}_{month}")


class ActualBatchUpload:
    def upload_from_csv(
        self,
        csv_content: str,
        tenant_id: str,
        user,
        dry_run: bool = False
    ) -> Dict:
        try:
            reader = csv.DictReader(io.StringIO(csv_content))
            if not reader.fieldnames:
                raise ValidationError("CSV has no headers")

            required_fields = ['kpi_id', 'user_id', 'year', 'month', 'actual_value']
            missing = [f for f in required_fields if f not in reader.fieldnames]
            if missing:
                raise ValidationError(f"Missing required columns: {', '.join(missing)}")
        except csv.Error as e:
            raise ValidationError(f"Invalid CSV format: {str(e)}")

        created = []
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                kpi = KPI.objects.filter(id=row['kpi_id'], tenant_id=tenant_id).first()
                if not kpi:
                    raise ValidationError(f"KPI {row['kpi_id']} not found")

                with transaction.atomic():
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
                    created.append(str(actual.id))
                    if dry_run:
                        transaction.set_rollback(True)
            except Exception as e:
                errors.append({'row': row_num, 'error': str(e)})

        return {'created': len(created), 'errors': errors, 'total': len(created) + len(errors)}

    def validate_batch_template(self, headers: List[str]) -> List[str]:
        required = ['kpi_id', 'user_id', 'year', 'month', 'actual_value']
        return [r for r in required if r not in headers]


class ActualEvidence:
    def attach_evidence(
        self,
        actual_id: str,
        file,
        description: str,
        user
    ) -> Evidence:
        actual = MonthlyActual.objects.filter(
            id=actual_id,
            tenant_id=user.tenant_id
        ).first()

        if not actual:
            raise ValidationError("Actual entry not found")

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

    def get_evidence(self, actual_id: str, user) -> List[Dict]:
        actual = MonthlyActual.objects.filter(
            id=actual_id,
            tenant_id=user.tenant_id
        ).first()

        if not actual:
            return []

        evidence = Evidence.objects.filter(actual=actual)

        return [
            {
                'id': str(e.id),
                'type': e.evidence_type,
                'url': e.file.url if e.file else e.url,
                'description': e.description,
                'uploaded_by': e.uploaded_by.email if e.uploaded_by else None,
                'uploaded_at': e.uploaded_at.isoformat()
            }
            for e in evidence
        ]


class ActualAdjustmentService:
    def request_adjustment(
        self,
        actual_id: str,
        new_value: Decimal,
        reason: str,
        user
    ) -> Dict:
        actual = MonthlyActual.objects.filter(
            id=actual_id,
            tenant_id=user.tenant_id
        ).select_related('kpi').first()

        if not actual:
            raise ValidationError("Actual entry not found")

        if actual.status != 'APPROVED':
            raise ValidationError("Only approved actuals can be adjusted")

        pending = ActualAdjustment.objects.filter(
            original_actual=actual,
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
        adjustment = ActualAdjustment.objects.filter(
            id=adjustment_id,
            tenant_id=approver.tenant_id
        ).select_related('original_actual__kpi').first()

        if not adjustment:
            raise ValidationError("Adjustment not found")

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

            self._invalidate_caches(
                adjustment.original_actual.kpi_id,
                adjustment.original_actual.user_id,
                adjustment.original_actual.year,
                adjustment.original_actual.month
            )
            return new_actual

    def _invalidate_caches(self, kpi_id: str, user_id: str, year: int, month: int) -> None:
        cache.delete(f"{CACHE_PREFIX}:actual_{kpi_id}_{user_id}_{year}_{month}")


class ActualTeamService:
    def get_team_actuals(
        self,
        manager_id: str,
        year: int,
        month: int
    ) -> List[Dict]:
        direct_reports = self._get_direct_reports(manager_id)
        if not direct_reports:
            return []

        actuals = MonthlyActual.objects.filter(
            user_id__in=direct_reports,
            year=year,
            month=month
        ).select_related('kpi', 'user')

        return [
            {
                'id': str(a.id),
                'kpi_name': a.kpi.name,
                'user_name': a.user.get_full_name(),
                'user_email': a.user.email,
                'actual_value': float(a.actual_value),
                'status': a.status,
                'submitted_at': a.submitted_at.isoformat() if a.submitted_at else None
            }
            for a in actuals
        ]

    def get_department_actuals(
        self,
        department_id: str,
        year: int,
        month: int,
        tenant_id: str
    ) -> List[Dict]:
        department_members = User.objects.filter(
            department_id=department_id,
            tenant_id=tenant_id,
            is_active=True
        ).values_list('id', flat=True)

        if not department_members:
            return []

        actuals = MonthlyActual.objects.filter(
            user_id__in=department_members,
            year=year,
            month=month
        ).select_related('kpi', 'user')

        return [
            {
                'id': str(a.id),
                'kpi_name': a.kpi.name,
                'user_name': a.user.get_full_name(),
                'user_email': a.user.email,
                'actual_value': float(a.actual_value),
                'status': a.status,
                'submitted_at': a.submitted_at.isoformat() if a.submitted_at else None
            }
            for a in actuals
        ]

    def get_team_submission_status(
        self,
        manager_id: str,
        year: int,
        month: int
    ) -> Dict:
        direct_reports = self._get_direct_reports(manager_id)
        if not direct_reports:
            return {'total_members': 0, 'submitted': 0, 'missing': 0, 'missing_users': []}

        users = User.objects.filter(id__in=direct_reports, is_active=True)
        submitted = MonthlyActual.objects.filter(
            user_id__in=direct_reports,
            year=year,
            month=month
        ).values_list('user_id', flat=True).distinct()

        missing_users = users.exclude(id__in=submitted)

        return {
            'total_members': users.count(),
            'submitted': submitted.count(),
            'missing': missing_users.count(),
            'missing_users': [
                {'id': str(u.id), 'name': u.get_full_name(), 'email': u.email}
                for u in missing_users
            ]
        }

    def _get_direct_reports(self, manager_id: str) -> List[str]:
        cache_key = f"{CACHE_PREFIX}:direct_reports:{manager_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            manager = User.objects.get(id=manager_id)
            reports = list(manager.get_direct_reports().values_list('id', flat=True))
            reports = [str(r) for r in reports]
            cache.set(cache_key, reports, CACHE_TTL)
            return reports
        except User.DoesNotExist:
            return []