from typing import List, Optional, Dict, Any
from uuid import UUID
from django.core.cache import cache
from apps.structure.models.employment import Employment
from apps.structure.constants import CACHE_KEY_ORG_TREE, CACHE_KEY_EMPLOYMENT_CURRENT, DEFAULT_MAX_CACHE_TTL_SECONDS

class CacheWarmerService:
    def __init__(self):
        self._cache = cache
    
    def warm_org_tree(self, tenant_id: UUID) -> bool:
        from apps.structure.services.hierarchy.tree_builder import TreeBuilder
        try:
            tree_builder = TreeBuilder()
            tree = tree_builder.build_full_tree(tenant_id, use_cache=False)
            cache_key = CACHE_KEY_ORG_TREE.format(tenant_id=tenant_id)
            self._cache.set(cache_key, tree, DEFAULT_MAX_CACHE_TTL_SECONDS)
            return True
        except Exception:
            return False
    
    def warm_reporting_chains(self, tenant_id: UUID, user_ids: Optional[List[UUID]] = None) -> int:
        from apps.structure.services.reporting.chain_service import ChainService
        if user_ids is None:
            employments = Employment.objects.filter(
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).values_list('user_id', flat=True).distinct()
            user_ids = list(employments)
        chain_service = ChainService()
        warmed_count = 0
        for user_id in user_ids:
            try:
                chain_service.get_chain_of_command(user_id, tenant_id, use_cache=False)
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
        ).select_related('position', 'position__division', 'position__department', 'position__section', 'position__unit')
        warmed_count = 0
        for emp in employments:
            cache_key = CACHE_KEY_EMPLOYMENT_CURRENT.format(tenant_id=tenant_id, user_id=emp.user_id)
            pos = emp.position
            employment_data = {
                'id': str(emp.id),
                'user_id': str(emp.user_id),
                'position_title': pos.title if pos else None,
                'position_code': pos.job_code if pos else None,
                'division_id': str(pos.division_id) if pos and pos.division_id else None,
                'division_name': pos.division.name if pos and pos.division else None,
                'department_id': str(pos.department_id) if pos and pos.department_id else None,
                'department_name': pos.department.name if pos and pos.department else None,
                'section_id': str(pos.section_id) if pos and pos.section_id else None,
                'section_name': pos.section.name if pos and pos.section else None,
                'unit_id': str(pos.unit_id) if pos and pos.unit_id else None,
                'unit_name': pos.unit.name if pos and pos.unit else None,
                'is_manager': emp.is_manager,
                'is_executive': emp.is_executive,
                'manager_user_id': emp.manager_user_id,
                'interim_manager_user_id': emp.interim_manager_user_id,
                'effective_manager_user_id': emp.effective_manager_user_id
            }
            self._cache.set(cache_key, employment_data, DEFAULT_MAX_CACHE_TTL_SECONDS)
            warmed_count += 1
        return warmed_count
    
    def warm_all(self, tenant_id: UUID) -> dict:
        results = {
            'org_tree': self.warm_org_tree(tenant_id),
            'reporting_chains': self.warm_reporting_chains(tenant_id),
            'current_employments': self.warm_current_employments(tenant_id)
        }
        return results
    
    def invalidate_tenant_cache(self, tenant_id: UUID) -> int:
        exact_keys = [
            f"structure:org_tree:{tenant_id}",
        ]
        for key in exact_keys:
            try:
                self._cache.delete(key)
            except Exception:
                pass

        patterns = [
            f"structure:org_tree:{tenant_id}",
            f"structure:reporting_chain:{tenant_id}:*",
            f"structure:employment:{tenant_id}:*",
            f"structure:span:*:{tenant_id}:*",
            f"structure:access:*:{tenant_id}:*",
        ]
        invalidated_count = len(exact_keys)
        try:
            delete_pattern = getattr(self._cache, "delete_pattern", None)
            if callable(delete_pattern):
                for pattern in patterns:
                    try:
                        deleted = delete_pattern(pattern)
                        invalidated_count += int(deleted) if isinstance(deleted, int) else 1
                    except Exception:
                        continue
                return invalidated_count
        except Exception:
            pass
        try:
            keys_fn = getattr(self._cache, "keys", None)
            if not callable(keys_fn):
                return 0
            for pattern in patterns:
                try:
                    for key in keys_fn(pattern):
                        self._cache.delete(key)
                        invalidated_count += 1
                except Exception:
                    continue
        except Exception:
            pass
        return invalidated_count
    
    def schedule_warmup(self, tenant_id: UUID, delay_seconds: int = 30) -> None:
        from apps.structure.tasks import warm_structure_cache
        warm_structure_cache.apply_async(args=[str(tenant_id)], countdown=delay_seconds)