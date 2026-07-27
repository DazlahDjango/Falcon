# apps/reportplt/services/generation/query_builder.py
from typing import Dict, Any, List, Optional, Union
from django.db import models
from django.db.models import Q, Count, Sum, Avg, Min, Max
from django.core.exceptions import FieldError
from apps.accounts.models import User
from apps.reportplt.exceptions import QueryBuilderError

class QueryBuilder:
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.model = None
        self.queryset = None
        self.filters = {}
        self.sort_fields = []
        self.limit_count = None
        self.offset_count = None
        self.aggregations = {}

    def set_model(self, model_class):
        self.model = model_class
        self.queryset = model_class.objects.all()
        if hasattr(model_class, 'tenant_id') and self.user:
            self.queryset = self.queryset.filter(tenant_id=self.user.tenant_id)
        return self

    def add_filter(self, field: str, value: Any, operator: str = 'exact') -> 'QueryBuilder':
        if value is None or value == '':
            return self
        if operator == 'exact':
            self.filters[field] = value
        elif operator == 'contains':
            self.filters[f"{field}__icontains"] = value
        elif operator == 'startswith':
            self.filters[f"{field}__startswith"] = value
        elif operator == 'endswith':
            self.filters[f"{field}__endswith"] = value
        elif operator == 'gt':
            self.filters[f"{field}__gt"] = value
        elif operator == 'gte':
            self.filters[f"{field}__gte"] = value
        elif operator == 'lt':
            self.filters[f"{field}__lt"] = value
        elif operator == 'lte':
            self.filters[f"{field}__lte"] = value
        elif operator == 'in':
            self.filters[f"{field}__in"] = value
        elif operator == 'range':
            self.filters[f"{field}__range"] = value
        else:
            raise QueryBuilderError(f"Unsupported operator: {operator}")
        return self

    def add_filters(self, filters: Dict) -> 'QueryBuilder':
        for field, value in filters.items():
            if isinstance(value, dict):
                operator = value.get('operator', 'exact')
                val = value.get('value')
                self.add_filter(field, val, operator)
            else:
                self.add_filter(field, value)
        return self

    def add_sort(self, field: str, direction: str = 'asc') -> 'QueryBuilder':
        if direction == 'desc':
            self.sort_fields.append(f"-{field}")
        else:
            self.sort_fields.append(field)
        return self

    def add_sorts(self, sorts: List[Dict]) -> 'QueryBuilder':
        for sort in sorts:
            field = sort.get('field')
            direction = sort.get('direction', 'asc')
            if field:
                self.add_sort(field, direction)
        return self

    def set_limit(self, limit: int) -> 'QueryBuilder':
        self.limit_count = limit
        return self

    def set_offset(self, offset: int) -> 'QueryBuilder':
        self.offset_count = offset
        return self

    def add_aggregation(self, field: str, agg_type: str, alias: Optional[str] = None) -> 'QueryBuilder':
        agg_map = {
            'count': Count,
            'sum': Sum,
            'avg': Avg,
            'min': Min,
            'max': Max
        }
        agg_class = agg_map.get(agg_type)
        if not agg_class:
            raise QueryBuilderError(f"Unsupported aggregation type: {agg_type}")
        alias = alias or f"{field}_{agg_type}"
        self.aggregations[alias] = agg_class(field)
        return self

    def add_aggregations(self, aggregations: List[Dict]) -> 'QueryBuilder':
        for agg in aggregations:
            field = agg.get('field')
            agg_type = agg.get('type', 'count')
            alias = agg.get('alias')
            self.add_aggregation(field, agg_type, alias)
        return self

    def build(self) -> models.QuerySet:
        if not self.queryset:
            raise QueryBuilderError("Model not set")
        qs = self.queryset
        if self.filters:
            qs = qs.filter(**self.filters)
        if self.sort_fields:
            qs = qs.order_by(*self.sort_fields)
        if self.limit_count:
            qs = qs[:self.limit_count]
        return qs

    def build_with_pagination(self, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
        qs = self.build()
        total = qs.count()
        offset = (page - 1) * page_size
        data = qs[offset:offset + page_size]
        return {
            'data': data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        }

    def build_aggregated(self) -> Dict:
        if not self.queryset:
            raise QueryBuilderError("Model not set")
        qs = self.queryset
        if self.filters:
            qs = qs.filter(**self.filters)
        if self.aggregations:
            result = qs.aggregate(**self.aggregations)
            return result
        return {}

    def build_count(self) -> int:
        qs = self.build()
        return qs.count()

    def build_exists(self) -> bool:
        qs = self.build()
        return qs.exists()

    def build_distinct(self, *fields) -> List:
        qs = self.build()
        return qs.values(*fields).distinct()

    def build_values(self, *fields) -> List:
        qs = self.build()
        return list(qs.values(*fields))

    def build_values_list(self, *fields, flat=False) -> List:
        qs = self.build()
        return list(qs.values_list(*fields, flat=flat))

    def build_raw(self, sql: str, params: Optional[List] = None) -> List:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(sql, params or [])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def build_for_report(self, model_class, filters: Dict, sorts: List, limit: int = None) -> Dict:
        self.set_model(model_class)
        self.add_filters(filters)
        self.add_sorts(sorts)
        if limit:
            self.set_limit(limit)
        data = self.build()
        return {'data': data, 'count': data.count() if hasattr(data, 'count') else len(data)}

    def get_field_names(self) -> List[str]:
        if not self.model:
            return []
        return [field.name for field in self.model._meta.fields]

    def get_related_fields(self) -> List[str]:
        if not self.model:
            return []
        return [field.name for field in self.model._meta.related_objects]

    def validate_field(self, field: str) -> bool:
        if not self.model:
            return False
        try:
            self.model._meta.get_field(field)
            return True
        except FieldError:
            return False

    def clear(self) -> 'QueryBuilder':
        self.model = None
        self.queryset = None
        self.filters = {}
        self.sort_fields = []
        self.limit_count = None
        self.offset_count = None
        self.aggregations = {}
        return self