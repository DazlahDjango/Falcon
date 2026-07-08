from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.reporting_line import ReportingLine
from apps.structure.exceptions import HierarchyCycleError, SelfParentError

class CycleDetector:
    @staticmethod
    def would_create_cycle(parent_id: UUID, child_id: UUID, tenant_id: UUID) -> Tuple[bool, List[UUID]]:
        if parent_id == child_id:
            return True, [parent_id]
        path = []
        current_id = parent_id
        while current_id:
            if current_id == child_id:
                path.append(current_id)
                return True, path
            path.append(current_id)
            unit = OrganizationalUnit.objects.filter(
                id=current_id,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('parent').first()
            if not unit:
                break
            current_id = unit.parent_id if unit.parent_id else None
        return False, []
    
    @staticmethod
    def validate_assignment(parent_id: Optional[UUID], child_id: UUID, tenant_id: UUID) -> None:
        if parent_id is None:
            return
        if parent_id == child_id:
            raise SelfParentError()
        has_cycle, cycle_path = CycleDetector.would_create_cycle(parent_id, child_id, tenant_id)
        if has_cycle:
            raise HierarchyCycleError(cycle_path=cycle_path)
    
    @staticmethod
    def find_all_cycles(tenant_id: UUID) -> List[Tuple[UUID, List[UUID]]]:
        cycles = []
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('parent')
        for unit in units:
            if unit.parent_id:
                has_cycle, cycle_path = CycleDetector.would_create_cycle(
                    unit.parent_id, unit.id, tenant_id
                )
                if has_cycle:
                    cycles.append((unit.id, cycle_path))
        return cycles
    
    @staticmethod
    def repair_cycles(tenant_id: UUID) -> int:
        cycles = CycleDetector.find_all_cycles(tenant_id)
        repaired_count = 0
        for entity_id, cycle_path in cycles:
            OrganizationalUnit.objects.filter(id=entity_id, tenant_id=tenant_id).update(parent=None)
            repaired_count += 1
        return repaired_count
    
    @staticmethod
    def get_cycle_description(cycle_path: List[UUID]) -> str:
        if not cycle_path:
            return "No cycle detected."
        descriptions = []
        for i, entity_id in enumerate(cycle_path):
            unit = OrganizationalUnit.objects.filter(id=entity_id).first()
            name = unit.name if unit else str(entity_id)
            descriptions.append(f"{name} ({entity_id})")
            if i < len(cycle_path) - 1:
                descriptions.append("→")
        if cycle_path and cycle_path[0] == cycle_path[-1]:
            return f"Circular reference: " + " ".join(descriptions)
        return " → ".join(descriptions)
    
    @staticmethod
    def detect_reporting_cycle(employee_id: UUID, manager_id: UUID, tenant_id: UUID) -> bool:
        visited = set()
        current = employee_id
        while current:
            if str(current) in visited:
                return True
            visited.add(str(current))
            if str(current) == str(manager_id):
                return True
            try:
                reporting_line = ReportingLine.objects.filter(
                    employee_id=current,
                    tenant_id=tenant_id,
                    is_active=True,
                    is_deleted=False
                ).first()
                if not reporting_line:
                    break
                current = reporting_line.manager_id
            except ReportingLine.DoesNotExist:
                break
        return False
    
    @staticmethod
    def get_reporting_cycle_path(employee_id: UUID, manager_id: UUID, tenant_id: UUID) -> Optional[List[str]]:
        path = []
        current = employee_id
        while current:
            path.append(str(current))
            if str(current) == str(manager_id):
                path.append(str(manager_id))
                return path
            try:
                reporting_line = ReportingLine.objects.filter(
                    employee_id=current,
                    tenant_id=tenant_id,
                    is_active=True,
                    is_deleted=False
                ).first()
                if not reporting_line:
                    break
                current = reporting_line.manager_id
            except ReportingLine.DoesNotExist:
                break
        return None