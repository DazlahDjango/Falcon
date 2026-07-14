from typing import List, Dict, Any, Optional
from uuid import UUID
from django.db import models
from django.core.exceptions import ValidationError
from apps.structure.models.department import Department
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.employment import Employment
from apps.structure.models.employment import Employment
from apps.structure.constants import MAX_ORG_DEPTH, PARENT_LEVEL_MAP

class OrgValidatorService:
    @staticmethod
    def validate_org_unit_hierarchy(unit_id: UUID, parent_id: Optional[UUID], tenant_id: UUID) -> List[str]:
        errors = []
        if parent_id == unit_id:
            errors.append("Organizational unit cannot be its own parent.")
            return errors
        if parent_id:
            parent_unit = OrganizationalUnit.objects.filter(id=parent_id, tenant_id=tenant_id, is_deleted=False).first()
            if not parent_unit:
                errors.append(f"Parent unit {parent_id} not found.")
                return errors
            if parent_unit.tenant_id != tenant_id:
                errors.append("Parent unit must belong to same tenant.")
                return errors
            if parent_unit.depth >= MAX_ORG_DEPTH - 1:
                errors.append(f"Maximum hierarchy depth ({MAX_ORG_DEPTH}) exceeded.")
        return errors
    
    @staticmethod
    def validate_department_hierarchy(department_id: UUID, parent_id: Optional[UUID], tenant_id: UUID) -> List[str]:
        errors = []
        if parent_id == department_id:
            errors.append("Department cannot be its own parent.")
            return errors
        if parent_id:
            parent_dept = Department.objects.filter(id=parent_id, tenant_id=tenant_id, is_deleted=False).first()
            if not parent_dept:
                errors.append(f"Parent department {parent_id} not found.")
                return errors
            if parent_dept.tenant_id != tenant_id:
                errors.append("Parent department must belong to same tenant.")
                return errors
            if parent_dept.depth >= MAX_ORG_DEPTH - 1:
                errors.append(f"Maximum hierarchy depth ({MAX_ORG_DEPTH}) exceeded.")
        return errors
    
    @staticmethod
    def validate_position_occupancy(position_id: UUID, tenant_id: UUID) -> tuple:
        from apps.structure.models.position import Position
        position = Position.objects.filter(id=position_id, tenant_id=tenant_id, is_deleted=False).first()
        if not position:
            return False, "Position not found."
        if position.is_single_incumbent and position.current_incumbents_count > 0:
            return False, f"Position {position.job_code} is single-incumbent and already occupied."
        if position.max_incumbents and position.current_incumbents_count >= position.max_incumbents:
            return False, f"Position {position.job_code} has reached maximum incumbents ({position.max_incumbents})."
        return True, None
    
    @staticmethod
    def validate_reporting_relationship(employee_user_id: UUID, manager_user_id: UUID, tenant_id: UUID) -> List[str]:
        errors = []
        if employee_user_id == manager_user_id:
            errors.append("Employee cannot report to themselves.")
            return errors
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        manager_emp = Employment.objects.filter(
            user_id=manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp:
            errors.append(f"Employee {employee_user_id} not found or not active.")
        if not manager_emp:
            errors.append(f"Manager {manager_user_id} not found or not active.")
        if employee_emp and manager_emp:
            existing = Employment.objects.filter(
                employee=employee_emp,
                manager=manager_emp,
                is_active=True,
                tenant_id=tenant_id
            ).exists()
            if existing:
                errors.append("Reporting relationship already exists.")
        return errors
    
    @staticmethod
    def validate_org_integrity(tenant_id: UUID) -> Dict[str, Any]:
        issues = []
        units_without_parent = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).filter(models.Q(parent__isnull=True))
        if units_without_parent.count() == 0:
            issues.append("No root organizational unit found.")
        orphaned_units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            parent__is_deleted=True
        )
        for unit in orphaned_units:
            issues.append(f"Unit {unit.code} has deleted parent.")
        employments_without_user = Employment.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            user_id__isnull=True
        )
        for emp in employments_without_user:
            issues.append(f"Employment {emp.id} has no user.")
        multiple_current_employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False
        ).values('user_id').annotate(count=models.Count('id')).filter(count__gt=1)
        for item in multiple_current_employments:
            issues.append(f"User {item['user_id']} has {item['count']} current employments.")
        return {
            'is_valid': len(issues) == 0,
            'issues': issues,
            'issue_count': len(issues)
        }