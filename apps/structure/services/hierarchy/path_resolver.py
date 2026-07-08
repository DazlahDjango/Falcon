from typing import List, Optional, Dict, Any
from uuid import UUID
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.enums.org_level import OrgLevel
from apps.structure.constants import LEVEL_ORDER

class PathResolver:
    def resolve_path(self, path: str, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        parts = path.split('/')
        if not parts:
            return None
        current_node = None
        for idx, code in enumerate(parts):
            if idx == 0:
                current_node = self._get_node_by_code(OrgLevel.DIVISION, code, tenant_id)
            elif idx == 1:
                current_node = self._get_child_by_code(current_node, OrgLevel.DEPARTMENT, code) if current_node else None
            elif idx == 2:
                current_node = self._get_child_by_code(current_node, OrgLevel.SECTION, code) if current_node else None
            elif idx == 3:
                current_node = self._get_child_by_code(current_node, OrgLevel.UNIT, code) if current_node else None
            if not current_node:
                return None
        return {
            'node': current_node,
            'level': current_node.level,
            'depth': len(parts) - 1,
            'path': path
        }
    
    def _get_node_by_code(self, level: str, code: str, tenant_id: UUID) -> Optional[OrganizationalUnit]:
        model_map = {
            OrgLevel.DIVISION: Division,
            OrgLevel.DEPARTMENT: Department,
            OrgLevel.SECTION: Section,
            OrgLevel.UNIT: Unit
        }
        model = model_map.get(level)
        if not model:
            return None
        try:
            return model.objects.get(tenant_id=tenant_id, code=code, is_deleted=False)
        except model.DoesNotExist:
            return None
    
    def _get_child_by_code(self, parent: OrganizationalUnit, child_level: str, code: str) -> Optional[OrganizationalUnit]:
        model_map = {
            OrgLevel.DEPARTMENT: Department,
            OrgLevel.SECTION: Section,
            OrgLevel.UNIT: Unit
        }
        model = model_map.get(child_level)
        if not model or not parent:
            return None
        try:
            return model.objects.get(parent=parent, code=code, is_deleted=False)
        except model.DoesNotExist:
            return None
    
    def get_ancestors(self, node: OrganizationalUnit) -> List[OrganizationalUnit]:
        ancestors = []
        current = node
        while current.parent:
            ancestors.append(current.parent)
            current = current.parent
        return list(reversed(ancestors))
    
    def get_full_path_parts(self, node: OrganizationalUnit) -> List[str]:
        ancestors = self.get_ancestors(node)
        return [a.code for a in ancestors] + [node.code]
    
    def get_full_path(self, node: OrganizationalUnit, separator: str = ' / ') -> str:
        ancestors = self.get_ancestors(node)
        names = [a.name for a in ancestors] + [node.name]
        return separator.join(names)
    
    def get_ancestor_at_level(self, node: OrganizationalUnit, target_level: str) -> Optional[OrganizationalUnit]:
        current = node
        while current:
            if current.level == target_level:
                return current
            current = current.parent
        return None
    
    def get_common_ancestor(self, node1: OrganizationalUnit, node2: OrganizationalUnit) -> Optional[OrganizationalUnit]:
        ancestors1 = self.get_ancestors(node1) + [node1]
        ancestors2 = self.get_ancestors(node2) + [node2]
        ancestors1_ids = {str(a.id): a for a in ancestors1}
        for ancestor in reversed(ancestors2):
            if str(ancestor.id) in ancestors1_ids:
                return ancestor
        return None
    
    def get_level_from_depth(self, depth: int) -> Optional[str]:
        level_map = {
            0: OrgLevel.DIVISION,
            1: OrgLevel.DEPARTMENT,
            2: OrgLevel.SECTION,
            3: OrgLevel.UNIT
        }
        return level_map.get(depth)
    
    def get_depth_from_level(self, level: str) -> int:
        depth_map = {
            OrgLevel.DIVISION: 0,
            OrgLevel.DEPARTMENT: 1,
            OrgLevel.SECTION: 2,
            OrgLevel.UNIT: 3
        }
        return depth_map.get(level, -1)
    
    def is_descendant_of(self, descendant_id: UUID, ancestor_id: UUID, tenant_id: UUID) -> bool:
        try:
            descendant = OrganizationalUnit.objects.get(id=descendant_id, tenant_id=tenant_id, is_deleted=False)
            ancestor = OrganizationalUnit.objects.get(id=ancestor_id, tenant_id=tenant_id, is_deleted=False)
            return descendant.path.startswith(ancestor.path) and descendant.id != ancestor.id
        except OrganizationalUnit.DoesNotExist:
            return False