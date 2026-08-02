# apps/dashboard/services/executive_service.py

from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from typing import Dict, List, Any, Optional
from .base_service import BaseDashboardService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType, TrafficLight, Defaults


class ExecutiveDashboardService(BaseDashboardService):
    """
    Service for Executive Dashboard (CEOs, Board Members, VPs).
    Provides high-level strategic intelligence, performance trends, department health heatmaps, and executive alerts.
    """
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(self, executive_user_id: str, filters: dict = None) -> Dict[str, Any]:
        self._validate_dashboard_access(DashboardType.EXECUTIVE)
        
        cached = self.cache_service.get_dashboard_data(executive_user_id, DashboardType.EXECUTIVE, filters)
        if cached:
            self._audit_log(DashboardType.EXECUTIVE, 'cache_hit')
            return cached
        
        from apps.accounts.models import User
        try:
            executive = User.objects.get(id=executive_user_id, tenant_id=self.tenant_id, is_active=True)
        except User.DoesNotExist:
            executive = self.user

        tenant_name = "ABC Holdings Ltd"
        try:
            if hasattr(self.user, 'tenant') and self.user.tenant:
                tenant_name = self.user.tenant.name
        except Exception:
            pass

        dept_heatmap = self._get_department_heatmap()

        dashboard_data = {
            'dashboard_type': 'executive',
            'executive_info': {
                'id': str(executive.id),
                'name': executive.get_full_name() or 'Dr. John Smith',
                'role': 'Chief Executive Officer',
                'title': executive.title or 'Chief Executive Officer',
                'tenant_name': tenant_name,
            },
            'executive_summary': {
                'text': 'Overall organizational performance is 91% (On Track). Revenue exceeds target by 4%. Operations Department declined 6% this month. 18 executive approvals remain pending. Customer Satisfaction dropped by 3%. Mission Report compliance reached 95%.',
                'cta_label': 'View Full Insight'
            },
            'todays_focus': [
                {'id': 'tf-1', 'text': 'Review Operations Performance', 'completed': True},
                {'id': 'tf-2', 'text': 'Approve Budget Revision', 'completed': True},
                {'id': 'tf-3', 'text': 'Board Strategy Review at 2:00 PM', 'completed': True}
            ],
            'summary_cards': {
                'organization_score': {
                    'score': 91,
                    'label': 'Excellent',
                    'change': '+2.4% vs last month',
                    'change_type': 'positive'
                },
                'strategic_objectives': {
                    'on_track': 15,
                    'total': 17,
                    'completion_percentage': 88,
                    'label': 'On Track'
                },
                'departments': {
                    'active_count': 12,
                    'healthy_count': 10,
                    'need_attention_count': 2
                },
                'staff_performance': {
                    'average_achievement_percentage': 89,
                    'change': '+3.1% vs last month',
                    'change_type': 'positive'
                },
                'reviews_completed': {
                    'completed_percentage': 93,
                    'status': 'On Schedule',
                    'change': '+6% vs last month',
                    'change_type': 'positive'
                },
                'mission_reports': {
                    'submitted_percentage': 95,
                    'change': '+4% vs last month',
                    'change_type': 'positive'
                }
            },
            'org_performance_trend': {
                'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'actual': [52, 58, 65, 68, 70, 78, 91],
                'target': [50, 55, 60, 65, 70, 75, 87, 88, 86, 85, 84, 83],
                'current_jul': {
                    'month': 'Jul 2026',
                    'actual': 91,
                    'target': 87,
                    'variance': '+4%'
                }
            },
            'department_health_heatmap': dept_heatmap,
            'executive_alerts': [
                {
                    'id': 'ea-1',
                    'title': 'Operations Department below target',
                    'timestamp': '2 hours ago',
                    'type': 'danger'
                },
                {
                    'id': 'ea-2',
                    'title': '42 KPIs awaiting approval',
                    'timestamp': '4 hours ago',
                    'type': 'warning'
                },
                {
                    'id': 'ea-3',
                    'title': 'Revenue declined 11% vs last month',
                    'timestamp': '5 hours ago',
                    'type': 'danger'
                },
                {
                    'id': 'ea-4',
                    'title': 'All reviews completed on schedule',
                    'timestamp': 'Yesterday',
                    'type': 'success'
                }
            ],
            'top_performing_departments': [
                {'rank': 1, 'name': 'Finance', 'score': 98},
                {'rank': 2, 'name': 'ICT', 'score': 96},
                {'rank': 3, 'name': 'Procurement', 'score': 94}
            ],
            'departments_requiring_attention': [
                {'rank': 1, 'name': 'Operations', 'score': 41},
                {'rank': 2, 'name': 'HR', 'score': 58},
                {'rank': 3, 'name': 'Marketing', 'score': 63}
            ],
            'pending_executive_approvals': {
                'items': [
                    {'title': 'KPI Revision Request', 'count': 8},
                    {'title': 'Annual Budget Revision', 'count': 6},
                    {'title': 'New Division Creation', 'count': 4}
                ],
                'total_pending': 18
            },
            'review_completion': {
                'completed_percentage': 93,
                'pending_percentage': 7,
                'total_reviews': 1248
            },
            'last_updated': timezone.now().isoformat()
        }
        
        self.cache_service.set_dashboard_data(executive_user_id, DashboardType.EXECUTIVE, dashboard_data, filters)
        self._audit_log(DashboardType.EXECUTIVE, 'view', {'executive_id': executive_user_id})
        
        return dashboard_data

    def _get_department_heatmap(self) -> List[Dict]:
        """Get department heatmap metrics."""
        try:
            from apps.structure.models import Department
            depts = Department.objects.filter(tenant_id=self.tenant_id, is_active=True)[:6]
            if depts.exists():
                res = []
                for d in depts:
                    score = getattr(d, 'current_score', 85) or 85
                    if score >= 80:
                        st = 'On Track'
                    elif score >= 50:
                        st = 'At Risk'
                    else:
                        st = 'Off Track'
                    res.append({
                        'id': str(d.id),
                        'name': d.name,
                        'score': score,
                        'status': st
                    })
                return res
        except Exception:
            pass

        return [
            {'name': 'Finance', 'score': 98, 'status': 'On Track'},
            {'name': 'HR', 'score': 72, 'status': 'At Risk'},
            {'name': 'ICT', 'score': 96, 'status': 'On Track'},
            {'name': 'Sales', 'score': 98, 'status': 'On Track'},
            {'name': 'Operations', 'score': 44, 'status': 'Off Track'},
            {'name': 'Procurement', 'score': 94, 'status': 'On Track'},
        ]