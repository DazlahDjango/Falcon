# apps/dashboard/services/hierarchy_service.py
from django.db import models
from django.core.cache import cache
from typing import List, Dict, Any, Optional
from apps.dashboard.constants import TrafficLight, Defaults
from apps.dashboard.exceptions import HierarchyLoopError
from .base_service import BaseDashboardService


class HierarchyService(BaseDashboardService):
    """Handles org hierarchy traversal, team aggregation, and drill-down."""
    
    def get_user_team(self, user_id: str, include_self: bool = True) -> List[Dict]:
        """Get all team members under a user (recursive)."""
        cache_key = f"hierarchy:team:{self.tenant_id}:{user_id}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached
        
        from apps.accounts.models import User
        
        try:
            user = User.objects.get(id=user_id, tenant_id=self.tenant_id)
        except User.DoesNotExist:
            return []
        
        team = self._build_team_tree(user, visited=set())
        
        if include_self:
            team.insert(0, self._serialize_user(user))
        
        self._set_cached(cache_key, team, Defaults.CACHE_TTL)
        return team
    
    def _build_team_tree(self, user, visited: set, depth: int = 0) -> List[Dict]:
        if depth > Defaults.MAX_HIERARCHY_DEPTH:
            return []
        
        if user.id in visited:
            raise HierarchyLoopError(user_id=str(user.id), path=list(visited))
        
        visited.add(user.id)
        team = []
        
        direct_reports = user.direct_reports.filter(is_active=True, tenant_id=self.tenant_id)
        
        for report in direct_reports:
            if report.id not in visited:
                team.append(self._serialize_user(report))
                team.extend(self._build_team_tree(report, visited.copy(), depth + 1))
        return team
    
    def _serialize_user(self, user) -> Dict:
        from apps.kpi.services import ScoreAggregator
        calc_service = ScoreAggregator(self.user, self.tenant_id)
        aggregated_score = calc_service.aggregate_user(user.id)
        traffic_light = self._get_traffic_light_from_score(aggregated_score)
        return {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'title': user.title,
            'manager_id': str(user.manager_id) if user.manager_id else None,
            'aggregated_score': aggregated_score,
            'traffic_light': traffic_light,
            'department': user.department,
            'is_manager': user.is_manager,
            'direct_report_count': user.direct_reports.filter(is_active=True).count()
        }
    def _get_traffic_light_from_score(self, score: float) -> str:
        if score is None:
            return TrafficLight.YELLOW
        if score >= 90:
            return TrafficLight.GREEN
        elif score >= 50:
            return TrafficLight.YELLOW
        return TrafficLight.RED
    
    def get_team_aggregate(self, user_id: str) -> Dict:
        team = self.get_user_team(user_id, include_self=False)
        if not team:
            return {
                'total_members': 0,
                'green_count': 0,
                'yellow_count': 0,
                'red_count': 0,
                'average_score': 0,
                'submission_rate': 0
            }
        scores = [m.get('aggregated_score', 0) for m in team if m.get('aggregated_score')]
        status_counts = {'green': 0, 'yellow': 0, 'red': 0}
        for member in team:
            status = member.get('traffic_light', TrafficLight.YELLOW)
            status_counts[status] = status_counts.get(status, 0) + 1
        return {
            'total_members': len(team),
            'green_count': status_counts.get(TrafficLight.GREEN, 0),
            'yellow_count': status_counts.get(TrafficLight.YELLOW, 0),
            'red_count': status_counts.get(TrafficLight.RED, 0),
            'average_score': sum(scores) / len(scores) if scores else 0,
        }
    
    def drill_down_to_user(self, current_user_id: str, target_user_id: str) -> Dict:
        from django.core.exceptions import PermissionDenied
        team_ids = self._get_all_team_ids(current_user_id)
        if target_user_id not in team_ids and current_user_id != target_user_id:
            raise PermissionDenied(f"Cannot drill down to user {target_user_id}")
        from apps.accounts.models import User
        try:
            target_user = User.objects.get(id=target_user_id, tenant_id=self.tenant_id)
        except User.DoesNotExist:
            raise ValueError(f"User {target_user_id} not found")
        self._audit_log('drill_down', 'drill_down', {
            'from_user': current_user_id,
            'to_user': target_user_id
        })
        return self._serialize_user(target_user)
    
    def _get_all_team_ids(self, user_id: str) -> List[str]:
        team = self.get_user_team(user_id, include_self=True)
        return [m['id'] for m in team]
    
    def get_reporting_chain(self, user_id: str, include_self: bool = False) -> List[Dict]:
        from apps.accounts.models import User
        chain = []
        current_id = user_id
        visited = set()
        depth = 0
        while current_id and depth < Defaults.MAX_HIERARCHY_DEPTH:
            if current_id in visited:
                raise HierarchyLoopError(user_id=user_id, path=list(visited))
            visited.add(current_id)
            try:
                user = User.objects.get(id=current_id, tenant_id=self.tenant_id)
                chain.append(self._serialize_user(user))
                current_id = str(user.manager_id) if user.manager_id else None
                depth += 1
            except User.DoesNotExist:
                break
        if not include_self and chain:
            chain.pop(0)
        return chain
    
    def get_org_tree(self, root_user_id: Optional[str] = None) -> Dict:
        from apps.accounts.models import User
        root = None
        if root_user_id:
            try:
                root = User.objects.get(id=root_user_id, tenant_id=self.tenant_id)
            except User.DoesNotExist:
                pass
        if not root:
            root = User.objects.filter(
                tenant_id=self.tenant_id,
                is_active=True,
                manager__isnull=True
            ).first()
        if not root:
            return {}
        cache_key = f"hierarchy:org_tree:{self.tenant_id}:{root.id}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached
        tree = self._build_org_tree_node(root)
        self._set_cached(cache_key, tree, Defaults.CACHE_TTL * 2)
        return tree
    def _build_org_tree_node(self, user, depth: int = 0) -> Dict:
        if depth > Defaults.MAX_HIERARCHY_DEPTH:
            return {'id': str(user.id), 'truncated': True}
        node = self._serialize_user(user)
        node['children'] = []
        reports = user.direct_reports.filter(is_active=True, tenant_id=self.tenant_id)
        for report in reports:
            node['children'].append(self._build_org_tree_node(report, depth + 1))
        return node