from typing import Optional, List, Dict, Any
from uuid import UUID
from django.core.cache import cache
from apps.structure.models.employment import Employment
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.employment import Employment
from apps.structure.services.security.hierarchy_access import HierarchyAccessEnforcer

class ScopeEnforcerService:
    def __init__(self):
        self.access_enforcer = HierarchyAccessEnforcer()
    
    def enforce_org_unit_scope(self, user_id: UUID, tenant_id: UUID, unit_ids: List[UUID]) -> List[UUID]:
        if self._is_super_user(user_id, tenant_id):
            return unit_ids
        user_unit = self._get_user_unit(user_id, tenant_id)
        if not user_unit:
            return []
        if self._can_access_all_units(user_id, tenant_id):
            return unit_ids
        return [unit_id for unit_id in unit_ids if unit_id == user_unit.id]
    
    def enforce_department_scope(self, user_id: UUID, tenant_id: UUID, department_ids: List[UUID]) -> List[UUID]:
        if self._is_super_user(user_id, tenant_id):
            return department_ids
        user_department = self._get_user_department(user_id, tenant_id)
        if not user_department:
            return []
        if self._can_access_all_departments(user_id, tenant_id):
            return department_ids
        return [dept_id for dept_id in department_ids if dept_id == user_department.id]
    
    def enforce_section_scope(self, user_id: UUID, tenant_id: UUID, section_ids: List[UUID]) -> List[UUID]:
        if self._is_super_user(user_id, tenant_id):
            return section_ids
        user_section = self._get_user_section(user_id, tenant_id)
        if not user_section:
            return []
        if self._can_access_all_sections(user_id, tenant_id):
            return section_ids
        return [section_id for section_id in section_ids if section_id == user_section.id]
    
    def enforce_user_scope(self, viewer_user_id: UUID, tenant_id: UUID, target_user_ids: List[UUID]) -> List[UUID]:
        accessible = self.access_enforcer.get_accessible_users(viewer_user_id, tenant_id)
        accessible_set = set(accessible)
        return [uid for uid in target_user_ids if uid in accessible_set]
    
    def _get_user_unit(self, user_id: UUID, tenant_id: UUID) -> Optional[Unit]:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('unit').first()
        return employment.unit if employment else None
    
    def _get_user_department(self, user_id: UUID, tenant_id: UUID) -> Optional[Department]:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('department').first()
        return employment.department if employment else None
    
    def _get_user_section(self, user_id: UUID, tenant_id: UUID) -> Optional[Section]:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('section').first()
        return employment.section if employment else None
    
    def _is_super_user(self, user_id: UUID, tenant_id: UUID) -> bool:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return False
        return employment.is_executive or employment.is_board_member
    
    def _can_access_all_units(self, user_id: UUID, tenant_id: UUID) -> bool:
        return self._is_super_user(user_id, tenant_id)
    
    def _can_access_all_departments(self, user_id: UUID, tenant_id: UUID) -> bool:
        return self._is_super_user(user_id, tenant_id)
    
    def _can_access_all_sections(self, user_id: UUID, tenant_id: UUID) -> bool:
        return self._is_super_user(user_id, tenant_id)