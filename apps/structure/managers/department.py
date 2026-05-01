from django.db import models
from .base import BaseStructureManager

class DepartmentManager(BaseStructureManager):
    def active(self):
        return self.filter(is_active=True, is_deleted=False)
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    def root_nodes(self, tenant_id):
        return self.filter(tenant_id=tenant_id, parent__isnull=True, is_deleted=False, is_active=True)
    def with_cost_center(self, cost_center_id):
        return self.filter(cost_center_id=cost_center_id, is_deleted=False)
    def by_sensitivity(self, tenant_id, sensitivity_level):
        return self.filter(tenant_id=tenant_id, sensitivity_level=sensitivity_level, is_deleted=False)
    def get_descendants(self, department_id, include_self=False):
        from apps.structure.models.department import Department
        department = self.get(id=department_id)
        path_filter = models.Q(path__startswith=department.path)
        if not include_self:
            path_filter &= ~models.Q(id=department_id)
        return self.filter(path_filter, tenant_id=department.tenant_id, is_deleted=False)
    def get_ancestors(self, department_id):
        from apps.structure.models.department import Department
        department = self.get(id=department_id)
        ancestors = []
        current = department
        while current.parent:
            ancestors.append(current.parent)
            current = current.parent
        return ancestors
    def get_hierarchy_tree(self, tenant_id):
        from apps.structure.models.department import Department
        departments = self.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).select_related('parent')
        tree = []
        dept_map = {d.id: {'department': d, 'children': []} for d in departments}
        for dept in departments:
            if dept.parent_id and dept.parent_id in dept_map:
                dept_map[dept.parent_id]['children'].append(dept_map[dept.id])
            else:
                tree.append(dept_map[dept.id])
        return tree

    def get_full_path(self, department_id, separator=' / '):
        department = self.get(id=department_id)
        ancestors = self.get_ancestors(department_id)
        path_parts = [d.name for d in reversed(ancestors)] + [department.name]
        return separator.join(path_parts)