import json
from typing import List, Dict, Optional
from django.db import transaction
from django.utils import timezone
from django.contrib.admin.models import LogEntry, CHANGE, ADDITION, DELETION
from django.contrib.contenttypes.models import ContentType
from apps.kpi.models import KPIHistory, ActualHistory, TargetHistory, CalculationLog, MonthlyActual
from ..exceptions import HistoricalDataError

class AuditLogger:
    def log_kpi_change(self, kpi, action: str, changes: Dict, user, reason: str = ""):
        KPIHistory.objects.create(
            tenant_id=kpi.tenant_id,
            kpi=kpi,
            action=action,
            snapshot=self._serialize_kpi(kpi),
            changes=changes,
            performed_by=user,
            reason=reason
        )
        self._log_to_admin_log(kpi, action, changes, user)
    def log_actual_change(self, actual, action: str, old_value, new_value, user, reason: str = ""):
        ActualHistory.objects.create(
            tenant_id=actual.tenant_id,
            actual=actual,
            action=action,
            old_value=old_value,
            new_value=new_value,
            performed_by=user,
            reason=reason
        )
    def log_target_change(self, target, action: str, old_value, new_value, user, reason: str = ""):
        TargetHistory.objects.create(
            tenant_id=target.tenant_id,
            annual_target=target,
            action=action,
            old_value=old_value,
            new_value=new_value,
            performed_by=user,
            reason=reason
        )
    def log_calculation(self, calc_type: str, status: str, duration_ms: int,  records_affected: int, user: str = "system", error: str = None):
        CalculationLog.objects.create(
            calclulation_type=calc_type,
            status=status,
            duration_ms=duration_ms,
            records_affected=records_affected,
            triggered_by=user,
            error_message=error
        )
    def _serialize_kpi(self, kpi) -> Dict:
        return {
            'id': str(kpi.id),
            'name': kpi.name,
            'code': kpi.code,
            'description': kpi.description,
            'kpi_type': kpi.kpi_type,
            'calculation_logic': kpi.calculation_logic,
            'measure_type': kpi.measure_type,
            'is_active': kpi.is_active,
        }
    def _log_to_admin_log(self, obj, action: str, user, changes: Dict):
        content_type = ContentType.objects.get_for_model(obj)
        LogEntry.objects.create(
            user_id=user.id,
            content_type_id=content_type.id,
            object_id=str(obj.id),
            object_repr=str(obj),
            action_flag=ADDITION if action == 'CREATE' else CHANGE,
            change_message=json.dumps(changes)
        )

class AuditReporter:
    def get_kpi_audit_trail(self, kpi_id: str, limit: int = 100) -> List[Dict]:
        history = KPIHistory.objects.filter(kpi_id=kpi_id).order_by('-performed_at')[:limit]
        return [
            {
                'action': h.action,
                'changes': h.changes,
                'performed_by': h.performed_by.email if h.performed_by else 'system',
                'performed_at': h.performed_at.isoformat(),
                'reason': h.reason
            }
            for h in history
        ]
    def get_user_audit_trail(self, user_id: str, start_date=None, end_date=None) -> List[Dict]:
        kpi_history = KPIHistory.objects.filter(performed_by_id=user_id)
        actual_history = ActualHistory.objects.filter(performed_by_id=user_id)
        target_history = TargetHistory.objects.filter(performed_by_id=user_id)
        audit_entries = []
        for h in kpi_history:
            audit_entries.append({
                'type': 'KPI',
                'action': h.action,
                'details': h.changes,
                'timestamp': h.performed_at.isoformat()
            })
        for h in actual_history:
            audit_entries.append({
                'type': 'ACTUAL',
                'action': h.action,
                'details': f"Changed from {h.old_value} to {h.new_value}",
                'timestamp': h.performed_at.isoformat()
            })
        for h in target_history:
            audit_entries.append({
                'type': 'TARGET',
                'action': h.action,
                'details': f"Changed from {h.old_value} to {h.new_value}",
                'timestamp': h.performed_at.isoformat()
            })
        if start_date:
            audit_entries = [e for e in audit_entries if e['timestamp'] >= start_date.isoformat()]
        if end_date:
            audit_entries = [e for e in audit_entries if e['timestamp'] <= end_date.isoformat()]
        audit_entries.sort(key=lambda x: x['timestamp'], reverse=True)
        return audit_entries
    def get_period_audit_summary(self, tenant_id: str, year: int, month: int) -> Dict:
        kpi_changes = KPIHistory.objects.filter(
            tenant_id=tenant_id,
            performed_at__year=year,
            performed_at__month=month
        ).count()
        actual_changes = ActualHistory.objects.filter(
            tenant_id=tenant_id,
            performed_at__year=year,
            performed_at__month=month
        ).count()
        calculations = CalculationLog.objects.filter(
            tenant_id=tenant_id,
            triggered_at__year=year,
            triggered_at__month=month
        )
        calculation_success = calculations.filter(status='SUCCESS').count()
        calculation_failed = calculations.filter(status='FAILED').count()
        return {
            'period': f"{year}-{month:02d}",
            'kpi_changes': kpi_changes,
            'actual_changes': actual_changes,
            'calculations': {
                'total': calculations.count(),
                'success': calculation_success,
                'failed': calculation_failed
            }
        }
    
class ComplianceChecker:
    def check_validation_compliance(self, tenant_id: str, year: int, month: int) -> Dict:
        total_entries = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).count()
        validated = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            status='APPROVED'
        ).count()
        compliance_rate = (validated / total_entries * 100) if total_entries > 0 else 0
        cutoff = timezone.now() - timezone.timedelta(days=7)
        stale = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            status='PENDING',
            submitted_at__lte=cutoff
        ).count()
        return {
            'total_entries': total_entries,
            'validated': validated,
            'compliance_rate': round(compliance_rate, 2),
            'stale_entries': stale,
            'status': 'COMPLIANT' if compliance_rate >= 90 else 'AT_RISK' if compliance_rate >= 70 else 'NON_COMPLIANT'
        }
    def check_data_quality(self, tenant_id: str, year: int, month: int) -> Dict:
        from apps.accounts.models import User
        users = User.objects.filter(tenant_id=tenant_id, is_active=True)
        submitted = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values('user_id').distinct().count()
        missing_rate = ((users.count() - submitted) / users.count() * 100) if users.count() > 0 else 0
        rejected = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            status='REJECTED'
        ).count()
        total = MonthlyActual.objects.filter(tenant_id=tenant_id, year=year, month=month).count()
        rejection_rate = (rejected / total * 100) if total > 0 else 0
        return {
            'submission_rate': round(100 - missing_rate, 2),
            'rejection_rate': round(rejection_rate, 2),
            'data_quality_score': round(100 - missing_rate - (rejection_rate * 0.5), 2),
            'status': 'GOOD' if (100 - missing_rate) >= 90 else 'FAIR' if (100 - missing_rate) >= 70 else 'POOR'
        }
    def check_timeliness(self, tenant_id: str, year: int, month: int) -> Dict:
        deadline_day = 5
        submitted_after = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            submitted_at__day__gt=deadline_day
        ).count()
        total = MonthlyActual.objects.filter(tenant_id=tenant_id, year=year, month=month).count()
        late_rate = (submitted_after / total * 100) if total > 0 else 0
        from ..models import ValidationRecord
        validations = ValidationRecord.objects.filter(
            tenant_id=tenant_id,
            validated_at__year=year,
            validated_at__month=month
        )
        avg_validation_time = 0
        for v in validations:
            if v.actual and v.actual.submitted_at:
                delta = v.validated_at - v.actual.submitted_at
                avg_validation_time += delta.total_seconds() / 3600  # hours
        avg_validation_time = avg_validation_time / validations.count() if validations.count() > 0 else 0
        return {
            'late_submission_rate': round(late_rate, 2),
            'avg_validation_hours': round(avg_validation_time, 2),
            'timeliness_score': round(100 - late_rate - (avg_validation_time / 24 * 10), 2),
            'status': 'GOOD' if late_rate < 20 else 'FAIR' if late_rate < 50 else 'POOR'
        }
