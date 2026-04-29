from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from ...models.department import Department
from ...models.team import Team
from ...models.employment import Employment

class HeadcountValidatorService:
    @staticmethod
    def validate_department_headcount(department_id: UUID, tenant_id: UUID, include_pending: bool = False) -> Tuple[bool, int, Optional[int]]:
        department = Department.objects.filter(id=department_id, tenant_id=tenant_id).first()
        if not department:
            return False, 0, None
        if not department.headcount_limit:
            return True, 0, None
        current_count = Employment.objects.filter(
            department_id=department_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).count()
        is_valid = current_count <= department.headcount_limit
        return is_valid, current_count, department.headcount_limit
    
    @staticmethod
    def validate_team_headcount(team_id: UUID, tenant_id: UUID, additional_members: int = 1) -> Tuple[bool, int, Optional[int]]:
        team = Team.objects.filter(id=team_id, tenant_id=tenant_id).first()
        if not team:
            return False, 0, None
        if not team.max_members:
            return True, 0, None
        current_count = Employment.objects.filter(
            team_id=team_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).count()
        projected_count = current_count + additional_members
        is_valid = projected_count <= team.max_members
        return is_valid, projected_count, team.max_members
    
    @staticmethod
    def get_organization_headcount(tenant_id: UUID, include_inactive: bool = False) -> int:
        queryset = Employment.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )
        if not include_inactive:
            queryset = queryset.filter(is_current=True, is_active=True)
        return queryset.count()
    
    @staticmethod
    def get_department_headcount_report(tenant_id: UUID) -> List[Dict[str, Any]]:
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )
        report = []
        for dept in departments:
            current_count = Employment.objects.filter(
                department_id=dept.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            report.append({
                'department_id': str(dept.id),
                'department_code': dept.code,
                'department_name': dept.name,
                'current_headcount': current_count,
                'headcount_limit': dept.headcount_limit,
                'utilization_percentage': round((current_count / dept.headcount_limit * 100), 2) if dept.headcount_limit else None,
                'is_over_limit': current_count > dept.headcount_limit if dept.headcount_limit else False
            })
        return sorted(report, key=lambda x: x['current_headcount'], reverse=True)