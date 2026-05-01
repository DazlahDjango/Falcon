from typing import Optional, List, Dict, Any
from uuid import UUID
from django.core.cache import cache
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine
from ...constants import DEFAULT_MAX_CACHE_TTL_SECONDS
from .hierarchy_access import HierarchyAccessEnforcer

class ScopeEnforcerService:
    def __init__(self):
        self.access_enforcer = HierarchyAccessEnforcer()
    
    def enforce_department_scope(self, user_id: UUID, tenant_id: UUID, department_ids: List[UUID]) -> List[UUID]:
        if self._is_super_user(user_id, tenant_id):
            return department_ids
        user_department = self._get_user_department(user_id, tenant_id)
        if not user_department:
            return []
        if self._can_access_all_departments(user_id, tenant_id):
            return department_ids
        return [dept_id for dept_id in department_ids if dept_id == user_department.id]
    
    def enforce_team_scope(self, user_id: UUID, tenant_id: UUID, team_ids: List[UUID]) -> List[UUID]:
        if self._is_super_user(user_id, tenant_id):
            return team_ids
        user_teams = self._get_user_teams(user_id, tenant_id)
        if self._can_access_all_teams(user_id, tenant_id):
            return team_ids
        return [team_id for team_id in team_ids if team_id in user_teams]
    
    def enforce_user_scope(self, viewer_user_id: UUID, tenant_id: UUID, target_user_ids: List[UUID]) -> List[UUID]:
        accessible = self.access_enforcer.get_accessible_users(viewer_user_id, tenant_id)
        accessible_set = set(accessible)
        return [uid for uid in target_user_ids if uid in accessible_set]
    
    def _get_user_department(self, user_id: UUID, tenant_id: UUID):
        from ...models.employment import Employment
        return Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('department').first()
    
    def _get_user_teams(self, user_id: UUID, tenant_id: UUID) -> List[UUID]:
        from ...models.employment import Employment
        employments = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).exclude(team__isnull=True)
        return [emp.team_id for emp in employments if emp.team_id]
    
    def _is_super_user(self, user_id: UUID, tenant_id: UUID) -> bool:
        """Check if user has super user privileges"""
        # Integrate with accounts module
        return False
    
    def _can_access_all_departments(self, user_id: UUID, tenant_id: UUID) -> bool:
        """Check if user can access all departments"""
        # Integrate with accounts module for role checking
        return False
    
    def _can_access_all_teams(self, user_id: UUID, tenant_id: UUID) -> bool:
        return self._can_access_all_departments(user_id, tenant_id)
