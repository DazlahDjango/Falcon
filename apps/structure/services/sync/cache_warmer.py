from typing import List, Optional
from uuid import UUID
from django.core.cache import cache
from ...models.employment import Employment
from ...constants import CACHE_KEY_DEPARTMENT_TREE, CACHE_KEY_EMPLOYMENT_CURRENT, DEFAULT_MAX_CACHE_TTL_SECONDS


class CacheWarmerService:
    def __init__(self):
        self._cache = cache
    
    def warm_department_tree(self, tenant_id: UUID) -> bool:
        from ..hierarchy.tree_builder import TreeBuilder
        try:
            tree_builder = TreeBuilder()
            tree = tree_builder.build_department_tree(tenant_id, use_cache=False)
            cache_key = CACHE_KEY_DEPARTMENT_TREE.format(tenant_id=tenant_id)
            self._cache.set(cache_key, tree, DEFAULT_MAX_CACHE_TTL_SECONDS)
            return True
        except Exception:
            return False
    
    def warm_reporting_chains(self, tenant_id: UUID, user_ids: Optional[List[UUID]] = None) -> int:
        from ..reporting.chain_service import ReportingChainService
        if user_ids is None:
            employments = Employment.objects.filter(
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).values_list('user_id', flat=True).distinct()
            user_ids = list(employments)
        chain_service = ReportingChainService()
        warmed_count = 0
        for user_id in user_ids:
            try:
                chain_service.get_chain_up(user_id, tenant_id, use_cache=False)
                chain_service.get_chain_down(user_id, tenant_id, use_cache=False)
                warmed_count += 1
            except Exception:
                continue
        return warmed_count
    
    def warm_current_employments(self, tenant_id: UUID) -> int:
        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position', 'department', 'team')
        warmed_count = 0
        for emp in employments:
            cache_key = CACHE_KEY_EMPLOYMENT_CURRENT.format(tenant_id=tenant_id, user_id=emp.user_id)
            employment_data = {
                'id': str(emp.id),
                'user_id': str(emp.user_id),
                'position_title': emp.position.title if emp.position else None,
                'position_code': emp.position.job_code if emp.position else None,
                'department_id': str(emp.department_id) if emp.department_id else None,
                'department_name': emp.department.name if emp.department else None,
                'team_id': str(emp.team_id) if emp.team_id else None,
                'team_name': emp.team.name if emp.team else None,
                'is_manager': emp.is_manager,
                'is_executive': emp.is_executive,
                'manager_user_id': emp.manager_user_id
            }
            self._cache.set(cache_key, employment_data, DEFAULT_MAX_CACHE_TTL_SECONDS)
            warmed_count += 1
        return warmed_count
    
    def warm_all(self, tenant_id: UUID) -> dict:
        results = {
            'department_tree': self.warm_department_tree(tenant_id),
            'reporting_chains': self.warm_reporting_chains(tenant_id),
            'current_employments': self.warm_current_employments(tenant_id)
        }
        return results
    
    def invalidate_tenant_cache(self, tenant_id: UUID) -> int:
        patterns = [
            f"structure:dept_tree:{tenant_id}",
            f"structure:reporting_up:{tenant_id}:*",
            f"structure:reporting_down:{tenant_id}:*",
            f"structure:employment:{tenant_id}:*",
            f"structure:span:*:{tenant_id}:*",
            f"structure:access:*:{tenant_id}:*"
        ]
        invalidated_count = 0
        for pattern in patterns:
            keys = self._cache.keys(pattern)
            for key in keys:
                self._cache.delete(key)
                invalidated_count += 1
        return invalidated_count
    
    def schedule_warmup(self, tenant_id: UUID, delay_seconds: int = 30) -> None:
        from ...tasks import warm_structure_cache
        warm_structure_cache.apply_async(args=[str(tenant_id)], countdown=delay_seconds)