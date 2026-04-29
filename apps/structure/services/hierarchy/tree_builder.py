from django.db import models
from django.core.cache import cache
from typing import Dict, List, Optional, Any
from uuid import UUID
from ...models.department import Department
from ...models.team import Team
from ...models.employment import Employment
from ...constants import CACHE_KEY_DEPARTMENT_TREE, DEFAULT_MAX_CACHE_TTL_SECONDS


class TreeBuilder:
    def __init__(self):
        self._cache = cache
    
    def build_department_tree(self, tenant_id: UUID, include_inactive: bool = False, use_cache: bool = True) -> List[Dict[str, Any]]:
        cache_key = CACHE_KEY_DEPARTMENT_TREE.format(tenant_id=tenant_id)
        if use_cache:
            cached = self._cache.get(cache_key)
            if cached:
                return cached
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )
        if not include_inactive:
            departments = departments.filter(is_active=True)
        departments = departments.select_related('parent').order_by('code')
        dept_map: Dict[UUID, Dict[str, Any]] = {}
        tree: List[Dict[str, Any]] = []
        for dept in departments:
            dept_dict = {
                'id': str(dept.id),
                'name': dept.name,
                'code': dept.code,
                'description': dept.description,
                'depth': dept.depth,
                'path': dept.path,
                'parent_id': str(dept.parent_id) if dept.parent_id else None,
                'headcount_limit': dept.headcount_limit,
                'sensitivity_level': dept.sensitivity_level,
                'is_active': dept.is_active,
                'children': [],
                'stats': {
                    'team_count': 0,
                    'employee_count': 0,
                    'sub_department_count': 0
                }
            }
            dept_map[dept.id] = dept_dict
        for dept in departments:
            if dept.parent_id and dept.parent_id in dept_map:
                dept_map[dept.parent_id]['children'].append(dept_map[dept.id])
                dept_map[dept.parent_id]['stats']['sub_department_count'] += 1
            else:
                tree.append(dept_map[dept.id])
        for dept in departments:
            team_count = Team.objects.filter(department_id=dept.id, tenant_id=tenant_id, is_deleted=False).count()
            dept_map[dept.id]['stats']['team_count'] = team_count
        if use_cache:
            self._cache.set(cache_key, tree, DEFAULT_MAX_CACHE_TTL_SECONDS)
        self._enrich_with_employee_counts(tenant_id, dept_map)
        return tree
    
    def _enrich_with_employee_counts(self, tenant_id: UUID, dept_map: Dict[UUID, Dict[str, Any]]) -> None:
        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).values('department_id').annotate(count=models.Count('user_id'))
        for emp in employments:
            dept_id = emp['department_id']
            if dept_id in dept_map:
                dept_map[dept_id]['stats']['employee_count'] = emp['count']
        def propagate_counts(node: Dict[str, Any]) -> int:
            total = node['stats']['employee_count']
            for child in node['children']:
                total += propagate_counts(child)
            node['stats']['total_employees'] = total
            return total
        for node in list(dept_map.values()):
            if node['parent_id'] is None:
                propagate_counts(node)
    
    def build_team_tree(self, department_id: UUID, tenant_id: UUID, include_inactive: bool = False) -> List[Dict[str, Any]]:
        teams = Team.objects.filter(
            department_id=department_id,
            tenant_id=tenant_id,
            is_deleted=False
        )
        if not include_inactive:
            teams = teams.filter(is_active=True)
        teams = teams.select_related('parent_team', 'department').order_by('code')
        team_map: Dict[UUID, Dict[str, Any]] = {}
        tree: List[Dict[str, Any]] = []
        for team in teams:
            team_dict = {
                'id': str(team.id),
                'name': team.name,
                'code': team.code,
                'description': team.description,
                'department_id': str(team.department_id),
                'parent_team_id': str(team.parent_team_id) if team.parent_team_id else None,
                'team_lead': str(team.team_lead) if team.team_lead else None,
                'max_members': team.max_members,
                'is_active': team.is_active,
                'children': [],
                'member_count': 0
            }
            team_map[team.id] = team_dict
        for team in teams:
            if team.parent_team_id and team.parent_team_id in team_map:
                team_map[team.parent_team_id]['children'].append(team_map[team.id])
            else:
                tree.append(team_map[team.id])
        employments = Employment.objects.filter(
            department_id=department_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True,
            team__isnull=False
        ).values('team_id').annotate(count=models.Count('user_id'))
        for emp in employments:
            team_id = emp['team_id']
            if team_id in team_map:
                team_map[team_id]['member_count'] = emp['count']
        return tree
    
    def build_full_org_tree(self, tenant_id: UUID) -> Dict[str, Any]:
        department_tree = self.build_department_tree(tenant_id)
        for dept in department_tree:
            dept['teams'] = self.build_team_tree(UUID(dept['id']), tenant_id)
            for team in dept['teams']:
                team['members'] = self._get_team_members(UUID(team['id']), tenant_id)
        return {
            'tenant_id': str(tenant_id),
            'departments': department_tree,
            'built_at': models.DateTimeField(auto_now=True).name
        }
    
    def _get_team_members(self, team_id: UUID, tenant_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            team_id=team_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [{
            'user_id': str(emp.user_id),
            'position': emp.position.title if emp.position else None,
            'position_code': emp.position.job_code if emp.position else None,
            'is_manager': emp.is_manager,
            'is_executive': emp.is_executive
        } for emp in employments]
    
    def get_branch(self, root_department_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        root_department = Department.objects.filter(
            id=root_department_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()
        if not root_department:
            return {}
        full_tree = self.build_department_tree(tenant_id)
        def find_branch(nodes: List[Dict[str, Any]], target_id: str) -> Optional[Dict[str, Any]]:
            for node in nodes:
                if node['id'] == target_id:
                    return node
                found = find_branch(node['children'], target_id)
                if found:
                    return found
            return None
        return find_branch(full_tree, str(root_department_id)) or {}
    
    def clear_cache(self, tenant_id: UUID) -> None:
        cache_key = CACHE_KEY_DEPARTMENT_TREE.format(tenant_id=tenant_id)
        self._cache.delete(cache_key)