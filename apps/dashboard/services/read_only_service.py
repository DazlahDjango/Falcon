# apps/dashboard/services/read_only_service.py

from django.utils import timezone
from typing import Dict, Any, Optional
from .base_service import BaseDashboardService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType


class ReadOnlyService(BaseDashboardService):
    """
    Service for Read-Only users (Investors, Auditors, Board Members).
    Provides org-wide performance oversight with zero edit privileges.
    """
    
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(
        self, 
        period: str = 'current',
        view_type: str = 'overview'
    ) -> Dict[str, Any]:
        """Get read-only dashboard overview data."""
        self._validate_dashboard_access(DashboardType.READ_ONLY)
        
        # Check cache
        cached = self.cache_service.get_dashboard_data(self.user_id, DashboardType.READ_ONLY)
        if cached:
            self._audit_log(DashboardType.READ_ONLY, 'cache_hit', {'view_type': view_type})
            return cached
        
        tenant_name = "ABC Holdings Ltd"
        try:
            if hasattr(self.user, 'tenant') and self.user.tenant:
                tenant_name = self.user.tenant.name
        except Exception:
            pass

        # Try gathering real department data from structure app
        dept_performance = self._get_department_performance()

        result = {
            'dashboard_type': 'read_only',
            'period': period,
            'read_only': True,
            'can_edit': False,
            'can_submit': False,
            'can_approve': False,
            'can_configure': False,
            'can_export': True,
            'user': {
                'id': str(self.user_id),
                'name': self.user.get_full_name() or 'James Investor',
                'role': 'Investor / External Auditor',
                'access_level': 'Reports Only',
                'tenant_name': tenant_name,
            },
            'summary_cards': {
                'overall_performance': {
                    'score': 91,
                    'status': 'On Track',
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
                'kpi_achievement': {
                    'average_achievement_percentage': 89,
                    'change': '+3.1% vs last month',
                    'change_type': 'positive'
                },
                'mission_reports': {
                    'submitted_percentage': 95,
                    'change': '+4% vs last month',
                    'change_type': 'positive'
                },
                'reviews_completed': {
                    'completed_percentage': 93,
                    'status': 'On Schedule',
                    'change': '+6% vs last month',
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
            'department_performance': dept_performance,
            'performance_by_status': {
                'on_track': 74,
                'at_risk': 18,
                'off_track': 8,
                'average_score': 89,
                'total_kpis': 1248
            },
            'strategic_objectives': [
                {'name': 'Grow Revenue', 'progress': 92, 'status': 'On Track'},
                {'name': 'Customer Satisfaction', 'progress': 86, 'status': 'On Track'},
                {'name': 'Digital Transformation', 'progress': 58, 'status': 'At Risk'},
                {'name': 'ESG Compliance', 'progress': 92, 'status': 'On Track'},
                {'name': 'Innovation & Growth', 'progress': 74, 'status': 'At Risk'}
            ],
            'mission_report_summary': {
                'submitted': 95,
                'pending': 5,
                'overdue': 0
            },
            'review_completion': {
                'completed': 93,
                'pending': 7
            },
            'recent_highlights': [
                {
                    'id': 'hl-1',
                    'title': 'Revenue exceeded target by 4% this month',
                    'timestamp': '2 hours ago',
                    'type': 'success'
                },
                {
                    'id': 'hl-2',
                    'title': 'Operations department below target',
                    'timestamp': '4 hours ago',
                    'type': 'warning'
                },
                {
                    'id': 'hl-3',
                    'title': '94% of staff completed self-assessments',
                    'timestamp': '1 day ago',
                    'type': 'success'
                },
                {
                    'id': 'hl-4',
                    'title': 'Q2 Strategic Review completed',
                    'timestamp': '2 days ago',
                    'type': 'info'
                }
            ],
            'last_updated': timezone.now().isoformat(),
        }
        
        # Cache the result
        self.cache_service.set_dashboard_data(self.user_id, DashboardType.READ_ONLY, result)
        self._audit_log(DashboardType.READ_ONLY, 'view', {'view_type': view_type})
        
        return result

    def _get_department_performance(self):
        """Get department heatmap performance array."""
        try:
            from apps.structure.models import Department
            depts = Department.objects.filter(tenant_id=self.tenant_id, is_active=True)[:8]
            if depts:
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
            {'name': 'ICT', 'score': 96, 'status': 'On Track'},
            {'name': 'Sales', 'score': 98, 'status': 'On Track'},
            {'name': 'Procurement', 'score': 94, 'status': 'On Track'},
            {'name': 'HR', 'score': 72, 'status': 'At Risk'},
            {'name': 'Operations', 'score': 44, 'status': 'Off Track'},
            {'name': 'Marketing', 'score': 61, 'status': 'At Risk'},
            {'name': 'Logistics', 'score': 85, 'status': 'On Track'},
        ]

    def get_export_data(self, period: str = 'current', view_type: str = 'executive') -> Dict[str, Any]:
        """Get data specifically formatted for export (no read-only flags)."""
        data = self.get_dashboard_data(period, view_type)
        return {
            'exported_at': timezone.now().isoformat(),
            'exported_by': self.user.email,
            'dashboard_type': view_type,
            'period': period,
            'data': data,
        }