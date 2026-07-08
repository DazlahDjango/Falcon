from django.db import models
from .organizational_unit import OrganizationalUnitManager
from apps.structure.enums.org_level import OrgLevel

class DepartmentManager(OrganizationalUnitManager):
    def get_queryset(self):
        # Department model doesn't have a 'level' field
        # Use depth=1 to identify departments (Division=0, Department=1, Section=2, Unit=3)
        return super().get_queryset().filter(depth=1)
    
    def with_cost_center(self, cost_center_id):
        return self.filter(cost_center_id=cost_center_id, is_deleted=False)
    
    def by_sensitivity(self, tenant_id, sensitivity_level):
        return self.filter(tenant_id=tenant_id, sensitivity_level=sensitivity_level, is_deleted=False)
    
    def with_sections(self, department_id):
        from apps.structure.models.section import Section
        return Section.objects.filter(parent_id=department_id, is_deleted=False, is_active=True)
    
    def with_active_sections(self, department_id):
        from apps.structure.models.section import Section
        return Section.objects.filter(parent_id=department_id, is_deleted=False, is_active=True)
    
    def get_section_count(self, department_id):
        from apps.structure.models.section import Section
        return Section.objects.filter(parent_id=department_id, is_deleted=False, is_active=True).count()
    
    def get_employments(self, department_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(department_id=department_id, is_current=True, is_deleted=False, is_active=True)
    
    def get_descendants(self, department_id, include_self=False):
        department = self.get(id=department_id)
        path_filter = models.Q(path__startswith=department.path)
        if not include_self:
            path_filter &= ~models.Q(id=department_id)
        return self.filter(path_filter, tenant_id=department.tenant_id, is_deleted=False)
    
    def get_ancestors(self, department_id):
        department = self.get(id=department_id)
        ancestors = []
        current = department
        while current.parent:
            ancestors.append(current.parent)
            current = current.parent
        return ancestors
    
    def get_hierarchy_tree(self, tenant_id):
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