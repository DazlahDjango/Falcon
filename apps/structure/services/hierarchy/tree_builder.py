from django.db import models
from django.core.cache import cache
from typing import Dict, List, Optional, Any
from uuid import UUID
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.employment import Employment
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.constants import CACHE_KEY_ORG_TREE, DEFAULT_MAX_CACHE_TTL_SECONDS


class TreeBuilder:
    def __init__(self):
        self._cache = cache
    
    def build_full_tree(self, tenant_id: UUID, use_cache: bool = True) -> Dict[str, Any]:
        cache_key = CACHE_KEY_ORG_TREE.format(tenant_id=tenant_id)
        if use_cache:
            cached = self._cache.get(cache_key)
            if cached:
                return cached
        tree = {
            'tenant_id': str(tenant_id),
            'divisions': self._build_divisions(tenant_id),
            'departments': self._build_top_level_departments(tenant_id),
            'sections': self._build_top_level_sections(tenant_id),
            'units': self._build_top_level_units(tenant_id),
        }
        if use_cache:
            self._cache.set(cache_key, tree, DEFAULT_MAX_CACHE_TTL_SECONDS)
        return tree
    
    def _build_divisions(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        divisions = Division.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True)
        return [self._build_division_node(div) for div in divisions]

    def _build_top_level_departments(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        departments = Department.objects.filter(tenant_id=tenant_id, division__isnull=True, is_deleted=False, is_active=True)
        return [self._build_department_node(dept) for dept in departments]
        
    def _build_top_level_sections(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        sections = Section.objects.filter(tenant_id=tenant_id, department__isnull=True, is_deleted=False, is_active=True)
        return [self._build_section_node(section) for section in sections]
        
    def _build_top_level_units(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        units = Unit.objects.filter(tenant_id=tenant_id, section__isnull=True, is_deleted=False, is_active=True)
        return [self._build_unit_node(unit) for unit in units]
    
    def _build_division_node(self, division: Division) -> Dict[str, Any]:
        return {
            'id': str(division.id),
            'code': division.code,
            'name': division.name,
            'description': division.description,
            'level': division.level,
            'depth': division.depth,
            'path': division.path,
            'cost_center_id': division.cost_center_id,
            'budget_code': division.budget_code,
            'headcount_limit': division.headcount_limit,
            'is_active': division.is_active,
            'departments': self._build_departments(division.id),
            'employments': self._get_employments(division.id, 'division_id'),
            'locations': self._get_locations(division.id),
            'cost_centers': self._get_cost_centers(division.id),
            'children_count': division.get_children_count()
        }
    
    def _build_departments(self, division_id: UUID) -> List[Dict[str, Any]]:
        departments = Department.objects.filter(division_id=division_id, is_deleted=False, is_active=True)
        return [self._build_department_node(dept) for dept in departments]
    
    def _build_department_node(self, department: Department) -> Dict[str, Any]:
        return {
            'id': str(department.id),
            'code': department.code,
            'name': department.name,
            'description': department.description,
            'level': department.level,
            'depth': department.depth,
            'path': department.path,
            'cost_center_id': getattr(department, 'cost_center_id', None),
            'budget_code': department.budget_code,
            'headcount_limit': department.headcount_limit,
            'is_active': department.is_active,
            'sensitivity_level': department.sensitivity_level,
            'sections': self._build_sections(department.id),
            'employments': self._get_employments(department.id, 'department_id'),
            'children_count': department.get_children_count()
        }
    
    def _build_sections(self, department_id: UUID) -> List[Dict[str, Any]]:
        sections = Section.objects.filter(department_id=department_id, is_deleted=False, is_active=True)
        return [self._build_section_node(section) for section in sections]
    
    def _build_section_node(self, section: Section) -> Dict[str, Any]:
        return {
            'id': str(section.id),
            'code': section.code,
            'name': section.name,
            'description': section.description,
            'level': section.level,
            'depth': section.depth,
            'path': section.path,
            'cost_center_id': section.cost_center_id,
            'budget_code': section.budget_code,
            'headcount_limit': section.headcount_limit,
            'is_active': section.is_active,
            'units': self._build_units(section.id),
            'employments': self._get_employments(section.id, 'section_id'),
            'children_count': section.get_children_count()
        }
    
    def _build_units(self, section_id: UUID) -> List[Dict[str, Any]]:
        units = Unit.objects.filter(section_id=section_id, is_deleted=False, is_active=True)
        return [self._build_unit_node(unit) for unit in units]
    
    def _build_unit_node(self, unit: Unit) -> Dict[str, Any]:
        return {
            'id': str(unit.id),
            'code': unit.code,
            'name': unit.name,
            'description': unit.description,
            'level': unit.level,
            'depth': unit.depth,
            'path': unit.path,
            'cost_center_id': unit.cost_center_id,
            'budget_code': unit.budget_code,
            'headcount_limit': unit.headcount_limit,
            'is_active': unit.is_active,
            'employments': self._get_employments(unit.id, 'unit_id'),
            'children_count': unit.get_children_count()
        }
    
    def _get_employments(self, org_id: UUID, field_name: str) -> List[Dict[str, Any]]:
        position_field = f"position__{field_name}"
        filter_kwargs = {position_field: org_id, 'is_deleted': False, 'is_active': True, 'is_current': True}
        employments = Employment.objects.filter(**filter_kwargs).select_related('position')
        return [{
            'id': str(emp.id),
            'user_id': str(emp.user_id),
            'position': {
                'id': str(emp.position.id),
                'job_code': emp.position.job_code,
                'title': emp.position.title,
                'grade': emp.position.grade,
                'level': emp.position.level
            },
            'employment_type': emp.employment_type,
            'is_manager': emp.is_manager,
            'is_executive': emp.is_executive,
            'is_board_member': emp.is_board_member,
            'effective_from': emp.effective_from.isoformat() if emp.effective_from else None,
            'effective_to': emp.effective_to.isoformat() if emp.effective_to else None,
            'manager_user_id': emp.manager_user_id,
            'interim_manager_user_id': emp.interim_manager_user_id,
            'effective_manager_user_id': emp.effective_manager_user_id
        } for emp in employments]
    
    def _get_locations(self, org_id: UUID) -> List[Dict[str, Any]]:
        from apps.structure.models.location_allocation import LocationAllocation
        allocations = LocationAllocation.objects.filter(
            object_id=org_id,
            is_deleted=False,
            location__is_deleted=False,
            location__is_active=True
        ).select_related('location')
        return [{
            'id': str(alloc.location.id),
            'code': alloc.location.code,
            'name': alloc.location.name,
            'type': alloc.location.type,
            'city': alloc.location.city,
            'country': alloc.location.country,
            'full_address': alloc.location.full_address,
            'is_headquarters': alloc.location.is_headquarters,
            'allocation_percentage': float(alloc.allocation_percentage)
        } for alloc in allocations]
    
    def _get_cost_centers(self, org_id: UUID) -> List[Dict[str, Any]]:
        from apps.structure.models.cost_center_allocation import CostCenterAllocation
        allocations = CostCenterAllocation.objects.filter(
            object_id=org_id,
            is_deleted=False,
            cost_center__is_deleted=False,
            cost_center__is_active=True
        ).select_related('cost_center')
        return [{
            'id': str(alloc.cost_center.id),
            'code': alloc.cost_center.code,
            'name': alloc.cost_center.name,
            'category': alloc.cost_center.category,
            'budget_amount': float(alloc.cost_center.budget_amount) if alloc.cost_center.budget_amount else None,
            'fiscal_year': alloc.cost_center.fiscal_year,
            'allocation_percentage': float(alloc.allocation_percentage)
        } for alloc in allocations]
    
    def build_subtree(self, org_id: UUID, org_type: str) -> Optional[Dict[str, Any]]:
        model_map = {
            'division': Division,
            'department': Department,
            'section': Section,
            'unit': Unit
        }
        model = model_map.get(org_type)
        if not model:
            return None
        try:
            node = model.objects.get(id=org_id, is_deleted=False)
            return self._build_node_by_type(node, org_type)
        except model.DoesNotExist:
            return None
    
    def _build_node_by_type(self, node, org_type: str) -> Dict[str, Any]:
        if org_type == 'division':
            return self._build_division_node(node)
        elif org_type == 'department':
            return self._build_department_node(node)
        elif org_type == 'section':
            return self._build_section_node(node)
        elif org_type == 'unit':
            return self._build_unit_node(node)
        return {}
    
    def get_branch(self, root_id: UUID, tenant_id: UUID, org_type: str) -> Dict[str, Any]:
        full_tree = self.build_full_tree(tenant_id, use_cache=True)
        if org_type == 'division':
            for div in full_tree.get('divisions', []):
                if div['id'] == str(root_id):
                    return div
        elif org_type == 'department':
            for div in full_tree.get('divisions', []):
                for dept in div.get('departments', []):
                    if dept['id'] == str(root_id):
                        return dept
        elif org_type == 'section':
            for div in full_tree.get('divisions', []):
                for dept in div.get('departments', []):
                    for section in dept.get('sections', []):
                        if section['id'] == str(root_id):
                            return section
        elif org_type == 'unit':
            for div in full_tree.get('divisions', []):
                for dept in div.get('departments', []):
                    for section in dept.get('sections', []):
                        for unit in section.get('units', []):
                            if unit['id'] == str(root_id):
                                return unit
        return {}
    
    def clear_cache(self, tenant_id: UUID) -> None:
        cache_key = CACHE_KEY_ORG_TREE.format(tenant_id=tenant_id)
        self._cache.delete(cache_key)