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
    Shows only personal KPIs, no team access.
    """
    
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.hierarchy_service = HierarchyService(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(
        self, 
        period: str = 'current'
    ) -> Dict[str, Any]:
        """Get staff dashboard data (personal KPIs only)."""
        self._validate_dashboard_access(DashboardType.STAFF)
        
        # Check cache
        cached = self.cache_service.get_dashboard_data(self.user_id, DashboardType.STAFF)
        if cached:
            self._audit_log(DashboardType.STAFF, 'cache_hit')
            return cached
        
        # Get personal performance
        performance_data = self._get_user_performance(self.user_id, period)
        
        # Get supervisor info
        supervisor_info = self._get_supervisor_info()
        
        # Get pending submissions
        pending_submissions = self._get_pending_submissions()
        
        result = {
            'dashboard_type': 'staff',
            'period': period,
            'user': {
                'id': self.user_id,
                'name': self.user.get_full_name(),
                'email': self.user.email,
                'role': getattr(self.user, 'role', 'staff'),
                'department': getattr(self.user, 'department', ''),
                'supervisor': supervisor_info,
            },
            'kpis': performance_data.get('kpis', []),
            'overall_score': performance_data.get('overall_score'),
            'traffic_light': performance_data.get('traffic_light', TrafficLight.YELLOW),
            'green_count': performance_data.get('green_count', 0),
            'yellow_count': performance_data.get('yellow_count', 0),
            'red_count': performance_data.get('red_count', 0),
            'pending_submissions': pending_submissions,
            'last_updated': timezone.now().isoformat(),
        }
        
        # Cache the result
        self.cache_service.set_dashboard_data(self.user_id, DashboardType.STAFF, result)
        self._audit_log(DashboardType.STAFF, 'view', {})
        
        return result
    
    def _get_user_performance(self, user_id: str, period: str) -> Dict:
        """Get user's KPI performance with details."""
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
            
            status = 'pending'
            if actual:
                if actual.is_approved:
                    status = 'approved'
                elif actual.is_rejected:
                    status = 'rejected'
                else:
                    status = 'submitted'
            else:
                status = 'not_submitted'
            
            kpis.append({
                'id': str(kpi.id),
                'name': kpi.name,
                'target': float(kpi.target) if kpi.target else None,
                'actual': float(actual.actual_value) if actual and actual.actual_value else None,
                'score': score,
                'traffic_light': traffic_light,
                'unit': getattr(kpi, 'unit', ''),
                'weight': getattr(kpi, 'weight', 1),
                'status': status,
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
        return None
    
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
        except ImportError:
            return []
    
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