from typing import List, Optional, Dict, Any, Set
from uuid import UUID
from django.db import models
from ...models.department import Department
from ...models.team import Team
from ...models.employment import Employment
from ...models.position import Position

class SubtreeExtractor:
    @staticmethod
    def extract_department_subtree(root_department_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Department]:
        root = Department.objects.filter(
            id=root_department_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
        if not root:
            return []
        if not root.path:
            root.save()
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            path__startswith=root.path,
            is_deleted=False
        )
        if not include_inactive:
            departments = departments.filter(is_active=True)
        return list(departments.order_by('path'))
    
    @staticmethod
    def extract_team_subtree(root_team_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Team]:
        def get_descendants(team_id: UUID) -> List[Team]:
            descendants = []
            children = Team.objects.filter(
                parent_team_id=team_id,
                tenant_id=tenant_id,
                is_deleted=False
            )
            if not include_inactive:
                children = children.filter(is_active=True)
            for child in children:
                descendants.append(child)
                descendants.extend(get_descendants(child.id))
            return descendants
        root_team = Team.objects.filter(
            id=root_team_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
        if not root_team:
            return []
        subtree = [root_team]
        subtree.extend(get_descendants(root_team_id))
        return subtree
    
    @staticmethod
    def extract_team_hierarchy(team_id: UUID, tenant_id: UUID, include_members: bool = False) -> Dict[str, Any]:
        def build_team_node(team: Team) -> Dict[str, Any]:
            node = {
                'id': str(team.id),
                'name': team.name,
                'code': team.code,
                'description': team.description,
                'team_lead': str(team.team_lead) if team.team_lead else None,
                'is_active': team.is_active,
                'children': []
            }
            if include_members:
                node['members'] = SubtreeExtractor._get_team_members(team.id, tenant_id)
            children = Team.objects.filter(
                parent_team_id=team.id,
                tenant_id=tenant_id,
                is_deleted=False,
                is_active=True
            )
            for child in children:
                node['children'].append(build_team_node(child))
            return node
        root_team = Team.objects.filter(id=team_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root_team:
            return {}
        return build_team_node(root_team)
    
    @staticmethod
    def _get_team_members(team_id: UUID, tenant_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            team_id=team_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'position_code': emp.position.job_code if emp.position else None,
            'is_manager': emp.is_manager
        } for emp in employments]
    
    @staticmethod
    def extract_employees_in_subtree(root_department_id: UUID, tenant_id: UUID, include_indirect: bool = True) -> List[UUID]:
        departments = SubtreeExtractor.extract_department_subtree(root_department_id, tenant_id)
        department_ids = [dept.id for dept in departments]
        if include_indirect:
            employments = Employment.objects.filter(
                department_id__in=department_ids,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            )
        else:
            employments = Employment.objects.filter(
                department_id=root_department_id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            )
        return list(employments.values_list('user_id', flat=True).distinct())
    
    @staticmethod
    def get_subtree_statistics(root_department_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        departments = SubtreeExtractor.extract_department_subtree(root_department_id, tenant_id)
        department_ids = [dept.id for dept in departments]
        team_count = Team.objects.filter(
            department_id__in=department_ids,
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).count()
        employee_count = Employment.objects.filter(
            department_id__in=department_ids,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).count()
        position_count = Position.objects.filter(
            default_department_id__in=department_ids,
            tenant_id=tenant_id,
            is_deleted=False
        ).count()
        return {
            'department_count': len(departments),
            'team_count': team_count,
            'employee_count': employee_count,
            'position_count': position_count,
            'max_depth': max([dept.depth for dept in departments]) if departments else 0
        }