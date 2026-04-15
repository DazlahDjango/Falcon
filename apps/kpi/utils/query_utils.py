import time
import functools
from typing import List, Dict, Any, Optional, Callable
from django.db import connection, reset_queries
from django.db.models import QuerySet, Prefetch, Model
from django.core.paginator import Paginator
import logging
logger = logging.getLogger(__name__)

class QueryOptimizer:
    @staticmethod
    def prefetch_scores(queryset: QuerySet) -> QuerySet:
        return queryset.prefetch_related(
            Prefetch('kpi'),
            Prefetch('user'),
            Prefetch('traffic_light'),
        )
    
    @staticmethod
    def prefetch_kpis(queryset: QuerySet) -> QuerySet:
        return queryset.select_related(
            'framework',
            'sector',
            'category',
            'owner',
            'department'
        ).prefetch_related(
            Prefetch('weights'),
            Prefetch('actuals'),
            Prefetch('scores'),
        )
    
    @staticmethod
    def prefetch_targets(queryset: QuerySet) -> QuerySet:
        return queryset.select_related(
            'kpi',
            'user'
        ).prefetch_related(
            Prefetch('monthly_phasing')
        )
    
    @staticmethod
    def prefetch_actuals(queryset: QuerySet) -> QuerySet:
        return queryset.select_related(
            'kpi',
            'user',
            'submitted_by'
        ).prefetch_related(
            Prefetch('validations'),
            Prefetch('evidence')
        )
    
    @staticmethod
    def paginate(queryset: QuerySet, page: int, page_size: int) -> Dict:
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        return {
            'items': list(page_obj.object_list),
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        }
    
    @staticmethod
    def only_fields(queryset: QuerySet, fields: List[str]) -> QuerySet:
        return queryset.only(*fields)
    
    @staticmethod
    def defer_fields(queryset: QuerySet, fields: List[str]) -> QuerySet:
        return queryset.defer(*fields)


class PrefetchManager:
    def __init__(self):
        self._prefetch_configs = {}
    
    def register(self, model_name: str, prefetch_fields: List[str]):
        self._prefetch_configs[model_name] = prefetch_fields
    
    def get_prefetch(self, model_name: str) -> List:
        fields = self._prefetch_configs.get(model_name, [])
        return [Prefetch(field) for field in fields]
    
    def apply(self, queryset: QuerySet, model_name: str) -> QuerySet:
        prefetch_objects = self.get_prefetch(model_name)
        return queryset.prefetch_related(*prefetch_objects)


class QueryDebugger:
    def __init__(self, threshold_ms: int = 100):
        self.threshold_ms = threshold_ms
        self.queries = []
    
    def __enter__(self):
        reset_queries()
        self.queries = []
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.queries = connection.queries
        slow_queries = [q for q in self.queries if float(q.get('time', 0)) > self.threshold_ms]
        if slow_queries:
            logger.warning(f"Found {len(slow_queries)} slow queries > {self.threshold_ms}ms")
            for q in slow_queries:
                logger.warning(f"Query: {q['sql'][:500]} | Time: {q['time']}ms")
    
    def get_stats(self) -> Dict:
        """Get query statistics"""
        total_queries = len(self.queries)
        total_time = sum(float(q.get('time', 0)) for q in self.queries)
        avg_time = total_time / total_queries if total_queries > 0 else 0
        return {
            'total_queries': total_queries,
            'total_time_ms': total_time,
            'avg_time_ms': avg_time,
            'slow_queries': [q for q in self.queries if float(q.get('time', 0)) > self.threshold_ms]
        }

def with_query_debug(threshold_ms: int = 100):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            with QueryDebugger(threshold_ms) as debugger:
                result = func(*args, **kwargs)
                stats = debugger.get_stats()
                
                if stats['total_queries'] > 10:
                    logger.warning(f"Function {func.__name__} executed {stats['total_queries']} queries")
                
                return result
        return wrapper
    return decorator

def bulk_operation(model_class, items: List[Dict], batch_size: int = 500) -> Dict:
    results = {'created': 0, 'updated': 0, 'errors': []}
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        try:
            objects = [model_class(**item) for item in batch]
            model_class.objects.bulk_create(objects, ignore_conflicts=True)
            results['created'] += len(objects)
        except Exception as e:
            for item in batch:
                try:
                    obj, created = model_class.objects.get_or_create(**item)
                    if created:
                        results['created'] += 1
                    else:
                        results['updated'] += 1
                except Exception as e2:
                    results['errors'].append({'item': item, 'error': str(e2)})
    return results