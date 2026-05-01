from typing import List, Optional, Dict, Any
from uuid import UUID
from ...models.department import Department
from ...models.team import Team

class LCAByIdFinder:
    @staticmethod
    def find_department_lca(dept_a_id: UUID, dept_b_id: UUID, tenant_id: UUID) -> Optional[Department]:
        ancestors_a: List[UUID] = []
        current_id = dept_a_id
        while current_id:
            ancestors_a.append(current_id)
            department = Department.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent').first()
            if not department or not department.parent_id:
                break
            current_id = department.parent_id
        current_id = dept_b_id
        while current_id:
            if current_id in ancestors_a:
                return Department.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
            department = Department.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent').first()
            if not department or not department.parent_id:
                break
            current_id = department.parent_id
        return None
    
    @staticmethod
    def find_team_lca(team_a_id: UUID, team_b_id: UUID, tenant_id: UUID) -> Optional[Team]:
        def get_ancestor_ids(team_id: UUID) -> List[UUID]:
            ancestors = []
            current_id = team_id
            while current_id:
                ancestors.append(current_id)
                team = Team.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent_team').first()
                if not team or not team.parent_team_id:
                    break
                current_id = team.parent_team_id
            return ancestors
        ancestors_a = get_ancestor_ids(team_a_id)
        ancestors_b = get_ancestor_ids(team_b_id)
        for ancestor in ancestors_a:
            if ancestor in ancestors_b:
                return Team.objects.filter(
                    id=ancestor,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
        return None


class LCAByPathFinder:
    @staticmethod
    def find_department_lca_by_path(dept_a_id: UUID, dept_b_id: UUID, tenant_id: UUID, separator: str = '/') -> Optional[Department]:
        dept_a = Department.objects.filter(
            id=dept_a_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
        dept_b = Department.objects.filter(
            id=dept_b_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
        if not dept_a or not dept_b:
            return None
        if not dept_a.path or not dept_b.path:
            dept_a.save()
            dept_b.save()
        path_a_parts = dept_a.path.split(separator) if dept_a.path else []
        path_b_parts = dept_b.path.split(separator) if dept_b.path else []
        common_parts = []
        for i in range(min(len(path_a_parts), len(path_b_parts))):
            if path_a_parts[i] == path_b_parts[i]:
                common_parts.append(path_a_parts[i])
            else:
                break
        if not common_parts:
            return None
        common_path = separator.join(common_parts)
        return Department.objects.filter(
            path=common_path,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
    
    @staticmethod
    def calculate_lca_distance(dept_a_id: UUID, dept_b_id: UUID, tenant_id: UUID) -> int:
        lca = LCAByIdFinder.find_department_lca(dept_a_id, dept_b_id, tenant_id)
        if not lca:
            return -1
        dept_a = Department.objects.filter(id=dept_a_id, tenant_id=tenant_id).first()
        dept_b = Department.objects.filter(id=dept_b_id, tenant_id=tenant_id).first()
        if not dept_a or not dept_b:
            return -1
        distance = (dept_a.depth - lca.depth) + (dept_b.depth - lca.depth)
        return distance