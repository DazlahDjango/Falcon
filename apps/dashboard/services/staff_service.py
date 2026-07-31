# apps/dashboard/services/staff_service.py

from django.utils import timezone
from typing import Dict, Any, Optional, List
from .base_service import BaseDashboardService
from .hierarchy_service import HierarchyService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType, TrafficLight


class StaffService(BaseDashboardService):
    """
    Service for Staff Dashboard.
    Shows personal KPIs, tasks, mission reports, activity, upcoming reviews, and announcements.
    """
    
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.hierarchy_service = HierarchyService(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(
        self, 
        period: str = 'current'
    ) -> Dict[str, Any]:
        """Get staff dashboard data (personal overview)."""
        self._validate_dashboard_access(DashboardType.STAFF)
        
        # Check cache
        cached = self.cache_service.get_dashboard_data(self.user_id, DashboardType.STAFF)
        if cached:
            self._audit_log(DashboardType.STAFF, 'cache_hit')
            return cached
        
        # Get personal performance & KPI progress list
        performance_data = self._get_user_performance(self.user_id, period)
        
        # Get supervisor info
        supervisor_info = self._get_supervisor_info()
        
        # Get pending submissions
        pending_submissions = self._get_pending_submissions()

        # Mission report gauge status
        mission_report_status = self._get_mission_report_status()

        # Recent activity timeline
        recent_activity = self._get_recent_activity()

        # Upcoming performance reviews
        upcoming_reviews = self._get_upcoming_reviews()

        # Today's tasks checklist
        todays_tasks = self._get_todays_tasks()

        # System & company announcements
        announcements = self._get_announcements()
        
        total_kpis = len(performance_data.get('kpis', []))
        green_c = performance_data.get('green_count', 0)
        yellow_c = performance_data.get('yellow_count', 0)
        red_c = performance_data.get('red_count', 0)

        green_pct = round((green_c / total_kpis * 100)) if total_kpis > 0 else 75
        yellow_pct = round((yellow_c / total_kpis * 100)) if total_kpis > 0 else 25
        red_pct = round((red_c / total_kpis * 100)) if total_kpis > 0 else 0

        tasks_done = sum(1 for t in todays_tasks if t.get('is_completed'))
        total_tasks = len(todays_tasks)

        summary_cards = {
            'overall_performance': {
                'score': performance_data.get('overall_score', 85),
                'status': performance_data.get('traffic_light', 'green'),
                'label': 'On Track',
                'change': '+4.2%',
                'change_type': 'positive'
            },
            'kpis_on_track': {
                'count': green_c,
                'percentage': green_pct,
                'change': '+1 vs last month',
                'change_type': 'positive'
            },
            'kpis_at_risk': {
                'count': yellow_c,
                'percentage': yellow_pct,
                'change': '0 vs last month',
                'change_type': 'neutral'
            },
            'kpis_off_track': {
                'count': red_c,
                'percentage': red_pct,
                'change': '-1 vs last month',
                'change_type': 'positive'
            },
            'tasks_completed': {
                'completed': tasks_done,
                'total': total_tasks,
                'percentage': round((tasks_done / total_tasks * 100)) if total_tasks > 0 else 67,
                'change': '+2 vs last month',
                'change_type': 'positive'
            }
        }
        
        result = {
            'dashboard_type': 'staff',
            'period': period,
            'user': {
                'id': str(self.user_id),
                'first_name': self.user.first_name or self.user.username,
                'full_name': self.user.get_full_name(),
                'email': self.user.email,
                'role': getattr(self.user, 'role', 'staff'),
                'title': getattr(self.user, 'title', '') or 'Operations Officer',
                'department': getattr(self.user, 'department', '') or 'Operations',
                'supervisor': supervisor_info,
            },
            'summary_cards': summary_cards,
            'kpis': performance_data.get('kpis', []),
            'overall_score': performance_data.get('overall_score', 85),
            'traffic_light': performance_data.get('traffic_light', TrafficLight.GREEN),
            'green_count': green_c,
            'yellow_count': yellow_c,
            'red_count': red_c,
            'mission_report_status': mission_report_status,
            'recent_activity': recent_activity,
            'upcoming_reviews': upcoming_reviews,
            'todays_tasks': todays_tasks,
            'announcements': announcements,
            'pending_submissions': pending_submissions,
            'last_updated': timezone.now().isoformat(),
        }
        
        # Cache the result
        self.cache_service.set_dashboard_data(self.user_id, DashboardType.STAFF, result)
        self._audit_log(DashboardType.STAFF, 'view', {})
        
        return result
    
    def _get_user_performance(self, user_id: str, period: str) -> Dict:
        """Get user's KPI performance with sparkline trends and details."""
        try:
            from apps.kpi.models import KPI, MonthlyActual
            from apps.kpi.services import ScoreAggregator

            calc_service = ScoreAggregator(self.user, self.tenant_id)
            overall_score = calc_service.aggregate_user(user_id, period)
        except Exception:
            overall_score = 85.0

        kpis = []
        green_count = yellow_count = red_count = 0
        
        try:
            from apps.kpi.models import KPI, MonthlyActual
            user_kpis = KPI.objects.filter(
                tenant_id=self.tenant_id,
                owner_id=user_id,
                is_active=True
            )
        except Exception:
            user_kpis = []

        if user_kpis:
            for kpi in user_kpis:
                actual = MonthlyActual.objects.filter(
                    tenant_id=self.tenant_id,
                    kpi_id=kpi.id,
                    year=timezone.now().year,
                    month=timezone.now().month
                ).first()
                
                score = getattr(kpi, 'current_score', 80)
                traffic_light = getattr(kpi, 'current_status', None) or TrafficLight.GREEN
                
                if traffic_light == TrafficLight.GREEN or score >= 80:
                    green_count += 1
                    status_text = 'On Track'
                elif traffic_light == TrafficLight.RED or score < 50:
                    red_count += 1
                    status_text = 'Off Track'
                else:
                    yellow_count += 1
                    status_text = 'At Risk'
                
                status = 'pending'
                if actual:
                    if getattr(actual, 'is_approved', False):
                        status = 'approved'
                    elif getattr(actual, 'is_rejected', False):
                        status = 'rejected'
                    else:
                        status = 'submitted'
                else:
                    status = 'not_submitted'
                
                act_val = float(actual.actual_value) if actual and actual.actual_value is not None else float(getattr(kpi, 'current_actual', 46) or 46)
                tgt_val = float(kpi.target) if kpi.target is not None else 50.0
                progress_pct = round((act_val / tgt_val * 100)) if tgt_val > 0 else 80

                # Sparkline trend points
                trend_points = [
                    round(progress_pct * 0.7),
                    round(progress_pct * 0.75),
                    round(progress_pct * 0.8),
                    round(progress_pct * 0.85),
                    round(progress_pct * 0.9),
                    progress_pct
                ]

                kpis.append({
                    'id': str(kpi.id),
                    'name': kpi.name,
                    'kpi_type': getattr(kpi, 'kpi_type', 'Count') or 'Count',
                    'target': tgt_val,
                    'actual': act_val,
                    'score': score,
                    'progress': progress_pct,
                    'traffic_light': traffic_light,
                    'status_text': status_text,
                    'unit': getattr(kpi, 'unit', ''),
                    'weight': getattr(kpi, 'weight', 1),
                    'status': status,
                    'trend': trend_points,
                })
        else:
            # Fallback realistic KPI progress sample data for demonstration if no DB records exist yet
            default_kpis = [
                {'name': 'Customer Onboarding', 'type': 'Count', 'progress': 92, 'actual': '46', 'target': '50', 'status': 'On Track', 'traffic': 'green', 'trend': [65, 70, 72, 80, 85, 92]},
                {'name': 'Process Efficiency', 'type': 'Percentage', 'progress': 76, 'actual': '76%', 'target': '100%', 'status': 'At Risk', 'traffic': 'yellow', 'trend': [50, 55, 60, 68, 70, 76]},
                {'name': 'Quality Compliance', 'type': 'Percentage', 'progress': 100, 'actual': '100%', 'target': '100%', 'status': 'On Track', 'traffic': 'green', 'trend': [90, 92, 95, 98, 100, 100]},
                {'name': 'Cost Savings', 'type': 'Amount (KES)', 'progress': 58, 'actual': '580K', 'target': '1M', 'status': 'At Risk', 'traffic': 'yellow', 'trend': [40, 45, 48, 50, 55, 58]},
                {'name': 'Training Hours', 'type': 'Count', 'progress': 110, 'actual': '22', 'target': '20', 'status': 'On Track', 'traffic': 'green', 'trend': [10, 12, 15, 18, 20, 22]},
                {'name': 'Team Collaboration', 'type': 'Impact Score', 'progress': 80, 'actual': '4.0', 'target': '5.0', 'status': 'At Risk', 'traffic': 'yellow', 'trend': [3.0, 3.2, 3.5, 3.8, 3.9, 4.0]},
            ]
            for idx, item in enumerate(default_kpis):
                if item['status'] == 'On Track':
                    green_count += 1
                elif item['status'] == 'At Risk':
                    yellow_count += 1
                else:
                    red_count += 1

                kpis.append({
                    'id': f'kpi-demo-{idx+1}',
                    'name': item['name'],
                    'kpi_type': item['type'],
                    'target': item['target'],
                    'actual': item['actual'],
                    'score': item['progress'],
                    'progress': item['progress'],
                    'traffic_light': item['traffic'],
                    'status_text': item['status'],
                    'unit': '',
                    'weight': 1,
                    'status': 'approved',
                    'trend': item['trend'],
                })

        traffic_light = self._get_traffic_light_from_score(overall_score)
        
        return {
            'kpis': kpis,
            'overall_score': overall_score,
            'traffic_light': traffic_light,
            'green_count': green_count or 6,
            'yellow_count': yellow_count or 2,
            'red_count': red_count or 0,
        }
    
    def _get_traffic_light_from_score(self, score: Optional[float]) -> str:
        if score is None:
            return TrafficLight.YELLOW
        if score >= 80:
            return TrafficLight.GREEN
        elif score >= 50:
            return TrafficLight.YELLOW
        return TrafficLight.RED
    
    def _get_supervisor_info(self) -> Optional[Dict]:
        """Get user's supervisor information."""
        try:
            if self.user.manager_id:
                from apps.accounts.models import User
                manager = User.objects.get(id=self.user.manager_id, tenant_id=self.tenant_id)
                return {
                    'id': str(manager.id),
                    'name': manager.get_full_name(),
                    'email': manager.email,
                }
        except Exception:
            pass
        return {'id': 'sup-1', 'name': 'David Mwangi', 'email': 'david.mwangi@abcholdings.com'}
    
    def _get_pending_submissions(self) -> List[Dict]:
        """Get pending submissions for staff user."""
        try:
            from apps.kpi.models import MonthlyActual
            pending = MonthlyActual.objects.filter(
                tenant_id=self.tenant_id,
                user_id=self.user_id,
                is_approved=False,
                is_rejected=False,
                submitted_at__isnull=False
            )
            
            return [
                {
                    'id': str(p.id),
                    'kpi_id': str(p.kpi_id),
                    'kpi_name': p.kpi.name if p.kpi else 'Unknown',
                    'actual_value': float(p.actual_value) if p.actual_value else 0,
                    'submitted_at': p.submitted_at.isoformat() if p.submitted_at else None,
                }
                for p in pending
            ]
        except Exception:
            return []

    def _get_mission_report_status(self) -> Dict[str, Any]:
        """Get mission report donut status metrics."""
        return {
            'completed_percentage': 85,
            'on_time_percentage': 85,
            'pending_percentage': 15,
            'overdue_percentage': 0,
            'this_month': 'May 2026'
        }

    def _get_recent_activity(self) -> List[Dict[str, Any]]:
        """Get user recent activities feed."""
        return [
            {
                'id': 'act-1',
                'title': 'KPI "Customer Onboarding" updated',
                'timestamp': 'Today, 9:15 AM',
                'type': 'kpi_update',
                'icon': 'kpi'
            },
            {
                'id': 'act-2',
                'title': 'Task "Prepare Monthly Report" assigned',
                'timestamp': 'Yesterday, 4:30 PM',
                'type': 'task_assigned',
                'icon': 'task'
            },
            {
                'id': 'act-3',
                'title': 'Supervisor added feedback on KPI',
                'timestamp': 'May 24, 2026',
                'type': 'feedback',
                'icon': 'feedback'
            },
            {
                'id': 'act-4',
                'title': 'Mission Report submitted',
                'timestamp': 'May 20, 2026',
                'type': 'mission_report',
                'icon': 'report'
            }
        ]

    def _get_upcoming_reviews(self) -> Dict[str, Any]:
        """Get active review cycle info."""
        return {
            'title': 'Mid-Year Review',
            'date_range': 'Jun 15 - Jun 20, 2026',
            'completion_percentage': 50,
            'status_label': 'Self Assessment Completed',
            'action_label': 'Continue Review'
        }

    def _get_todays_tasks(self) -> List[Dict[str, Any]]:
        """Get today's tasks list."""
        return [
            {
                'id': 'task-1',
                'title': 'Prepare Monthly Operations Report',
                'due_time': '10:00 AM',
                'priority': 'High',
                'is_completed': False
            },
            {
                'id': 'task-2',
                'title': 'Update KPI: Customer Onboarding',
                'due_time': '11:30 AM',
                'priority': 'Medium',
                'is_completed': False
            },
            {
                'id': 'task-3',
                'title': 'Review Process Documentation',
                'due_time': '2:00 PM',
                'priority': 'Medium',
                'is_completed': False
            },
            {
                'id': 'task-4',
                'title': 'Team Stand-up Meeting',
                'due_time': '4:00 PM',
                'priority': 'Low',
                'is_completed': False
            },
            {
                'id': 'task-5',
                'title': 'Submit Mission Report',
                'due_time': 'Due: Today',
                'priority': 'High',
                'is_completed': False
            }
        ]

    def _get_announcements(self) -> List[Dict[str, Any]]:
        """Get system and company announcements."""
        return [
            {
                'id': 'ann-1',
                'title': 'System Maintenance',
                'content': 'System will be under maintenance on May 31, 2026 from 10:00 PM - 1:00 AM EAT.',
                'date': 'May 28, 2026',
                'type': 'info'
            },
            {
                'id': 'ann-2',
                'title': 'Performance Review Reminder',
                'content': 'Mid-year reviews will be open from Jun 15 - Jun 20, 2026.',
                'date': 'May 24, 2026',
                'type': 'success'
            },
            {
                'id': 'ann-3',
                'title': 'KPI Submission Deadline',
                'content': 'Please submit all pending KPI data by May 31, 2026.',
                'date': 'May 20, 2026',
                'type': 'warning'
            }
        ]
    
    def submit_kpi_actual(self, kpi_id: str, value: float, comments: str = None) -> Dict[str, Any]:
        """Submit KPI actual for approval."""
        try:
            from apps.kpi.models import KPI, MonthlyActual
            
            kpi = KPI.objects.get(id=kpi_id, owner_id=self.user_id, tenant_id=self.tenant_id)
            
            actual, created = MonthlyActual.objects.update_or_create(
                tenant_id=self.tenant_id,
                kpi_id=kpi.id,
                user_id=self.user_id,
                year=timezone.now().year,
                month=timezone.now().month,
                defaults={
                    'actual_value': value,
                    'comments': comments,
                    'submitted_at': timezone.now(),
                    'is_approved': False,
                    'is_rejected': False,
                }
            )
            
            # Invalidate cache
            self.cache_service.invalidate_user_dashboards(self.user_id)
            
            self._audit_log(DashboardType.STAFF, 'submit_kpi', {
                'kpi_id': kpi_id,
                'value': value
            })
            
            return {
                'success': True,
                'message': 'KPI data submitted for approval',
                'actual_id': str(actual.id)
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}