from typing import List, Optional, Dict, Any
from uuid import UUID
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.enums.org_level import OrgLevel

class LCAByIdFinder:
    @staticmethod
    def find_org_unit_lca(unit_a_id: UUID, unit_b_id: UUID, tenant_id: UUID) -> Optional[OrganizationalUnit]:
        def get_ancestor_ids(unit_id: UUID) -> List[UUID]:
            ancestors = []
            current_id = unit_id
            while current_id:
                ancestors.append(current_id)
                unit = OrganizationalUnit.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent').first()
                if not unit or not unit.parent_id:
                    break
                current_id = unit.parent_id
            return ancestors
        ancestors_a = get_ancestor_ids(unit_a_id)
        ancestors_b = get_ancestor_ids(unit_b_id)
        for ancestor in ancestors_a:
            if ancestor in ancestors_b:
                return OrganizationalUnit.objects.filter(
                    id=ancestor,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
        return None
    
    @staticmethod
    def find_division_lca(div_a_id: UUID, div_b_id: UUID, tenant_id: UUID) -> Optional[Division]:
        def get_ancestor_ids(div_id: UUID) -> List[UUID]:
            ancestors = []
            current_id = div_id
            while current_id:
                ancestors.append(current_id)
                division = Division.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent').first()
                if not division or not division.parent_id:
                    break
                current_id = division.parent_id
            return ancestors
        ancestors_a = get_ancestor_ids(div_a_id)
        ancestors_b = get_ancestor_ids(div_b_id)
        for ancestor in ancestors_a:
            if ancestor in ancestors_b:
                return Division.objects.filter(
                    id=ancestor,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
        return None
    
    @staticmethod
    def find_department_lca(dept_a_id: UUID, dept_b_id: UUID, tenant_id: UUID) -> Optional[Department]:
        def get_ancestor_ids(dept_id: UUID) -> List[UUID]:
            ancestors = []
            current_id = dept_id
            while current_id:
                ancestors.append(current_id)
                department = Department.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent').first()
                if not department or not department.parent_id:
                    break
                current_id = department.parent_id
            return ancestors
        ancestors_a = get_ancestor_ids(dept_a_id)
        ancestors_b = get_ancestor_ids(dept_b_id)
        for ancestor in ancestors_a:
            if ancestor in ancestors_b:
                return Department.objects.filter(
                    id=ancestor,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
        return None
    
    @staticmethod
    def find_section_lca(section_a_id: UUID, section_b_id: UUID, tenant_id: UUID) -> Optional[Section]:
        def get_ancestor_ids(section_id: UUID) -> List[UUID]:
            ancestors = []
            current_id = section_id
            while current_id:
                ancestors.append(current_id)
                section = Section.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent').first()
                if not section or not section.parent_id:
                    break
                current_id = section.parent_id
            return ancestors
        ancestors_a = get_ancestor_ids(section_a_id)
        ancestors_b = get_ancestor_ids(section_b_id)
        for ancestor in ancestors_a:
            if ancestor in ancestors_b:
                return Section.objects.filter(
                    id=ancestor,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
        return None
    
    @staticmethod
    def find_unit_lca(unit_a_id: UUID, unit_b_id: UUID, tenant_id: UUID) -> Optional[Unit]:
        def get_ancestor_ids(unit_id: UUID) -> List[UUID]:
            ancestors = []
            current_id = unit_id
            while current_id:
                ancestors.append(current_id)
                unit = Unit.objects.filter(
                    id=current_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).select_related('parent').first()
                if not unit or not unit.parent_id:
                    break
                current_id = unit.parent_id
            return ancestors
        ancestors_a = get_ancestor_ids(unit_a_id)
        ancestors_b = get_ancestor_ids(unit_b_id)
        for ancestor in ancestors_a:
            if ancestor in ancestors_b:
                return Unit.objects.filter(
                    id=ancestor,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
        return None


class LCAByPathFinder:
    @staticmethod
    def find_org_unit_lca_by_path(unit_a_id: UUID, unit_b_id: UUID, tenant_id: UUID, separator: str = '/') -> Optional[OrganizationalUnit]:
        unit_a = OrganizationalUnit.objects.filter(id=unit_a_id, tenant_id=tenant_id, is_deleted=False).first()
        unit_b = OrganizationalUnit.objects.filter(id=unit_b_id, tenant_id=tenant_id, is_deleted=False).first()
        if not unit_a or not unit_b:
            return None
        if not unit_a.path or not unit_b.path:
            unit_a.save()
            unit_b.save()
        path_a_parts = unit_a.path.split(separator) if unit_a.path else []
        path_b_parts = unit_b.path.split(separator) if unit_b.path else []
        common_parts = []
        for i in range(min(len(path_a_parts), len(path_b_parts))):
            if path_a_parts[i] == path_b_parts[i]:
                common_parts.append(path_a_parts[i])
            else:
                break
        if not common_parts:
            return None
        common_path = separator.join(common_parts)
        return OrganizationalUnit.objects.filter(
            path=common_path,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
    
    @staticmethod
    def find_department_lca_by_path(dept_a_id: UUID, dept_b_id: UUID, tenant_id: UUID, separator: str = '/') -> Optional[Department]:
        dept_a = Department.objects.filter(id=dept_a_id, tenant_id=tenant_id, is_deleted=False).first()
        dept_b = Department.objects.filter(id=dept_b_id, tenant_id=tenant_id, is_deleted=False).first()
        if not dept_a or not dept_b:
            return None
        if not dept_a.path or not dept_b.path:
            dept_a.save()
            dept_b.save()
        path_a_parts = dept_a.path.split(separator) if dept_a.path else []
        path_b_parts = dept_b.path.split(separator) if dept_b.path else []
        common_parts = []
        for i in range(min(len(path_a_parts), len(path_b_parts))):
            if path_a_parts[i] == path_b_parts[i]:
                common_parts.append(path_a_parts[i])
            else:
                break
        if not common_parts:
            return None
        common_path = separator.join(common_parts)
        return Department.objects.filter(
            path=common_path,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
    
    @staticmethod
    def calculate_lca_distance(unit_a_id: UUID, unit_b_id: UUID, tenant_id: UUID) -> int:
        lca = LCAByIdFinder.find_org_unit_lca(unit_a_id, unit_b_id, tenant_id)
        if not lca:
            return -1
        unit_a = OrganizationalUnit.objects.filter(id=unit_a_id, tenant_id=tenant_id).first()
        unit_b = OrganizationalUnit.objects.filter(id=unit_b_id, tenant_id=tenant_id).first()
        if not unit_a or not unit_b:
            return -1
        return (unit_a.depth - lca.depth) + (unit_b.depth - lca.depth)
    
    @staticmethod
    def get_lca_level(unit_a_id: UUID, unit_b_id: UUID, tenant_id: UUID) -> Optional[str]:
        lca = LCAByIdFinder.find_org_unit_lca(unit_a_id, unit_b_id, tenant_id)
        return lca.level if lca else None