from typing import Dict, Any
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor
from apps.structure.models import Department, Position, Employment

class StructureDataExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        departments = Department.objects.filter(tenant_id=self.tenant_id, is_active=True)
        positions = Position.objects.filter(tenant_id=self.tenant_id, is_active=True)
        employments = Employment.objects.filter(tenant_id=self.tenant_id, is_active=True)
        dept_list = []
        for dept in departments:
            emp_count = employments.filter(department=dept).count()
            dept_list.append({
                'id': str(dept.id),
                'name': dept.name,
                'headcount': emp_count
            })
        return {
            'summary': {
                'total_departments': departments.count(),
                'total_positions': positions.count(),
                'total_active_employments': employments.count()
            },
            'departments': dept_list
        }
