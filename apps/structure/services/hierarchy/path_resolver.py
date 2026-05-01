from typing import List, Optional, Tuple
from uuid import UUID
from ...models.department import Department
from ...models.team import Team

class PathResolver:
    @staticmethod
    def resolve_department_path(department_id: UUID, tenant_id: UUID, separator: str = ' / ') -> str:
        path_parts = []
        current_id = department_id
        while current_id:
            department = Department.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent').first()
            if not department:
                break
            path_parts.insert(0, department.name)
            current_id = department.parent_id if department.parent_id else None
        
        return separator.join(path_parts)
    
    @staticmethod
    def resolve_team_path(team_id: UUID, tenant_id: UUID, include_department: bool = True, separator: str = ' / ') -> str:
        path_parts = []
        current_id = team_id
        while current_id:
            team = Team.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent_team', 'department').first()
            if not team:
                break
            path_parts.insert(0, team.name)
            current_id = team.parent_team_id if team.parent_team_id else None
        if include_department and team:
            path_parts.insert(0, team.department.name)
        return separator.join(path_parts)
    
    @staticmethod
    def get_department_ancestors(department_id: UUID, tenant_id: UUID, include_self: bool = False) -> List[Department]:
        ancestors = []
        current_id = department_id
        while current_id:
            department = Department.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).first()
            if not department:
                break
            if include_self or current_id != department_id:
                ancestors.append(department)
            current_id = department.parent_id if department.parent_id else None
        return ancestors
    
    @staticmethod
    def get_team_ancestors(team_id: UUID, tenant_id: UUID, include_self: bool = False) -> List[Team]:
        ancestors = []
        current_id = team_id
        while current_id:
            team = Team.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent_team').first()
            if not team:
                break
            if include_self or current_id != team_id:
                ancestors.append(team)
            current_id = team.parent_team_id if team.parent_team_id else None
        return ancestors
    
    @staticmethod
    def path_to_ids(path: str, separator: str = '/') -> List[str]:
        return [p for p in path.split(separator) if p]
    
    @staticmethod
    def is_descendant_of(descendant_id: UUID, ancestor_id: UUID, tenant_id: UUID, model: str = 'department') -> bool:
        if model == 'department':
            descendant = Department.objects.filter(id=descendant_id, tenant_id=tenant_id).first()
            if not descendant or not descendant.path:
                return False
            ancestor = Department.objects.filter(id=ancestor_id, tenant_id=tenant_id).first()
            if not ancestor or not ancestor.path:
                return False
            return descendant.path.startswith(ancestor.path) and descendant.id != ancestor.id
        elif model == 'team':
            ancestors = PathResolver.get_team_ancestors(descendant_id, tenant_id, include_self=False)
            return any(a.id == ancestor_id for a in ancestors)
        return False
    
    @staticmethod
    def find_common_ancestor(dept_a_id: UUID, dept_b_id: UUID, tenant_id: UUID) -> Optional[Department]:
        ancestors_a = set()
        current_id = dept_a_id
        while current_id:
            department = Department.objects.filter(id=current_id, tenant_id=tenant_id).first()
            if not department:
                break
            ancestors_a.add(current_id)
            current_id = department.parent_id if department.parent_id else None
        current_id = dept_b_id
        while current_id:
            if current_id in ancestors_a:
                return Department.objects.filter(id=current_id, tenant_id=tenant_id).first()
            department = Department.objects.filter(id=current_id, tenant_id=tenant_id).first()
            if not department:
                break
            current_id = department.parent_id if department.parent_id else None
        return None