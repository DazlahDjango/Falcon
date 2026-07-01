from .organizational_unit import OrganizationalUnitManager
from apps.structure.enums.org_level import OrgLevel

class UnitManager(OrganizationalUnitManager):
    def get_queryset(self):
        return super().get_queryset().filter(level=OrgLevel.UNIT)
    
    def with_employments(self, unit_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(unit_id=unit_id, is_deleted=False, is_active=True, is_current=True)
    
    def with_active_employments(self, unit_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(unit_id=unit_id, is_deleted=False, is_active=True, is_current=True)
    
    def get_headcount(self, unit_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(unit_id=unit_id, is_deleted=False, is_active=True, is_current=True).count()
    
    def get_employments(self, unit_id):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(unit_id=unit_id, is_current=True, is_deleted=False, is_active=True)
    
    def by_headcount_range(self, tenant_id, min_count, max_count):
        from django.db import models
        from apps.structure.models.employment import Employment
        unit_ids = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).values('unit_id').annotate(count=models.Count('id')).filter(
            count__gte=min_count,
            count__lte=max_count
        ).values_list('unit_id', flat=True)
        return self.filter(id__in=unit_ids, tenant_id=tenant_id, is_deleted=False)