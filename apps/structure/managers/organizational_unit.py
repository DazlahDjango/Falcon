from django.db import models
from .base import BaseStructureManager

class OrganizationalUnitManager(BaseStructureManager):
    def active(self):
        return self.filter(is_active=True, is_deleted=False)
    
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    
    def by_level(self, tenant_id, level):
        return self.filter(tenant_id=tenant_id, level=level, is_deleted=False, is_active=True)
    
    def root_nodes(self, tenant_id):
        return self.filter(tenant_id=tenant_id, parent__isnull=True, is_deleted=False, is_active=True)
    
    def with_cost_center(self, cost_center_id):
        return self.filter(cost_center_id=cost_center_id, is_deleted=False)
    
    def get_descendants(self, unit_id, include_self=False):
        from apps.structure.models.organizational_unit import OrganizationalUnit
        unit = self.get(id=unit_id)
        path_filter = models.Q(path__startswith=unit.path)
        if not include_self:
            path_filter &= ~models.Q(id=unit_id)
        return self.filter(path_filter, tenant_id=unit.tenant_id, is_deleted=False)
    
    def get_ancestors(self, unit_id):
        from apps.structure.models.organizational_unit import OrganizationalUnit
        unit = self.get(id=unit_id)
        ancestors = []
        current = unit
        while current.parent:
            ancestors.append(current.parent)
            current = current.parent
        return ancestors
    
    def get_hierarchy_tree(self, tenant_id, level=None):
        from apps.structure.models.organizational_unit import OrganizationalUnit
        units = self.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).select_related('parent')
        if level:
            units = units.filter(level=level)
        tree = []
        unit_map = {u.id: {'unit': u, 'children': []} for u in units}
        for unit in units:
            if unit.parent_id and unit.parent_id in unit_map:
                unit_map[unit.parent_id]['children'].append(unit_map[unit.id])
            else:
                tree.append(unit_map[unit.id])
        return tree
    
    def get_full_path(self, unit_id, separator=' / '):
        unit = self.get(id=unit_id)
        ancestors = self.get_ancestors(unit_id)
        path_parts = [u.name for u in reversed(ancestors)] + [unit.name]
        return separator.join(path_parts)
    
    def get_subtree(self, unit_id):
        unit = self.get(id=unit_id)
        return self.filter(tenant_id=unit.tenant_id, path__startswith=unit.path, is_deleted=False)