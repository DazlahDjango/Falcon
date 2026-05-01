from typing import Optional, List, Dict, Any
from uuid import UUID
from django.core.cache import cache
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine
from ...constants import DEFAULT_MAX_CACHE_TTL_SECONDS


class HierarchyAccessEnforcer:
    ACCESS_LEVELS = {
        'no_access': 0,
        'self_only': 1,
        'direct_reports': 2,
        'subtree': 3,
        'full_tenant': 4
    }
    
    def __init__(self):
        self._cache = cache
    
    def can_view(self, viewer_user_id: UUID, target_user_id: UUID, tenant_id: UUID, use_cache: bool = True) -> bool:
        if viewer_user_id == target_user_id:
            return True
        cache_key = f"structure:access:can_view:{tenant_id}:{viewer_user_id}:{target_user_id}"
        if use_cache:
            cached = self._cache.get(cache_key)
            if cached is not None:
                return cached
        viewer_employment = Employment.objects.filter(
            user_id=viewer_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        target_employment = Employment.objects.filter(
            user_id=target_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not viewer_employment or not target_employment:
            result = False
        elif self._is_hr_or_admin(viewer_user_id, tenant_id):
            result = True
        elif self._is_manager_of(viewer_user_id, target_user_id, tenant_id):
            result = True
        elif self._is_in_same_department(viewer_employment, target_employment):
            result = self._get_department_access_level(viewer_user_id, tenant_id) >= self.ACCESS_LEVELS['subtree']
        else:
            result = False
        if use_cache:
            self._cache.set(cache_key, result, DEFAULT_MAX_CACHE_TTL_SECONDS)
        return result
    
    def get_access_level(self, viewer_user_id: UUID, target_user_id: UUID, tenant_id: UUID) -> int:
        if viewer_user_id == target_user_id:
            return self.ACCESS_LEVELS['self_only']
        if self._is_manager_of(viewer_user_id, target_user_id, tenant_id):
            return self.ACCESS_LEVELS['direct_reports']
        if self._is_in_hierarchy_subtree(viewer_user_id, target_user_id, tenant_id):
            return self.ACCESS_LEVELS['subtree']
        if self._is_hr_or_admin(viewer_user_id, tenant_id):
            return self.ACCESS_LEVELS['full_tenant']
        return self.ACCESS_LEVELS['no_access']
    
    def get_accessible_users(self, viewer_user_id: UUID, tenant_id: UUID, access_level: int = 3) -> List[UUID]:
        if access_level >= self.ACCESS_LEVELS['full_tenant']:
            users = Employment.objects.filter(
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).values_list('user_id', flat=True)
            return list(users)
        accessible = [viewer_user_id]
        if access_level >= self.ACCESS_LEVELS['direct_reports']:
            direct = self._get_direct_reports(viewer_user_id, tenant_id)
            accessible.extend(direct)
        if access_level >= self.ACCESS_LEVELS['subtree']:
            indirect = self._get_indirect_reports(viewer_user_id, tenant_id)
            accessible.extend(indirect)
        return list(set(accessible))
    
    def _is_manager_of(self, manager_user_id: UUID, employee_user_id: UUID, tenant_id: UUID) -> bool:
        manager_emp = Employment.objects.filter(
            user_id=manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not manager_emp or not employee_emp:
            return False
        return ReportingLine.objects.filter(
            employee_id=employee_emp.id,
            manager_id=manager_emp.id,
            relation_type='solid',
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).exists()
    
    def _is_in_hierarchy_subtree(self, viewer_user_id: UUID, target_user_id: UUID, tenant_id: UUID) -> bool:
        viewer_descendants = self._get_all_descendants(viewer_user_id, tenant_id)
        return target_user_id in viewer_descendants
    
    def _is_in_same_department(self, viewer_employment: Employment, target_employment: Employment) -> bool:
        if not viewer_employment or not target_employment:
            return False
        return viewer_employment.department_id == target_employment.department_id
    
    def _get_department_access_level(self, viewer_user_id: UUID, tenant_id: UUID) -> int:
        viewer_employment = Employment.objects.filter(
            user_id=viewer_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not viewer_employment:
            return self.ACCESS_LEVELS['self_only']
        if viewer_employment.is_manager or viewer_employment.is_executive:
            return self.ACCESS_LEVELS['subtree']
        return self.ACCESS_LEVELS['self_only']
    
    def _get_direct_reports(self, manager_user_id: UUID, tenant_id: UUID) -> List[UUID]:
        manager_emp = Employment.objects.filter(
            user_id=manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not manager_emp:
            return []
        reporting_lines = ReportingLine.objects.filter(
            manager_id=manager_emp.id,
            relation_type='solid',
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('employee')
        return [line.employee.user_id for line in reporting_lines]
    
    def _get_indirect_reports(self, manager_user_id: UUID, tenant_id: UUID) -> List[UUID]:
        def collect_descendants(current_manager_id: UUID) -> List[UUID]:
            descendants = []
            current_emp = Employment.objects.filter(
                user_id=current_manager_id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).first()
            if not current_emp:
                return []
            direct = ReportingLine.objects.filter(
                manager_id=current_emp.id,
                relation_type='solid',
                is_active=True,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('employee')
            for report in direct:
                descendants.append(report.employee.user_id)
                descendants.extend(collect_descendants(report.employee.user_id))
            return descendants
        all_descendants = collect_descendants(manager_user_id)
        direct = self._get_direct_reports(manager_user_id, tenant_id)
        return [d for d in all_descendants if d not in direct]
    
    def _get_all_descendants(self, manager_user_id: UUID, tenant_id: UUID) -> List[UUID]:
        direct = self._get_direct_reports(manager_user_id, tenant_id)
        indirect = self._get_indirect_reports(manager_user_id, tenant_id)
        return direct + indirect
    
    def _is_hr_or_admin(self, user_id: UUID, tenant_id: UUID) -> bool:
        """Check if user has HR or Admin role"""
        # This should integrate with accounts module
        # For now, returning False, will be overridden by actual role check
        return False
    
    def clear_cache(self, tenant_id: UUID, viewer_user_id: Optional[UUID] = None) -> None:
        if viewer_user_id:
            pattern = f"structure:access:can_view:{tenant_id}:{viewer_user_id}:*"
            keys = self._cache.keys(pattern)
            for key in keys:
                self._cache.delete(key)
        else:
            pattern = f"structure:access:can_view:{tenant_id}:*"
            keys = self._cache.keys(pattern)
            for key in keys:
                self._cache.delete(key)