from typing import List, Optional, Dict, Any, Set
from uuid import UUID
from django.core.cache import cache
from django.db import models
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine
from ...constants import CACHE_KEY_REPORTING_CHAIN_UP, CACHE_KEY_REPORTING_CHAIN_DOWN, DEFAULT_MAX_CACHE_TTL_SECONDS
from ...exceptions import MaxDepthExceededError

class ReportingChainService:
    def __init__(self, max_depth: int = 10):
        self.max_depth = max_depth
        self._cache = cache
    
    def get_chain_up(self, user_id: UUID, tenant_id: UUID, include_self: bool = False, use_cache: bool = True) -> List[Dict[str, Any]]:
        cache_key = CACHE_KEY_REPORTING_CHAIN_UP.format(tenant_id=tenant_id, user_id=user_id)
        if use_cache:
            cached = self._cache.get(cache_key)
            if cached:
                return cached
        chain = []
        current_user_id = user_id
        depth = 0
        if include_self:
            chain.append(self._get_user_chain_info(current_user_id, tenant_id, 'self'))
        while current_user_id and depth < self.max_depth:
            employment = Employment.objects.filter(
                user_id=current_user_id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).first()
            if not employment:
                break
            manager_user_id = employment.manager_user_id
            if not manager_user_id:
                break
            manager_info = self._get_user_chain_info(manager_user_id, tenant_id, 'manager')
            manager_info['relation_type'] = 'solid'
            manager_info['reporting_weight'] = 1.0
            chain.append(manager_info)
            current_user_id = manager_user_id
            depth += 1
        if depth >= self.max_depth and current_user_id:
            raise MaxDepthExceededError(depth, self.max_depth)
        if use_cache:
            self._cache.set(cache_key, chain, DEFAULT_MAX_CACHE_TTL_SECONDS)
        return chain
    
    def get_chain_down(self, manager_user_id: UUID, tenant_id: UUID, include_indirect: bool = True, max_depth: int = 10, use_cache: bool = True) -> List[Dict[str, Any]]:
        cache_key = CACHE_KEY_REPORTING_CHAIN_DOWN.format(tenant_id=tenant_id, user_id=manager_user_id)
        if use_cache:
            cached = self._cache.get(cache_key)
            if cached:
                return cached
        chain = []
        def collect_descendants(current_manager_id: UUID, depth: int) -> None:
            if depth > max_depth:
                return
            reporting_lines = ReportingLine.objects.filter(
                manager__user_id=current_manager_id,
                relation_type='solid',
                is_active=True,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('employee', 'employee__position')
            for report in reporting_lines:
                employee_info = self._get_user_chain_info(report.employee.user_id, tenant_id, 'subordinate')
                employee_info['relation_type'] = report.relation_type
                employee_info['reporting_weight'] = float(report.reporting_weight)
                employee_info['depth'] = depth + 1
                chain.append(employee_info)
                if include_indirect:
                    collect_descendants(report.employee.user_id, depth + 1)
        collect_descendants(manager_user_id, 0)
        if use_cache:
            self._cache.set(cache_key, chain, DEFAULT_MAX_CACHE_TTL_SECONDS)
        return chain
    
    def _get_user_chain_info(self, user_id: UUID, tenant_id: UUID, role: str) -> Dict[str, Any]:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position', 'department').first()
        return {
            'user_id': str(user_id),
            'role_in_chain': role,
            'position_title': employment.position.title if employment and employment.position else None,
            'position_code': employment.position.job_code if employment and employment.position else None,
            'department_name': employment.department.name if employment and employment.department else None,
            'is_manager': employment.is_manager if employment else False,
            'is_executive': employment.is_executive if employment else False
        }
    
    def get_management_level(self, user_id: UUID, tenant_id: UUID) -> int:
        chain = self.get_chain_up(user_id, tenant_id, include_self=False, use_cache=True)
        return len(chain)
    
    def is_manager_of(self, manager_user_id: UUID, employee_user_id: UUID, tenant_id: UUID) -> bool:
        if manager_user_id == employee_user_id:
            return False
        chain = self.get_chain_up(employee_user_id, tenant_id, include_self=False, use_cache=True)
        return any(manager['user_id'] == str(manager_user_id) for manager in chain)
    
    def get_common_manager(self, user_a_id: UUID, user_b_id: UUID, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        chain_a = self.get_chain_up(user_a_id, tenant_id, include_self=True, use_cache=True)
        chain_b = self.get_chain_up(user_b_id, tenant_id, include_self=True, use_cache=True)
        chain_a_ids = {c['user_id'] for c in chain_a}
        for manager in chain_b:
            if manager['user_id'] in chain_a_ids:
                return manager    
        return None
    
    def clear_cache(self, tenant_id: UUID, user_id: Optional[UUID] = None) -> None:
        if user_id:
            self._cache.delete(CACHE_KEY_REPORTING_CHAIN_UP.format(tenant_id=tenant_id, user_id=user_id))
            self._cache.delete(CACHE_KEY_REPORTING_CHAIN_DOWN.format(tenant_id=tenant_id, user_id=user_id))
        else:
            pattern = f"structure:reporting_*:{tenant_id}:*"
            keys = self._cache.keys(pattern)
            for key in keys:
                self._cache.delete(key)