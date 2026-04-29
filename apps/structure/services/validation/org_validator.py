from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from django.db import models
from ...models.department import Department
from ...models.team import Team
from ...models.position import Position
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine

class OrgValidatorService:
    @staticmethod
    def validate_department_hierarchy(department_id: UUID, parent_id: Optional[UUID], tenant_id: UUID) -> List[str]:
        errors = []
        if parent_id == department_id:
            errors.append("Department cannot be its own parent.")
            return errors
        if parent_id:
            parent_dept = Department.objects.filter(id=parent_id, tenant_id=tenant_id).first()
            if not parent_dept:
                errors.append(f"Parent department {parent_id} not found.")
                return errors
            if parent_dept.tenant_id != tenant_id:
                errors.append("Parent department must belong to same tenant.")
                return errors
            if parent_dept.depth >= 20:
                errors.append("Maximum hierarchy depth (20) exceeded.")
        return errors
    
    @staticmethod
    def validate_team_hierarchy(team_id: UUID, department_id: UUID, parent_team_id: Optional[UUID], tenant_id: UUID) -> List[str]:
        errors = []
        department = Department.objects.filter(id=department_id, tenant_id=tenant_id).first()
        if not department:
            errors.append(f"Department {department_id} not found.")
            return errors
        if parent_team_id:
            parent_team = Team.objects.filter(id=parent_team_id, tenant_id=tenant_id).first()
            if not parent_team:
                errors.append(f"Parent team {parent_team_id} not found.")
                return errors
            if parent_team.department_id != department_id:
                errors.append("Parent team must belong to the same department.")
        return errors
    
    @staticmethod
    def validate_position_occupancy(position_id: UUID, tenant_id: UUID, requesting_user_id: Optional[UUID] = None) -> Tuple[bool, Optional[str]]:
        position = Position.objects.filter(id=position_id, tenant_id=tenant_id, is_deleted=False).first()
        if not position:
            return False, "Position not found."
        if position.is_single_incumbent and position.current_incumbents_count > 0:
            return False, f"Position {position.job_code} is single-incumbent and already occupied."
        if position.max_incumbents and position.current_incumbents_count >= position.max_incumbents:
            return False, f"Position {position.job_code} has reached maximum incumbents ({position.max_incumbents})."
        return True, None
    
    @staticmethod
    def validate_reporting_relationship(employee_user_id: UUID, manager_user_id: UUID, tenant_id: UUID, relation_type: str = 'solid') -> List[str]:
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
        if employee_emp and manager_emp and employee_emp.department_id != manager_emp.department_id and relation_type == 'solid':
            errors.append("Solid line reporting requires same department.")
        existing = ReportingLine.objects.filter(
            employee=employee_emp,
            manager=manager_emp,
            relation_type=relation_type,
            is_active=True,
            tenant_id=tenant_id
        ).exists() if employee_emp and manager_emp else False
        if existing:
            errors.append(f"Reporting relationship already exists as {relation_type}.")
        return errors
    
    @staticmethod
    def validate_org_integrity(tenant_id: UUID) -> Dict[str, Any]:
        issues = []
        departments_without_parent = Department.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).filter(models.Q(parent__isnull=True))
        if departments_without_parent.count() == 0:
            issues.append("No root department found.")
        orphaned_departments = Department.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            parent__is_deleted=True
        )
        for dept in orphaned_departments:
            issues.append(f"Department {dept.code} has deleted parent.")
        teams_without_department = Team.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            department__isnull=True
        )
        for team in teams_without_department:
            issues.append(f"Team {team.code} has no department.")
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