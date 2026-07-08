from typing import List, Optional, Dict, Any
from uuid import UUID
from django.db import models
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.employment import Employment
from apps.structure.models.position import Position

class SubtreeExtractor:
    @staticmethod
    def extract_org_unit_subtree(root_unit_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[OrganizationalUnit]:
        root = OrganizationalUnit.objects.filter(id=root_unit_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root:
            return []
        if not root.path:
            root.save()
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            path__startswith=root.path,
            is_deleted=False
        )
        if not include_inactive:
            units = units.filter(is_active=True)
        return list(units.order_by('path'))
    
    @staticmethod
    def extract_division_subtree(root_division_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Division]:
        root = Division.objects.filter(id=root_division_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root:
            return []
        if not root.path:
            root.save()
        divisions = Division.objects.filter(
            tenant_id=tenant_id,
            path__startswith=root.path,
            is_deleted=False
        )
        if not include_inactive:
            divisions = divisions.filter(is_active=True)
        return list(divisions.order_by('path'))
    
    @staticmethod
    def extract_department_subtree(root_department_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Department]:
        root = Department.objects.filter(id=root_department_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root:
            return []
        if not root.path:
            root.save()
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            path__startswith=root.path,
            is_deleted=False
        )
        if not include_inactive:
            departments = departments.filter(is_active=True)
        return list(departments.order_by('path'))
    
    @staticmethod
    def extract_section_subtree(root_section_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Section]:
        root = Section.objects.filter(id=root_section_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root:
            return []
        if not root.path:
            root.save()
        sections = Section.objects.filter(
            tenant_id=tenant_id,
            path__startswith=root.path,
            is_deleted=False
        )
        if not include_inactive:
            sections = sections.filter(is_active=True)
        return list(sections.order_by('path'))
    
    @staticmethod
    def extract_unit_subtree(root_unit_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Unit]:
        root = Unit.objects.filter(id=root_unit_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root:
            return []
        if not root.path:
            root.save()
        units = Unit.objects.filter(
            tenant_id=tenant_id,
            path__startswith=root.path,
            is_deleted=False
        )
        if not include_inactive:
            units = units.filter(is_active=True)
        return list(units.order_by('path'))
    
    @staticmethod
    def extract_org_unit_hierarchy(unit_id: UUID, tenant_id: UUID, include_members: bool = False) -> Dict[str, Any]:
        def build_unit_node(unit: OrganizationalUnit) -> Dict[str, Any]:
            node = {
                'id': str(unit.id),
                'name': unit.name,
                'code': unit.code,
                'description': unit.description,
                'level': unit.level,
                'depth': unit.depth,
                'path': unit.path,
                'is_active': unit.is_active,
                'children': []
            }
            if include_members:
                node['members'] = SubtreeExtractor._get_unit_members(unit.id, tenant_id)
            children = unit.children.filter(is_deleted=False, is_active=True)
            for child in children:
                node['children'].append(build_unit_node(child))
            return node
        root_unit = OrganizationalUnit.objects.filter(id=unit_id, tenant_id=tenant_id, is_deleted=False).first()
        if not root_unit:
            return {}
        return build_unit_node(root_unit)
    
    @staticmethod
    def _get_unit_members(unit_id: UUID, tenant_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            unit_id=unit_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'position_code': emp.position.job_code if emp.position else None,
            'is_manager': emp.is_manager,
            'is_executive': emp.is_executive
        } for emp in employments]
    
    @staticmethod
    def extract_employees_in_subtree(root_unit_id: UUID, tenant_id: UUID, include_indirect: bool = True) -> List[UUID]:
        units = SubtreeExtractor.extract_org_unit_subtree(root_unit_id, tenant_id)
        unit_ids = [unit.id for unit in units]
        fields = ['division_id', 'department_id', 'section_id', 'unit_id']
        employments = Employment.objects.none()
        for field in fields:
            filter_kwargs = {f'{field}__in': unit_ids, 'tenant_id': tenant_id, 'is_current': True, 'is_deleted': False, 'is_active': True}
            employments = employments | Employment.objects.filter(**filter_kwargs)
        return list(employments.values_list('user_id', flat=True).distinct())
    
    @staticmethod
    def extract_employees_in_department(root_department_id: UUID, tenant_id: UUID, include_indirect: bool = True) -> List[UUID]:
        departments = SubtreeExtractor.extract_department_subtree(root_department_id, tenant_id)
        department_ids = [dept.id for dept in departments]
        if include_indirect:
            employments = Employment.objects.filter(
                department_id__in=department_ids,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            )
        else:
            employments = Employment.objects.filter(
                department_id=root_department_id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            )
        return list(employments.values_list('user_id', flat=True).distinct())
    
    @staticmethod
    def get_subtree_statistics(root_unit_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        units = SubtreeExtractor.extract_org_unit_subtree(root_unit_id, tenant_id)
        unit_ids = [unit.id for unit in units]
        employments = Employment.objects.filter(
            unit_id__in=unit_ids,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        )
        position_count = Position.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        ).count()
        return {
            'unit_count': len(units),
            'employee_count': employments.count(),
            'position_count': position_count,
            'max_depth': max([unit.depth for unit in units]) if units else 0,
            'levels': list(set([unit.level for unit in units])) if units else []
        }