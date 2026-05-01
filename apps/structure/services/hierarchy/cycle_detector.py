from typing import List, Optional, Tuple
from uuid import UUID
from ...models.department import Department
from ...models.team import Team
from ...exceptions import HierarchyCycleError, SelfParentError

class CycleDetector:
    @staticmethod
    def would_create_cycle(parent_id: UUID, child_id: UUID, tenant_id: UUID, model: str = 'department') -> Tuple[bool, List[UUID]]:
        if parent_id == child_id:
            return True, [parent_id]
        if model == 'department':
            path: List[UUID] = []
            current_id = parent_id
            while current_id:
                if current_id == child_id:
                    path.append(current_id)
                    return True, path
                path.append(current_id)
                department = Department.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent').first()
                if not department:
                    break
                current_id = department.parent_id if department.parent_id else None
        elif model == 'team':
            path = []
            current_id = parent_id
            while current_id:
                if current_id == child_id:
                    path.append(current_id)
                    return True, path
                path.append(current_id)
                team = Team.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent_team').first()
                if not team:
                    break
                current_id = team.parent_team_id if team.parent_team_id else None
        return False, []
    
    @staticmethod
    def validate_assignment(parent_id: Optional[UUID], child_id: UUID, tenant_id: UUID, model: str = 'department') -> None:
        if parent_id is None:
            return
        if parent_id == child_id:
            raise SelfParentError()
        has_cycle, cycle_path = CycleDetector.would_create_cycle(parent_id, child_id, tenant_id, model)
        if has_cycle:
            raise HierarchyCycleError(cycle_path=cycle_path)
    
    @staticmethod
    def find_all_cycles(tenant_id: UUID, model: str = 'department') -> List[Tuple[UUID, List[UUID]]]:
        cycles = []
        if model == 'department':
            departments = Department.objects.filter(
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent')
            for dept in departments:
                if dept.parent_id:
                    has_cycle, cycle_path = CycleDetector.would_create_cycle(
                        dept.parent_id, dept.id, tenant_id, model
                    )
                    if has_cycle:
                        cycles.append((dept.id, cycle_path))
        elif model == 'team':
            teams = Team.objects.filter(
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent_team')
            for team in teams:
                if team.parent_team_id:
                    has_cycle, cycle_path = CycleDetector.would_create_cycle(
                        team.parent_team_id, team.id, tenant_id, model
                    )
                    if has_cycle:
                        cycles.append((team.id, cycle_path))
        return cycles
    
    @staticmethod
    def repair_cycles(tenant_id: UUID, model: str = 'department') -> int:
        cycles = CycleDetector.find_all_cycles(tenant_id, model)
        repaired_count = 0
        for entity_id, cycle_path in cycles:
            if model == 'department':
                Department.objects.filter(id=entity_id, tenant_id=tenant_id).update(parent=None)
                repaired_count += 1
            elif model == 'team':
                Team.objects.filter(id=entity_id, tenant_id=tenant_id).update(parent_team=None)
                repaired_count += 1
        return repaired_count
    
    @staticmethod
    def get_cycle_description(cycle_path: List[UUID], model: str = 'department') -> str:
        if not cycle_path:
            return "No cycle detected."
        descriptions = []
        for i, entity_id in enumerate(cycle_path):
            if model == 'department':
                entity = Department.objects.filter(id=entity_id).first()
                name = entity.name if entity else str(entity_id)
                descriptions.append(f"{name} ({entity_id})")
            elif model == 'team':
                entity = Team.objects.filter(id=entity_id).first()
                name = entity.name if entity else str(entity_id)
                descriptions.append(f"{name} ({entity_id})")
            if i < len(cycle_path) - 1:
                descriptions.append("→")
        if cycle_path and cycle_path[0] == cycle_path[-1]:
            return f"Circular reference: " + " ".join(descriptions)
        return " → ".join(descriptions)