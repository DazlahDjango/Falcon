from typing import Optional, List, Dict, Any
from uuid import UUID
from django.db import transaction
from datetime import date
from django.utils import timezone
from apps.structure.models.employment import Employment
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.exceptions import InterimAssignmentError, EmploymentNotFoundError, InvalidDateRangeError

class InterimManagerService:
    def assign_interim_manager(self, employee_id: UUID, interim_manager_id: UUID, effective_from: date, effective_to: date, reason: str = '', approved_by: Optional[UUID] = None) -> InterimAssignment:
        with transaction.atomic():
            employee = Employment.objects.get(id=employee_id, is_deleted=False)
            interim_manager = Employment.objects.get(id=interim_manager_id, is_deleted=False)
            if employee.user_id == interim_manager.user_id:
                raise InterimAssignmentError("Employee cannot have themselves as interim manager.")
            if employee.tenant_id != interim_manager.tenant_id:
                raise InterimAssignmentError("Employee and interim manager must be in same tenant.")
            if effective_from > effective_to:
                raise InvalidDateRangeError(effective_from, effective_to)
            if effective_from < timezone.now().date():
                raise InterimAssignmentError("Effective from date cannot be in the past.")
            existing = InterimAssignment.objects.filter(employee=employee, is_active=True, is_deleted=False).first()
            if existing:
                existing.is_active = False
                existing.save()
            assignment = InterimAssignment.objects.create(
                tenant_id=employee.tenant_id,
                employee=employee,
                interim_manager=interim_manager,
                effective_from=effective_from,
                effective_to=effective_to,
                reason=reason,
                is_active=True,
                approved_by_id=approved_by,
                approved_at=timezone.now()
            )
            from apps.structure.services.reporting.chain_service import ChainService
            ChainService().clear_cache(employee.tenant_id, employee.user_id)
            return assignment
    
    def end_interim_assignment(self, employee_id: UUID, end_date: Optional[date] = None) -> InterimAssignment:
        with transaction.atomic():
            if not end_date:
                end_date = timezone.now().date()
            assignment = InterimAssignment.objects.filter(
                employee_id=employee_id,
                is_active=True,
                is_deleted=False
            ).first()
            if not assignment:
                raise InterimAssignmentError("No active interim assignment found for employee.")
            if end_date < assignment.effective_from:
                raise InvalidDateRangeError(assignment.effective_from, end_date)
            assignment.effective_to = end_date
            assignment.is_active = False
            assignment.save()
            from apps.structure.services.reporting.chain_service import ChainService
            ChainService().clear_cache(assignment.tenant_id, assignment.employee.user_id)
            return assignment
    
    def extend_interim_assignment(self, employee_id: UUID, new_end_date: date) -> InterimAssignment:
        with transaction.atomic():
            assignment = InterimAssignment.objects.filter(
                employee_id=employee_id,
                is_active=True,
                is_deleted=False
            ).first()
            if not assignment:
                raise InterimAssignmentError("No active interim assignment found for employee.")
            if new_end_date <= assignment.effective_to:
                raise InterimAssignmentError("New end date must be after current end date.")
            assignment.effective_to = new_end_date
            assignment.save()
            return assignment
    
    def get_current_interim(self, employee_id: UUID) -> Optional[InterimAssignment]:
        return InterimAssignment.objects.current_by_employee(employee_id).first()
    
    def get_active_interim_managers(self, tenant_id: UUID) -> List[InterimAssignment]:
        return list(InterimAssignment.objects.active().filter(tenant_id=tenant_id, is_deleted=False))
    
    def get_expiring_soon(self, tenant_id: UUID, days: int = 7) -> List[InterimAssignment]:
        return list(InterimAssignment.objects.expiring_soon(tenant_id, days))
    
    def get_expired(self, tenant_id: UUID) -> List[InterimAssignment]:
        return list(InterimAssignment.objects.expired(tenant_id))
    
    def bulk_assign_interim(self, employee_ids: List[UUID], interim_manager_id: UUID, effective_from: date, effective_to: date, reason: str = '', approved_by: Optional[UUID] = None) -> Dict[str, List]:
        results = []
        errors = []
        for employee_id in employee_ids:
            try:
                result = self.assign_interim_manager(
                    employee_id,
                    interim_manager_id,
                    effective_from,
                    effective_to,
                    reason,
                    approved_by
                )
                results.append(result)
            except Exception as e:
                errors.append({
                    'employee_id': employee_id,
                    'error': str(e)
                })
        return {'success': results, 'errors': errors}
    
    def validate_interim_period(self, effective_from: date, effective_to: date) -> bool:
        if effective_from > effective_to:
            raise InvalidDateRangeError(effective_from, effective_to)
        if effective_from < timezone.now().date():
            raise InterimAssignmentError("Effective from date cannot be in the past.")
        if (effective_to - effective_from).days < 1:
            raise InterimAssignmentError("Interim assignment must last at least one day.")
        return True
    
    def get_interim_history(self, employee_id: UUID) -> List[InterimAssignment]:
        return list(InterimAssignment.objects.filter(
            employee_id=employee_id,
            is_deleted=False
        ).order_by('-effective_from'))
    
    def get_employee_by_interim(self, interim_manager_id: UUID) -> List[Employment]:
        assignments = InterimAssignment.objects.current_by_interim_manager(interim_manager_id)
        return [a.employee for a in assignments]