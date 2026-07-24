# apps/reportplt/services/filters/filter_engine.py
from typing import Dict, Any, List, Optional, Union
from django.db import models
from django.db.models import Q
from django.core.exceptions import ValidationError
from apps.reportplt.models import ReportFilter
from apps.reportplt.exceptions import FilterError, FilterValidationError
from apps.reportplt.constants import FilterType

class FilterEngine:
    def __init__(self, filter_definitions: Optional[List[Dict]] = None):
        self.filter_definitions = filter_definitions or []
        self.applied_filters = {}

    def add_filter(self, filter_def: Dict) -> 'FilterEngine':
        self.filter_definitions.append(filter_def)
        return self

    def add_filters(self, filter_defs: List[Dict]) -> 'FilterEngine':
        self.filter_definitions.extend(filter_defs)
        return self

    def apply(self, queryset: models.QuerySet, filter_values: Dict[str, Any]) -> models.QuerySet:
        if not filter_values:
            return queryset
        self.applied_filters = {}
        for filter_def in self.filter_definitions:
            filter_name = filter_def.get('name')
            filter_type = filter_def.get('type')
            if filter_name in filter_values:
                value = filter_values[filter_name]
                if value is not None and value != '' and value != []:
                    self._validate_filter_value(filter_def, value)
                    queryset = self._apply_single_filter(queryset, filter_def, value)
                    self.applied_filters[filter_name] = value
        return queryset

    def _apply_single_filter(self, queryset: models.QuerySet, filter_def: Dict, value: Any) -> models.QuerySet:
        filter_type = filter_def.get('type')
        field = filter_def.get('field')
        if not field:
            raise FilterError(f"Field not specified for filter: {filter_def.get('name')}")
        if filter_type == FilterType.DATE_RANGE:
            return self._apply_date_range(queryset, field, value)
        elif filter_type == FilterType.DROPDOWN:
            return self._apply_dropdown(queryset, field, value)
        elif filter_type == FilterType.MULTI_SELECT:
            return self._apply_multi_select(queryset, field, value)
        elif filter_type == FilterType.TEXT:
            return self._apply_text(queryset, field, value)
        elif filter_type == FilterType.NUMBER:
            return self._apply_number(queryset, field, value)
        elif filter_type == FilterType.BOOLEAN:
            return self._apply_boolean(queryset, field, value)
        elif filter_type == FilterType.HIERARCHY:
            return self._apply_hierarchy(queryset, field, value)
        elif filter_type == FilterType.CUSTOM:
            return self._apply_custom(queryset, filter_def, value)
        return queryset

    def _apply_date_range(self, queryset: models.QuerySet, field: str, value: Dict) -> models.QuerySet:
        if not isinstance(value, dict):
            raise FilterValidationError("Date range must be a dictionary")
        start = value.get('start')
        end = value.get('end')
        if start:
            queryset = queryset.filter(**{f"{field}__gte": start})
        if end:
            queryset = queryset.filter(**{f"{field}__lte": end})
        return queryset

    def _apply_dropdown(self, queryset: models.QuerySet, field: str, value: Any) -> models.QuerySet:
        if value is None or value == '':
            return queryset
        return queryset.filter(**{field: value})

    def _apply_multi_select(self, queryset: models.QuerySet, field: str, value: List) -> models.QuerySet:
        if not value or not isinstance(value, list):
            return queryset
        if len(value) == 1:
            return queryset.filter(**{field: value[0]})
        return queryset.filter(**{f"{field}__in": value})

    def _apply_text(self, queryset: models.QuerySet, field: str, value: str) -> models.QuerySet:
        if not value:
            return queryset
        return queryset.filter(**{f"{field}__icontains": value})

    def _apply_number(self, queryset: models.QuerySet, field: str, value: Union[int, float, Dict]) -> models.QuerySet:
        if isinstance(value, dict):
            if 'min' in value and value['min'] is not None:
                queryset = queryset.filter(**{f"{field}__gte": value['min']})
            if 'max' in value and value['max'] is not None:
                queryset = queryset.filter(**{f"{field}__lte": value['max']})
            return queryset
        if value is not None:
            return queryset.filter(**{field: value})
        return queryset

    def _apply_boolean(self, queryset: models.QuerySet, field: str, value: bool) -> models.QuerySet:
        return queryset.filter(**{field: value})

    def _apply_hierarchy(self, queryset: models.QuerySet, field: str, value: Any) -> models.QuerySet:
        if not value:
            return queryset
        if isinstance(value, list):
            return queryset.filter(**{f"{field}__in": value})
        return queryset.filter(**{field: value})

    def _apply_custom(self, queryset: models.QuerySet, filter_def: Dict, value: Any) -> models.QuerySet:
        custom_func = filter_def.get('custom_func')
        if custom_func and callable(custom_func):
            return custom_func(queryset, value)
        return queryset

    def _validate_filter_value(self, filter_def: Dict, value: Any) -> bool:
        filter_type = filter_def.get('type')
        required = filter_def.get('required', False)
        if required and (value is None or value == '' or value == []):
            raise FilterValidationError(f"Filter {filter_def.get('name')} is required")
        validation = filter_def.get('validation', {})
        if validation:
            if validation.get('min_length') and isinstance(value, str) and len(value) < validation['min_length']:
                raise FilterValidationError(f"Value must be at least {validation['min_length']} characters")
            if validation.get('max_length') and isinstance(value, str) and len(value) > validation['max_length']:
                raise FilterValidationError(f"Value cannot exceed {validation['max_length']} characters")
            if validation.get('min') and isinstance(value, (int, float)) and value < validation['min']:
                raise FilterValidationError(f"Value must be at least {validation['min']}")
            if validation.get('max') and isinstance(value, (int, float)) and value > validation['max']:
                raise FilterValidationError(f"Value cannot exceed {validation['max']}")
        if filter_type == FilterType.DROPDOWN and filter_def.get('options'):
            if value not in filter_def['options']:
                raise FilterValidationError(f"Invalid option: {value}")
        if filter_type == FilterType.MULTI_SELECT and filter_def.get('options'):
            for val in value:
                if val not in filter_def['options']:
                    raise FilterValidationError(f"Invalid option: {val}")
        return True

    def get_applied_filters(self) -> Dict:
        return self.applied_filters

    def build_filter_conditions(self, filter_values: Dict) -> Q:
        conditions = Q()
        for filter_def in self.filter_definitions:
            filter_name = filter_def.get('name')
            field = filter_def.get('field')
            if filter_name in filter_values and field:
                value = filter_values[filter_name]
                if value is not None and value != '' and value != []:
                    conditions &= Q(**{field: value})
        return conditions

    def filter_by_tenant(self, queryset: models.QuerySet, tenant_id: str) -> models.QuerySet:
        if hasattr(queryset.model, 'tenant_id'):
            return queryset.filter(tenant_id=tenant_id)
        return queryset

    def filter_by_owner(self, queryset: models.QuerySet, owner_id: str) -> models.QuerySet:
        if hasattr(queryset.model, 'owner_id'):
            return queryset.filter(owner_id=owner_id)
        if hasattr(queryset.model, 'created_by_id'):
            return queryset.filter(created_by_id=owner_id)
        return queryset

    def filter_by_date_range(self, queryset: models.QuerySet, field: str, start: Optional[str] = None, end: Optional[str] = None) -> models.QuerySet:
        if start:
            queryset = queryset.filter(**{f"{field}__gte": start})
        if end:
            queryset = queryset.filter(**{f"{field}__lte": end})
        return queryset

    def filter_by_status(self, queryset: models.QuerySet, field: str, status_list: List[str]) -> models.QuerySet:
        if not status_list:
            return queryset
        if len(status_list) == 1:
            return queryset.filter(**{field: status_list[0]})
        return queryset.filter(**{f"{field}__in": status_list})

    def filter_by_search(self, queryset: models.QuerySet, search_fields: List[str], query: str) -> models.QuerySet:
        if not query:
            return queryset
        conditions = Q()
        for field in search_fields:
            conditions |= Q(**{f"{field}__icontains": query})
        return queryset.filter(conditions)

    def apply_pagination(self, queryset: models.QuerySet, page: int = 1, page_size: int = 100) -> models.QuerySet:
        offset = (page - 1) * page_size
        return queryset[offset:offset + page_size]

    def apply_sorting(self, queryset: models.QuerySet, sort_field: str, order: str = 'asc') -> models.QuerySet:
        if order == 'desc':
            sort_field = f"-{sort_field}"
        return queryset.order_by(sort_field)

class FilterContext:
    def __init__(self):
        self._filters = {}
        self._active_filters = {}

    def register_filter(self, name: str, filter_instance) -> None:
        self._filters[name] = filter_instance

    def get_filter(self, name: str):
        return self._filters.get(name)

    def set_active_filter(self, name: str, value: Any) -> None:
        self._active_filters[name] = value

    def get_active_filter(self, name: str) -> Any:
        return self._active_filters.get(name)

    def get_all_active_filters(self) -> Dict:
        return self._active_filters.copy()

    def clear_active_filters(self) -> None:
        self._active_filters.clear()

    def has_active_filters(self) -> bool:
        return bool(self._active_filters)