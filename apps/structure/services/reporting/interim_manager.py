from typing import Optional, Dict, Any
from uuid import UUID
from django.utils import timezone
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine
from ...exceptions import ReportingCycleExistsError

class InterimManagerService:
    @staticmethod
    def assign_interim_manager(employee_user_id: UUID, interim_manager_user_id: UUID, tenant_id: UUID, effective_from: Optional[timezone.datetime] = None, effective_to: Optional[timezone.datetime] = None, reason: str = '') -> ReportingLine:
        if effective_from is None:
            effective_from = timezone.now().date()
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        interim_emp = Employment.objects.filter(
            user_id=interim_manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp or not interim_emp:
            raise ValueError("Employee or interim manager not found")
        existing_interim = ReportingLine.objects.filter(
            employee_id=employee_emp.id,
            relation_type='interim',
            is_active=True,
            tenant_id=tenant_id
        ).first()
        if existing_interim:
            existing_interim.is_active = False
            existing_interim.effective_to = effective_from
            existing_interim.save()
        return ReportingLine.objects.create(
            employee_id=employee_emp.id,
            manager_id=interim_emp.id,
            relation_type='interim',
            reporting_weight=1.0,
            effective_from=effective_from,
            effective_to=effective_to,
            change_reason=reason,
            tenant_id=tenant_id
        )
    
    @staticmethod
    def end_interim_assignment(employee_user_id: UUID, tenant_id: UUID, end_date: Optional[timezone.datetime] = None, reason: str = '') -> bool:
        if end_date is None:
            end_date = timezone.now().date()
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp:
            return False
        interim_line = ReportingLine.objects.filter(
            employee_id=employee_emp.id,
            relation_type='interim',
            is_active=True,
            tenant_id=tenant_id
        ).first()
        if not interim_line:
            return False
        interim_line.is_active = False
        interim_line.effective_to = end_date
        interim_line.change_reason = reason
        interim_line.save()
        return True
    
    @staticmethod
    def get_active_interim_assignments(tenant_id: UUID) -> list:
        return list(ReportingLine.objects.filter(
            relation_type='interim',
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('employee', 'manager'))
    
    @staticmethod
    def is_under_interim(employee_user_id: UUID, tenant_id: UUID) -> bool:
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp:
            return False
        return ReportingLine.objects.filter(
            employee_id=employee_emp.id,
            relation_type='interim',
            is_active=True,
            tenant_id=tenant_id
        ).exists()