# apps/reportplt/services/filters/hierarchical_filter.py
from typing import List, Dict, Any, Optional, Set, Union
from django.db import models
from django.db.models import Q
from django.core.exceptions import ValidationError
from apps.accounts.models import User
from apps.structure.models import Department, Unit

class HierarchicalFilter:
    def __init__(self):
        self._hierarchy_cache = {}

    def filter_by_department_hierarchy(self, queryset: models.QuerySet, department_id: str, include_children: bool = True) -> models.QuerySet:
        if not department_id:
            return queryset
        if include_children:
            dept_ids = self._get_department_tree(department_id)
            return self._filter_by_department_ids(queryset, dept_ids)
        return self._filter_by_department_ids(queryset, [department_id])

    def filter_by_team_hierarchy(self, queryset: models.QuerySet, team_id: str, include_children: bool = True) -> models.QuerySet:
        if not team_id:
            return queryset
        if include_children:
            team_ids = self._get_team_tree(team_id)
            return self._filter_by_team_ids(queryset, team_ids)
        return self._filter_by_team_ids(queryset, [team_id])

    def filter_by_manager_hierarchy(self, queryset: models.QuerySet, manager_id: str, include_self: bool = True) -> models.QuerySet:
        if not manager_id:
            return queryset
        try:
            manager = User.objects.get(id=manager_id)
            team_ids = manager.get_team_ids()
            if include_self:
                team_ids.append(manager_id)
            if hasattr(queryset.model, 'owner_id'):
                return queryset.filter(owner_id__in=team_ids)
            if hasattr(queryset.model, 'user_id'):
                return queryset.filter(user_id__in=team_ids)
            if hasattr(queryset.model, 'created_by_id'):
                return queryset.filter(created_by_id__in=team_ids)
            return queryset
        except User.DoesNotExist:
            return queryset

    def filter_by_org_hierarchy(self, queryset: models.QuerySet, org_filter: Dict) -> models.QuerySet:
        if not org_filter:
            return queryset
        conditions = Q()
        if 'department_id' in org_filter:
            dept_ids = self._get_department_tree(org_filter['department_id'])
            conditions &= Q(department_id__in=dept_ids)
        if 'team_id' in org_filter:
            team_ids = self._get_team_tree(org_filter['team_id'])
            conditions &= Q(team_id__in=team_ids)
        if 'manager_id' in org_filter:
            manager = User.objects.get(id=org_filter['manager_id'])
            team_ids = manager.get_team_ids()
            conditions &= Q(owner_id__in=team_ids)
        return queryset.filter(conditions)

    def _get_department_tree(self, department_id: str) -> List[str]:
        cache_key = f"dept_{department_id}"
        if cache_key in self._hierarchy_cache:
            return self._hierarchy_cache[cache_key]
        try:
            department = Department.objects.get(id=department_id)
            tree = self._get_department_children(department)
            dept_ids = [str(department.id)] + [str(d.id) for d in tree]
            self._hierarchy_cache[cache_key] = dept_ids
            return dept_ids
        except Department.DoesNotExist:
            return [department_id]

    def _get_department_children(self, department: Department) -> List[Department]:
        children = []
        for child in department.children.all():
            children.append(child)
            children.extend(self._get_department_children(child))
        return children

    def _get_team_tree(self, team_id: str) -> List[str]:
        cache_key = f"team_{team_id}"
        if cache_key in self._hierarchy_cache:
            return self._hierarchy_cache[cache_key]
        try:
            unit = Unit.objects.get(id=team_id)
            tree = self._get_team_children(unit)
            team_ids = [str(unit.id)] + [str(t.id) for t in tree]
            self._hierarchy_cache[cache_key] = team_ids
            return team_ids
        except Unit.DoesNotExist:
            return [team_id]

    def _get_team_children(self, unit: Unit) -> List[Unit]:
        children = []
        for child in unit.children.all():
            children.append(child)
            children.extend(self._get_team_children(child))
        return children

    def _filter_by_department_ids(self, queryset: models.QuerySet, dept_ids: List[str]) -> models.QuerySet:
        if hasattr(queryset.model, 'department_id'):
            return queryset.filter(department_id__in=dept_ids)
        if hasattr(queryset.model, 'department'):
            return queryset.filter(department__in=dept_ids)
        return queryset

    def _filter_by_team_ids(self, queryset: models.QuerySet, team_ids: List[str]) -> models.QuerySet:
        if hasattr(queryset.model, 'unit_id'):
            return queryset.filter(unit_id__in=team_ids)
        if hasattr(queryset.model, 'unit'):
            return queryset.filter(unit__in=team_ids)
        if hasattr(queryset.model, 'team_id'):
            return queryset.filter(team_id__in=team_ids)
        if hasattr(queryset.model, 'team'):
            return queryset.filter(team__in=team_ids)
        return queryset

    def get_org_hierarchy_for_user(self, user: User) -> Dict:
        result = {
            'user_id': str(user.id),
            'user_name': user.get_full_name(),
            'department': None,
            'team': None,
            'manager': None,
            'subordinates': []
        }
        if user.department:
            result['department'] = {
                'id': str(user.department.id) if hasattr(user.department, 'id') else user.department,
                'name': getattr(user.department, 'name', str(user.department))
            }
        from apps.structure.models import Employment
        active_emp = Employment.objects.filter(user_id=user.id, is_current=True, is_active=True, is_deleted=False).select_related('position__unit').first()
        if active_emp and active_emp.position and active_emp.position.unit:
            result['team'] = {
                'id': str(active_emp.position.unit.id),
                'name': active_emp.position.unit.name
            }
        if user.manager:
            result['manager'] = {
                'id': str(user.manager.id),
                'name': user.manager.get_full_name()
            }
        for subordinate in user.get_direct_reports():
            result['subordinates'].append({
                'id': str(subordinate.id),
                'name': subordinate.get_full_name(),
                'department': getattr(subordinate, 'department', None)
            })
        return result

    def get_filter_options_for_hierarchy(self, hierarchy_type: str, parent_id: Optional[str] = None) -> List[Dict]:
        if hierarchy_type == 'department':
            return self._get_department_options(parent_id)
        elif hierarchy_type == 'team':
            return self._get_team_options(parent_id)
        elif hierarchy_type == 'user':
            return self._get_user_options(parent_id)
        return []

    def _get_department_options(self, parent_id: Optional[str] = None) -> List[Dict]:
        departments = Department.objects.all()
        if parent_id:
            departments = departments.filter(parent_id=parent_id)
        return [
            {'value': str(d.id), 'label': d.name, 'has_children': d.children.exists()}
            for d in departments
        ]

    def _get_team_options(self, parent_id: Optional[str] = None) -> List[Dict]:
        units = Unit.objects.all()
        if parent_id:
            units = units.filter(parent_id=parent_id)
        return [
            {'value': str(u.id), 'label': u.name, 'has_children': u.children.exists()}
            for u in units
        ]

    def _get_user_options(self, parent_id: Optional[str] = None) -> List[Dict]:
        users = User.objects.filter(is_active=True)
        if parent_id:
            manager = User.objects.get(id=parent_id)
            users = users.filter(manager=manager)
        return [
            {'value': str(u.id), 'label': u.get_full_name()}
            for u in users
        ]

    def clear_cache(self):
        self._hierarchy_cache.clear()