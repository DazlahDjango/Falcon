from typing import List, Dict, Any, Optional
from uuid import UUID
from django.core.cache import cache
from apps.structure.models.employment import Employment
from apps.structure.models.employment import Employment
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.constants import DEFAULT_MAX_DIRECT_REPORTS

class SpanOfControl:
    def __init__(self):
        self._cache = cache
    
    def calculate_span(self, manager_id: UUID) -> Dict[str, Any]:
        manager = Employment.objects.get(id=manager_id, is_deleted=False)
        if manager.position:
            direct_reports = Employment.objects.filter(
                position__reports_to=manager.position,
                is_current=True,
                is_active=True,
                is_deleted=False,
                tenant_id=manager.tenant_id
            )
        else:
            direct_reports = Employment.objects.none()
        interim_reports = InterimAssignment.objects.filter(interim_manager=manager, is_active=True, is_deleted=False)
        total_direct = direct_reports.count()
        total_interim = interim_reports.count()
        return {
            'manager_id': str(manager.user_id),
            'direct_reports_count': total_direct,
            'interim_reports_count': total_interim,
            'total_reports': total_direct + total_interim,
            'direct_reports': [str(emp.user_id) for emp in direct_reports],
            'interim_reports': [str(ia.employee.user_id) for ia in interim_reports]
        }
    
    def get_span_by_level(self, tenant_id: UUID, level: Optional[str] = None) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_manager=True,
            is_current=True,
            is_active=True,
            is_deleted=False
        )
        spans = []
        for emp in employments:
            span = self.calculate_span(emp.id)
            if level:
                if emp.position and emp.position.level == level:
                    spans.append(span)
            else:
                spans.append(span)
        return spans
    
    def get_average_span(self, tenant_id: UUID) -> Dict[str, float]:
        spans = self.get_span_by_level(tenant_id, None)
        if not spans:
            return {'average_direct': 0.0, 'average_interim': 0.0, 'average_total': 0.0}
        total_direct = sum(s['direct_reports_count'] for s in spans)
        total_interim = sum(s['interim_reports_count'] for s in spans)
        count = len(spans)
        return {
            'average_direct': round(total_direct / count, 2),
            'average_interim': round(total_interim / count, 2),
            'average_total': round((total_direct + total_interim) / count, 2)
        }
    
    def get_max_span(self, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        spans = self.get_span_by_level(tenant_id, None)
        if not spans:
            return None
        return max(spans, key=lambda x: x['total_reports'])
    
    def get_min_span(self, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        spans = self.get_span_by_level(tenant_id, None)
        if not spans:
            return None
        return min(spans, key=lambda x: x['total_reports'])
    
    def get_span_distribution(self, tenant_id: UUID) -> Dict[str, int]:
        spans = self.get_span_by_level(tenant_id, None)
        distribution = {
            '0': 0,
            '1-5': 0,
            '6-10': 0,
            '11-15': 0,
            '16-20': 0,
            '20+': 0
        }
        for span in spans:
            total = span['total_reports']
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
    
    def identify_overloaded_managers(self, tenant_id: UUID, threshold: int = 15) -> List[Dict[str, Any]]:
        spans = self.get_span_by_level(tenant_id, None)
        return [s for s in spans if s['total_reports'] > threshold]
    
    def identify_underutilized_managers(self, tenant_id: UUID, threshold: int = 3) -> List[Dict[str, Any]]:
        spans = self.get_span_by_level(tenant_id, None)
        return [s for s in spans if s['total_reports'] < threshold]
    
    def get_recommended_span(self, manager_id: UUID) -> str:
        span = self.calculate_span(manager_id)
        if span['total_reports'] > 15:
            return 'overloaded'
        elif span['total_reports'] < 3:
            return 'underutilized'
        else:
            return 'optimal'
    
    def clear_cache(self, tenant_id: UUID) -> None:
        keys = self._cache.keys(f"structure:span:{tenant_id}:*")
        for key in keys:
            self._cache.delete(key)