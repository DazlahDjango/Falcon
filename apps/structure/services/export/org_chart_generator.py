from typing import List, Dict, Any, Optional
from uuid import UUID
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.employment import Employment
from apps.structure.services.hierarchy.tree_builder import TreeBuilder

class OrgChartGeneratorService:
    def __init__(self):
        self._max_depth = 4
        self.tree_builder = TreeBuilder()
    
    def generate_json_org_chart(self, tenant_id: UUID, root_unit_id: Optional[UUID] = None, max_depth: int = 4) -> Dict[str, Any]:
        self._max_depth = max_depth
        if root_unit_id:
            root_unit = OrganizationalUnit.objects.filter(id=root_unit_id, tenant_id=tenant_id, is_deleted=False).first()
            if not root_unit:
                return {}
            return self._build_org_chart_node(root_unit, 0)
        full_tree = self.tree_builder.build_full_tree(tenant_id)
        org_chart = {
            'tenant_id': str(tenant_id),
            'name': 'Organization',
            'children': full_tree.get('divisions', [])
        }
        return org_chart
    
    def _build_org_chart_node(self, unit: OrganizationalUnit, current_depth: int) -> Dict[str, Any]:
        if current_depth >= self._max_depth:
            return {
                'id': str(unit.id),
                'name': unit.name,
                'code': unit.code,
                'type': unit.level,
                'depth_reached': True
            }
        node = {
            'id': str(unit.id),
            'name': unit.name,
            'code': unit.code,
            'type': unit.level,
            'depth': unit.depth,
            'path': unit.path,
            'children': []
        }
        if hasattr(unit, 'sensitivity_level') and unit.sensitivity_level:
            node['sensitivity_level'] = unit.sensitivity_level
        managers = self._get_unit_managers(unit.id)
        if managers:
            node['managers'] = managers
        children = unit.children.filter(is_deleted=False, is_active=True)
        for child in children:
            node['children'].append(self._build_org_chart_node(child, current_depth + 1))
        return node
    
    def _get_unit_managers(self, unit_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            unit_id=unit_id,
            is_manager=True,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'is_executive': emp.is_executive
        } for emp in employments]
    
    def _get_division_managers(self, division_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            division_id=division_id,
            is_manager=True,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'is_executive': emp.is_executive
        } for emp in employments]
    
    def _get_department_managers(self, department_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            department_id=department_id,
            is_manager=True,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'is_executive': emp.is_executive
        } for emp in employments]
    
    def _get_section_managers(self, section_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            section_id=section_id,
            is_manager=True,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'is_executive': emp.is_executive
        } for emp in employments]
    
    def generate_flat_org_chart(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        flat_chart = []
        for unit in units:
            managers = self._get_unit_managers(unit.id)
            employee_count = Employment.objects.filter(
                unit_id=unit.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(unit.id),
                'name': unit.name,
                'code': unit.code,
                'level': unit.level,
                'parent_name': unit.parent.name if unit.parent else None,
                'depth': unit.depth,
                'path': unit.path,
                'managers': managers,
                'employee_count': employee_count,
                'children_count': unit.get_children_count()
            })
        return sorted(flat_chart, key=lambda x: (x['depth'], x['code']))
    
    def generate_flat_by_level(self, tenant_id: UUID, level: str) -> List[Dict[str, Any]]:
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            level=level,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        flat_chart = []
        for unit in units:
            managers = self._get_unit_managers(unit.id)
            employee_count = Employment.objects.filter(
                unit_id=unit.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(unit.id),
                'name': unit.name,
                'code': unit.code,
                'level': unit.level,
                'parent_name': unit.parent.name if unit.parent else None,
                'depth': unit.depth,
                'path': unit.path,
                'managers': managers,
                'employee_count': employee_count,
                'children_count': unit.get_children_count()
            })
        return sorted(flat_chart, key=lambda x: x['code'])
    
    def generate_division_flat_chart(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        divisions = Division.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        )
        flat_chart = []
        for division in divisions:
            managers = self._get_division_managers(division.id)
            employee_count = Employment.objects.filter(
                division_id=division.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(division.id),
                'name': division.name,
                'code': division.code,
                'depth': division.depth,
                'path': division.path,
                'managers': managers,
                'employee_count': employee_count,
                'department_count': division.get_children_count()
            })
        return sorted(flat_chart, key=lambda x: x['code'])
    
    def generate_department_flat_chart(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        flat_chart = []
        for dept in departments:
            managers = self._get_department_managers(dept.id)
            employee_count = Employment.objects.filter(
                department_id=dept.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(dept.id),
                'name': dept.name,
                'code': dept.code,
                'parent_name': dept.parent.name if dept.parent else None,
                'depth': dept.depth,
                'path': dept.path,
                'managers': managers,
                'employee_count': employee_count,
                'section_count': dept.get_children_count()
            })
        return sorted(flat_chart, key=lambda x: (x['depth'], x['code']))
    
    def generate_section_flat_chart(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        sections = Section.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        flat_chart = []
        for section in sections:
            managers = self._get_section_managers(section.id)
            employee_count = Employment.objects.filter(
                section_id=section.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(section.id),
                'name': section.name,
                'code': section.code,
                'parent_name': section.parent.name if section.parent else None,
                'depth': section.depth,
                'path': section.path,
                'managers': managers,
                'employee_count': employee_count,
                'unit_count': section.get_children_count()
            })
        return sorted(flat_chart, key=lambda x: (x['depth'], x['code']))
    
    def generate_unit_flat_chart(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        units = Unit.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        flat_chart = []
        for unit in units:
            managers = self._get_unit_managers(unit.id)
            employee_count = Employment.objects.filter(
                unit_id=unit.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(unit.id),
                'name': unit.name,
                'code': unit.code,
                'parent_name': unit.parent.name if unit.parent else None,
                'depth': unit.depth,
                'path': unit.path,
                'managers': managers,
                'employee_count': employee_count
            })
        return sorted(flat_chart, key=lambda x: (x['depth'], x['code']))
    
    def generate_text_org_chart(self, tenant_id: UUID, root_unit_id: Optional[UUID] = None, max_depth: int = 4) -> str:
        self._max_depth = max_depth
        lines = []
        
        def add_node(node_data: Dict[str, Any], prefix: str = '', is_last: bool = True) -> None:
            connector = '└── ' if is_last else '├── '
            level_label = node_data.get('type', '').capitalize() if node_data.get('type') else ''
            name_display = f"{node_data.get('name', '')} ({node_data.get('code', '')})"
            if level_label:
                lines.append(f"{prefix}{connector}[{level_label}] {name_display}")
            else:
                lines.append(f"{prefix}{connector}{name_display}")
            new_prefix = prefix + ('    ' if is_last else '│   ')
            children = node_data.get('children', [])
            for idx, child in enumerate(children):
                is_child_last = (idx == len(children) - 1)
                add_node(child, new_prefix, is_child_last)
        
        org_chart = self.generate_json_org_chart(tenant_id, root_unit_id, max_depth)
        if org_chart:
            lines.append(org_chart.get('name', 'Organization'))
            for idx, child in enumerate(org_chart.get('children', [])):
                is_last = (idx == len(org_chart['children']) - 1)
                add_node(child, '', is_last)
        return '\n'.join(lines)
    
    def generate_tree_by_level(self, tenant_id: UUID, level: str) -> Dict[str, Any]:
        model_map = {
            'division': Division,
            'department': Department,
            'section': Section,
            'unit': Unit
        }
        model = model_map.get(level)
        if not model:
            return {}
        root_units = model.objects.filter(
            tenant_id=tenant_id,
            parent__isnull=True,
            is_deleted=False,
            is_active=True
        )
        tree = {
            'tenant_id': str(tenant_id),
            'level': level,
            'children': []
        }
        for unit in root_units:
            tree['children'].append(self._build_org_chart_node(unit, 0))
        return tree
    
    def get_org_chart_stats(self, tenant_id: UUID) -> Dict[str, Any]:
        divisions = Division.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        sections = Section.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        units = Unit.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True).count()
        return {
            'tenant_id': str(tenant_id),
            'divisions': divisions,
            'departments': departments,
            'sections': sections,
            'units': units,
            'total_org_units': divisions + departments + sections + units,
            'total_employees': employments
        }