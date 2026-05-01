from typing import Dict, Any, List, Optional
from uuid import UUID
from django.db import models
from django.core.cache import cache
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine
from ...constants import DEFAULT_MAX_DIRECT_REPORTS

class SpanOfControlService:
    def __init__(self):
        self._cache = cache
    
    def get_direct_report_count(self, manager_user_id: UUID, tenant_id: UUID, relation_type: str = 'solid') -> int:
        cache_key = f"structure:span:direct:{tenant_id}:{manager_user_id}:{relation_type}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached
        count = ReportingLine.objects.filter(
            manager__user_id=manager_user_id,
            relation_type=relation_type,
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).count()
        self._cache.set(cache_key, count, 300)
        return count
    
    def get_indirect_report_count(self, manager_user_id: UUID, tenant_id: UUID) -> int:
        cache_key = f"structure:span:indirect:{tenant_id}:{manager_user_id}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached
        direct_reports = ReportingLine.objects.filter(
            manager__user_id=manager_user_id,
            relation_type='solid',
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('employee')
        indirect_count = 0
        for report in direct_reports:
            indirect_count += self.get_direct_report_count(report.employee.user_id, tenant_id)
        self._cache.set(cache_key, indirect_count, 300)
        return indirect_count
    
    def get_total_span(self, manager_user_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        direct = self.get_direct_report_count(manager_user_id, tenant_id)
        indirect = self.get_indirect_report_count(manager_user_id, tenant_id)
        return {
            'manager_user_id': str(manager_user_id),
            'direct_reports': direct,
            'indirect_reports': indirect,
            'total_reports': direct + indirect,
            'is_healthy': direct <= DEFAULT_MAX_DIRECT_REPORTS,
            'warning': direct > DEFAULT_MAX_DIRECT_REPORTS
        }
    
    def get_organization_span_report(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        managers = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True,
            is_manager=True
        ).values_list('user_id', flat=True).distinct()
        report = []
        for manager_id in managers:
            report.append(self.get_total_span(manager_id, tenant_id))
        return sorted(report, key=lambda x: x['total_reports'], reverse=True)
    
    def get_average_span(self, tenant_id: UUID) -> Dict[str, float]:
        report = self.get_organization_span_report(tenant_id)
        
        if not report:
            return {'average_direct': 0.0, 'average_indirect': 0.0, 'average_total': 0.0}
        total_direct = sum(r['direct_reports'] for r in report)
        total_indirect = sum(r['indirect_reports'] for r in report)
        count = len(report)
        return {
            'average_direct': round(total_direct / count, 2),
            'average_indirect': round(total_indirect / count, 2),
            'average_total': round((total_direct + total_indirect) / count, 2)
        }
    
    def get_span_distribution(self, tenant_id: UUID) -> Dict[str, int]:
        report = self.get_organization_span_report(tenant_id)
        distribution = {
            '0': 0,
            '1-5': 0,
            '6-10': 0,
            '11-15': 0,
            '16-20': 0,
            '20+': 0
        }
        for manager in report:
            total = manager['total_reports']
            if total == 0:
                distribution['0'] += 1
            elif total <= 5:
                distribution['1-5'] += 1
            elif total <= 10:
                distribution['6-10'] += 1
            elif total <= 15:
                distribution['11-15'] += 1
            elif total <= 20:
                distribution['16-20'] += 1
            else:
                distribution['20+'] += 1
        return distribution
    
    def check_span_limit_exceeded(self, manager_user_id: UUID, tenant_id: UUID, limit: Optional[int] = None) -> bool:
        if limit is None:
            limit = DEFAULT_MAX_DIRECT_REPORTS
        direct_count = self.get_direct_report_count(manager_user_id, tenant_id)
        return direct_count >= limit
    
    def identify_managers_with_span_warning(self, tenant_id: UUID, threshold: int = 15) -> List[Dict[str, Any]]:
        report = self.get_organization_span_report(tenant_id)
        return [m for m in report if m['total_reports'] > threshold]