from .organizational_unit import OrganizationalUnitManager
from apps.structure.enums.org_level import OrgLevel

class SectionManager(OrganizationalUnitManager):
    def get_queryset(self):
        return super().get_queryset().filter(level=OrgLevel.SECTION)
    
    def with_units(self, section_id):
        from apps.structure.models.unit import Unit
        return Unit.objects.filter(parent_id=section_id, is_deleted=False, is_active=True)
    
    def with_active_units(self, section_id):
        from apps.structure.models.unit import Unit
        return Unit.objects.filter(parent_id=section_id, is_deleted=False, is_active=True)
    
    def get_unit_count(self, section_id):
        from apps.structure.models.unit import Unit
        return Unit.objects.filter(parent_id=section_id, is_deleted=False, is_active=True).count()
    
    def get_employments(self, section_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(section_id=section_id, is_current=True, is_deleted=False, is_active=True)