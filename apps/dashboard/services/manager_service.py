# apps/dashboard/services/manager_service.py

from django.db.models import Count, Avg, Q
from django.utils import timezone
from typing import Dict, List, Any, Optional
from .base_service import BaseDashboardService
from .hierarchy_service import HierarchyService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType, TrafficLight, Defaults


class ManagerService(BaseDashboardService):
    """
    Service for Manager/Supervisor Dashboard.
    Shows personal KPIs + team members for users with direct reports.
    """
    
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.hierarchy_service = HierarchyService(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(
        self, 
        period: str = 'current',
        include_team: bool = True,
        drill_down_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get manager dashboard data."""
        self._validate_dashboard_access(DashboardType.MANAGER)
        
        target_user_id = drill_down_user_id or self.user_id
        
        # Check cache
        cached = self.cache_service.get_dashboard_data(target_user_id, DashboardType.MANAGER)
        if cached:
            self._audit_log(DashboardType.MANAGER, 'cache_hit')
            return cached
        
        from apps.accounts.models import User
        try:
            target_user = User.objects.get(id=target_user_id, tenant_id=self.tenant_id, is_active=True)
        except User.DoesNotExist:
            return {'error': f'User {target_user_id} not found'}
        
        # Get personal KPIs
        personal_data = self._get_user_performance(target_user.id, period)
        
        result = {
            'dashboard_type': 'manager',
            'period': period,
            'user': {
                'id': str(target_user.id),
                'name': target_user.get_full_name(),
                'email': target_user.email,
                'role': getattr(target_user, 'role', 'manager'),
                'department': getattr(target_user, 'department', ''),
            },
            'personal_kpis': personal_data.get('kpis', []),
            'personal_score': personal_data.get('overall_score'),
            'personal_traffic_light': personal_data.get('traffic_light', TrafficLight.YELLOW),
            'pending_approvals': self._get_pending_approvals_count(target_user.id),
            'last_updated': timezone.now().isoformat(),
        }
        
        # Include team if requested and user has direct reports
        if include_team:
            team_members = self.hierarchy_service.get_user_team(target_user.id, include_self=False)
            if team_members:
                team_cards = []
                for member in team_members:
                    member_perf = self._get_user_performance(member['id'], period)
                    team_cards.append({
                        'user_id': member['id'],
                        'name': f"{member.get('first_name', '')} {member.get('last_name', '')}".strip(),
                        'email': member.get('email', ''),
                        'role': member.get('role', 'staff'),
                        'department': member.get('department', ''),
                        'green_count': member_perf.get('green_count', 0),
                        'yellow_count': member_perf.get('yellow_count', 0),
                        'red_count': member_perf.get('red_count', 0),
                        'overall_score': member_perf.get('overall_score'),
                        'traffic_light': member_perf.get('traffic_light', TrafficLight.YELLOW),
                        'has_pending_approval': self._has_pending_approval(member['id']),
                    })
                
                result['team_members'] = team_cards
                result['team_summary'] = self._calculate_team_summary(team_cards)
        
        # Cache the result
        self.cache_service.set_dashboard_data(target_user.id, DashboardType.MANAGER, result)
        self._audit_log(DashboardType.MANAGER, 'view', {'target_user_id': target_user_id})
        
        return result
    
    def _get_user_performance(self, user_id: str, period: str) -> Dict:
        """Get user's KPI performance."""
        from apps.kpi.services import ScoreAggregator
        from apps.kpi.models import KPI, MonthlyActual
        
        calc_service = ScoreAggregator(self.user, self.tenant_id)
        overall_score = calc_service.aggregate_user(user_id, period)
        
        kpis = []
        green_count = yellow_count = red_count = 0
        
        user_kpis = KPI.objects.filter(
            tenant_id=self.tenant_id,
            owner_id=user_id,
            is_active=True
        )
        
        for kpi in user_kpis:
            actual = MonthlyActual.objects.filter(
                tenant_id=self.tenant_id,
                kpi_id=kpi.id,
                year=timezone.now().year,
                month=timezone.now().month
            ).first()
            
            score = kpi.current_score
            traffic_light = kpi.current_status or TrafficLight.YELLOW
            
            if traffic_light == TrafficLight.GREEN:
                green_count += 1
            elif traffic_light == TrafficLight.YELLOW:
                yellow_count += 1
            elif traffic_light == TrafficLight.RED:
                red_count += 1
            
            kpis.append({
                'id': str(kpi.id),
                'name': kpi.name,
                'target': float(kpi.target) if kpi.target else None,
                'actual': float(actual.actual_value) if actual and actual.actual_value else None,
                'score': score,
                'traffic_light': traffic_light,
                'unit': getattr(kpi, 'unit', ''),
                'weight': getattr(kpi, 'weight', 1),
            })
        
        traffic_light = self._get_traffic_light_from_score(overall_score)
        
        return {
            'kpis': kpis,
            'overall_score': overall_score,
            'traffic_light': traffic_light,
            'green_count': green_count,
            'yellow_count': yellow_count,
            'red_count': red_count,
        }
    
    def _get_traffic_light_from_score(self, score: Optional[float]) -> str:
        if score is None:
            return TrafficLight.YELLOW
        if score >= 90:
            return TrafficLight.GREEN
        elif score >= 50:
            return TrafficLight.YELLOW
        return TrafficLight.RED
    
    def _has_pending_approval(self, user_id: str) -> bool:
        try:
            from apps.kpi.models import MonthlyActual
            return MonthlyActual.objects.filter(
                tenant_id=self.tenant_id,
                user_id=user_id,
                is_approved=False,
                is_rejected=False,
                submitted_at__isnull=False
            ).exists()
        except ImportError:
            return False
    
    def _get_pending_approvals_count(self, supervisor_id: str) -> int:
        try:
            from apps.kpi.models import MonthlyActual
            return MonthlyActual.objects.filter(
                tenant_id=self.tenant_id,
                kpi__owner__manager_id=supervisor_id,
                is_approved=False,
                is_rejected=False,
                submitted_at__isnull=False
            ).count()
        except ImportError:
            return 0
    
    def _calculate_team_summary(self, team_cards: List[Dict]) -> Dict:
        scores = [c['overall_score'] for c in team_cards if c['overall_score']]
        return {
            'total_members': len(team_cards),
            'average_score': sum(scores) / len(scores) if scores else None,
            'total_green': sum(c['green_count'] for c in team_cards),
            'total_yellow': sum(c['yellow_count'] for c in team_cards),
            'total_red': sum(c['red_count'] for c in team_cards),
        }
    
    def approve_submission(self, submission_id: str, comments: str = None) -> Dict[str, Any]:
        """Approve a team member's submission."""
        try:
            from apps.kpi.models import MonthlyActual
            
            submission = MonthlyActual.objects.get(
                id=submission_id,
                tenant_id=self.tenant_id,
                kpi__owner__manager_id=self.user_id
            )
            
            submission.is_approved = True
            submission.approved_at = timezone.now()
            submission.approved_by_id = self.user_id
            submission.comments = comments
            submission.save()
            
            # Update KPI score
            from apps.kpi.services import ScoreAggregator
            calc_service = ScoreAggregator(self.user, self.tenant_id)
            calc_service.update_kpi_score(submission.kpi_id)
            
            # Invalidate caches
            self.cache_service.invalidate_user_dashboards(str(submission.user_id))
            self.cache_service.invalidate_user_dashboards(str(self.user_id))
            
            self._audit_log(DashboardType.MANAGER, 'approve_submission', {'submission_id': submission_id})
            
            return {'success': True, 'message': 'Submission approved'}
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def reject_submission(self, submission_id: str, comments: str) -> Dict[str, Any]:
        """Reject a team member's submission."""
        try:
            from apps.kpi.models import MonthlyActual
            
            submission = MonthlyActual.objects.get(
                id=submission_id,
                tenant_id=self.tenant_id,
                kpi__owner__manager_id=self.user_id
            )
            
            submission.is_rejected = True
            submission.rejected_at = timezone.now()
            submission.rejected_by_id = self.user_id
            submission.comments = comments
            submission.save()
            
            # Invalidate caches
            self.cache_service.invalidate_user_dashboards(str(submission.user_id))
            self.cache_service.invalidate_user_dashboards(str(self.user_id))
            
            self._audit_log(DashboardType.MANAGER, 'reject_submission', {'submission_id': submission_id})
            
            return {'success': True, 'message': 'Submission rejected'}
        except Exception as e:
            return {'success': False, 'message': str(e)}