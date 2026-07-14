import json
from uuid import UUID
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.employment import Employment
from apps.structure.services.hierarchy.tree_builder import TreeBuilder

class JSONExporterService:
    def __init__(self):
        self.tree_builder = TreeBuilder()
    
    def export_full_org(self, tenant_id: UUID, include_inactive: bool = False) -> str:
        tree = self.tree_builder.build_full_tree(tenant_id)
        org_data = {
            'tenant_id': str(tenant_id),
            'export_date': timezone.now().isoformat(),
            'organization': tree
        }
        return json.dumps(org_data, cls=DjangoJSONEncoder, indent=2)
    
    def export_org_units(self, tenant_id: UUID, include_inactive: bool = False) -> str:
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            units = units.filter(is_active=True)
        data = []
        for unit in units:
            data.append({
                'id': str(unit.id),
                'code': unit.code,
                'name': unit.name,
                'description': unit.description,
                'level': unit.level,
                'depth': unit.depth,
                'path': unit.path,
                'parent_id': str(unit.parent_id) if unit.parent_id else None,
                'headcount_limit': unit.headcount_limit,
                'is_active': unit.is_active,
                'created_at': unit.created_at.isoformat() if unit.created_at else None
            })
        return json.dumps(data, cls=DjangoJSONEncoder, indent=2)
    
    def export_divisions(self, tenant_id: UUID, include_inactive: bool = False) -> str:
        divisions = Division.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            divisions = divisions.filter(is_active=True)
        data = []
        for div in divisions:
            data.append({
                'id': str(div.id),
                'code': div.code,
                'name': div.name,
                'description': div.description,
                'depth': div.depth,
                'path': div.path,
                'headcount_limit': div.headcount_limit,
                'is_active': div.is_active
            })
        return json.dumps(data, cls=DjangoJSONEncoder, indent=2)
    
    def export_departments(self, tenant_id: UUID, include_inactive: bool = False) -> str:
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            departments = departments.filter(is_active=True)
        data = []
        for dept in departments.select_related('parent'):
            data.append({
                'id': str(dept.id),
                'code': dept.code,
                'name': dept.name,
                'description': dept.description,
                'parent_code': dept.parent.code if dept.parent else None,
                'depth': dept.depth,
                'path': dept.path,
                'headcount_limit': dept.headcount_limit,
                'sensitivity_level': dept.sensitivity_level,
                'is_active': dept.is_active
            })
        return json.dumps(data, cls=DjangoJSONEncoder, indent=2)
    
    def export_employments(self, tenant_id: UUID, current_only: bool = True) -> str:
        employments = Employment.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('position', 'position__division', 'position__department', 'position__section', 'position__unit')
        if current_only:
            employments = employments.filter(is_current=True, is_active=True)
        data = []
        for emp in employments:
            pos = emp.position
            data.append({
                'user_id': str(emp.user_id),
                'position': {
                    'id': str(pos.id) if pos else None,
                    'job_code': pos.job_code if pos else None,
                    'title': pos.title if pos else None
                },
                'division': str(pos.division_id) if pos and pos.division_id else None,
                'department': str(pos.department_id) if pos and pos.department_id else None,
                'section': str(pos.section_id) if pos and pos.section_id else None,
                'unit': str(pos.unit_id) if pos and pos.unit_id else None,
                'employment_type': emp.employment_type,
                'is_manager': emp.is_manager,
                'is_executive': emp.is_executive,
                'effective_from': emp.effective_from.isoformat() if emp.effective_from else None,
                'effective_to': emp.effective_to.isoformat() if emp.effective_to else None,
                'is_current': emp.is_current
            })
        return json.dumps(data, cls=DjangoJSONEncoder, indent=2)
    
    def export_reporting_chain(self, tenant_id: UUID) -> str:
        from apps.structure.services.reporting.chain_service import ChainService
        chain_service = ChainService()
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_active=True, is_deleted=False)
        data = {}
        for emp in employments:
            chain = chain_service.get_chain_of_command(str(emp.user_id), tenant_id)
            data[str(emp.user_id)] = chain
        return json.dumps(data, cls=DjangoJSONEncoder, indent=2)