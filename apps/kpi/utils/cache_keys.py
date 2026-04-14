from typing import Optional, Union
from django.core.cache import cache

class CacheKeyGenerator:
    PREFIX = "kpi"
    @classmethod
    def score(cls, kpi_id: str, user_id: str, year: int, month: int) -> str:
        return f"{cls.PREFIX}:score:{kpi_id}:{user_id}:{year}:{month:02d}"
    @classmethod
    def dashboard_individual(cls, user_id: str, year: int, month: int) -> str:
        return f"{cls.PREFIX}:dashboard:individual:{user_id}:{year}:{month:02d}"
    @classmethod
    def dashboard_manager(cls, manager_id: str, year: int, month: int) -> str:
        return f"{cls.PREFIX}:dashboard:manager:{manager_id}:{year}:{month:02d}"
    @classmethod
    def dashboard_executive(cls, tenant_id: str, year: int, month: int) -> str:
        return f"{cls.PREFIX}:dashboard:executive:{tenant_id}:{year}:{month:02d}"
    @classmethod
    def aggregation(cls, level: str, entity_id: str, year: int, month: int) -> str:
        return f"{cls.PREFIX}:aggregation:{level}:{entity_id}:{year}:{month:02d}"
    @classmethod
    def kpi(cls, kpi_id: str) -> str:
        return f"{cls.PREFIX}:kpi:{kpi_id}"
    @classmethod
    def kpi_framework(cls, framework_id: str) -> str:
        return f"{cls.PREFIX}:framework:{framework_id}"
    @classmethod
    def target(cls, kpi_id: str, user_id: str, year: int) -> str:
        return f"{cls.PREFIX}:target:{kpi_id}:{user_id}:{year}"
    @classmethod
    def phasing(cls, annual_target_id: str) -> str:
        return f"{cls.PREFIX}:phasing:{annual_target_id}"
    @classmethod
    def hierarchy(cls, user_id: str) -> str:
        return f"{cls.PREFIX}:hierarchy:{user_id}"
    @classmethod
    def cascade(cls, org_target_id: str) -> str:
        return f"{cls.PREFIX}:cascade:{org_target_id}"
    @classmethod
    def pattern(cls, pattern_type: str, *args) -> str:
        key = f"{cls.PREFIX}:pattern:{pattern_type}"
        for arg in args:
            key += f":{arg}"
        return key

def get_score_cache_key(kpi_id: str, user_id: str, year: int, month: int) -> str:
    return CacheKeyGenerator.score(kpi_id, user_id, year, month)

def get_dashboard_cache_key(user_id: str, year: int, month: int, dashboard_type: str = 'individual') -> str:
    if dashboard_type == 'manager':
        return CacheKeyGenerator.dashboard_manager(user_id, year, month)
    elif dashboard_type == 'executive':
        return CacheKeyGenerator.dashboard_executive(user_id, year, month)
    return CacheKeyGenerator.dashboard_individual(user_id, year, month)

def get_aggregation_cache_key(level: str, entity_id: str, year: int, month: int) -> str:
    return CacheKeyGenerator.aggregation(level, entity_id, year, month)

def get_kpi_cache_key(kpi_id: str) -> str:
    return CacheKeyGenerator.kpi(kpi_id)

def get_target_cache_key(kpi_id: str, user_id: str, year: int) -> str:
    return CacheKeyGenerator.target(kpi_id, user_id, year)

def invalidate_kpi_cache(kpi_id: str, user_ids: Optional[list] = None) -> None:
    cache.delete(CacheKeyGenerator.kpi(kpi_id))
    cache.delete_pattern(f"kpi:score:{kpi_id}:*")
    cache.delete_pattern(f"kpi:target:{kpi_id}:*")
    if user_ids:
        for user_id in user_ids:
            invalidate_user_dashboards(user_id)

def invalidate_user_dashboards(user_id: str) -> None:
    cache.delete_pattern(f"kpi:dashboard:individual:{user_id}:*")
    cache.delete_pattern(f"kpi:dashboard:manager:{user_id}:*")

def invalidate_tenant_dashboards(tenant_id: str) -> None:
    cache.delete_pattern(f"kpi:dashboard:executive:{tenant_id}:*")

def invalidate_aggregation_cache(level: str, entity_id: str) -> None:
    cache.delete_pattern(f"kpi:aggregation:{level}:{entity_id}:*")