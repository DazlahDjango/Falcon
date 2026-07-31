from typing import Dict, Any
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor

class StructureDataExtractor(BaseDataExtractor):
    """
    Extracts organizational structure hierarchies, divisions, departments, sections,
    units, positions, and employee allocations.
    """

    def extract(self) -> Dict[str, Any]:
        from apps.structure.models import Division, Department, Section, Unit, Position, Employment
        
        divisions = Division.objects.filter(tenant_id=self.tenant_id, is_deleted=False)
        departments = Department.objects.filter(tenant_id=self.tenant_id, is_deleted=False)
        units = Unit.objects.filter(tenant_id=self.tenant_id, is_deleted=False)
        positions = Position.objects.filter(tenant_id=self.tenant_id, is_deleted=False)
        employments = Employment.objects.filter(tenant_id=self.tenant_id, is_active=True)

        return {
            'tenant_id': self.tenant_id,
            'divisions_count': divisions.count(),
            'departments_count': departments.count(),
            'units_count': units.count(),
            'positions_count': positions.count(),
            'active_employees_count': employments.count(),
            'data': {
                'departments': list(departments.values('id', 'name', 'code', 'division_id')),
                'units': list(units.values('id', 'name', 'code', 'section_id'))
            }
        }
