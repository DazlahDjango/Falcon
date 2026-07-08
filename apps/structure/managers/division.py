from .organizational_unit import OrganizationalUnitManager
from apps.structure.enums.org_level import OrgLevel

class DivisionManager(OrganizationalUnitManager):
    def get_queryset(self):
        return super().get_queryset().filter(level=OrgLevel.DIVISION)
    
    def with_departments(self, division_id):
        from apps.structure.models.department import Department
        return Department.objects.filter(parent_id=division_id, is_deleted=False, is_active=True)
    
    def with_active_departments(self, division_id):
        from apps.structure.models.department import Department
        return Department.objects.filter(parent_id=division_id, is_deleted=False, is_active=True)
    
    def get_department_count(self, division_id):
        from apps.structure.models.department import Department
        return Department.objects.filter(parent_id=division_id, is_deleted=False, is_active=True).count()
    
    def get_employments(self, division_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(division_id=division_id, is_current=True, is_deleted=False, is_active=True)