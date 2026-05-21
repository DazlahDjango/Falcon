from django.db.models import Count, Avg
from django.utils import timezone
from typing import Dict, List, Any, Optional
from .base_service import BaseDashboardService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType, TrafficLight, Defaults
from apps.dashboard.models import ExportSchedule, DashboardAlert

class ClientAdminDashboardService(BaseDashboardService):
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(self) -> Dict:
        self._validate_dashboard_access(DashboardType.CLIENT_ADMIN)
        
        cache_key = f"client_admin_dashboard:{self.tenant_id}"
        cached = self.cache_service.get_dashboard_data(self.user_id, DashboardType.CLIENT_ADMIN)
        if cached:
            return cached
        from apps.tenant.models import Client
        
        client = Client.objects.filter(id=self.tenant_id).first()
        
        tenant_overview = self._get_tenant_overview()
        
        compliance_status = self._get_compliance_status()
        
        pending_approvals = self._get_pending_approvals()
        
        missing_data = self._get_missing_data_alerts()
        
        kpi_performance = self._get_kpi_performance_breakdown()
        
        user_activity = self._get_user_activity()
        
        dashboard_data = {
            'tenant_info': {
                'id': str(self.tenant_id),
                'name': client.name if client else 'Unknown',
                'subscription_status': client.subscription_status if client else 'active'
            },
            'tenant_overview': tenant_overview,
            'compliance_status': compliance_status,
            'pending_approvals': pending_approvals,
            'missing_data_alerts': missing_data,
            'kpi_performance': kpi_performance,
            'user_activity': user_activity,
            'last_updated': timezone.now().isoformat()
        }
        
        self.cache_service.set_dashboard_data(self.user_id, DashboardType.CLIENT_ADMIN, dashboard_data)
        self._audit_log(DashboardType.CLIENT_ADMIN, 'view', {})
        
        return dashboard_data
    
    def _get_tenant_overview(self) -> Dict:
        from apps.accounts.models import User
        from apps.kpi.models import KPI
        
        total_users = User.objects.filter(tenant_id=self.tenant_id, is_active=True).count()
        active_users = User.objects.filter(
            tenant_id=self.tenant_id,
            is_active=True,
            last_login__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
        
        total_kpis = KPI.objects.filter(tenant_id=self.tenant_id, is_active=True).count()
        
        green_kpis = KPI.objects.filter(
            tenant_id=self.tenant_id,
            current_status=TrafficLight.GREEN,
            is_active=True
        ).count()
        
        red_kpis = KPI.objects.filter(
            tenant_id=self.tenant_id,
            current_status=TrafficLight.RED,
            is_active=True
        ).count()
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'user_engagement': round((active_users / total_users * 100), 2) if total_users > 0 else 0,
            'total_kpis': total_kpis,
            'green_kpis': green_kpis,
            'red_kpis': red_kpis,
            'health_score': round((green_kpis / total_kpis * 100), 2) if total_kpis > 0 else 0
        }
    
    def _get_compliance_status(self) -> Dict:
        from apps.accounts.models import User
        from apps.kpi.models import MonthlyActual
        from apps.reviews.models import ReviewCycle
        
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        total_users = User.objects.filter(tenant_id=self.tenant_id, is_active=True).count()
        
        submitted_actuals = MonthlyActual.objects.filter(
            tenant_id=self.tenant_id,
            year=current_year,
            month=current_month
        ).values('user_id').distinct().count()
        
        data_submission_rate = round((submitted_actuals / total_users * 100), 2) if total_users > 0 else 0
        
        review_cycles = ReviewCycle.objects.filter(
            tenant_id=self.tenant_id,
            end_date__gte=timezone.now()
        )
        
        completed_reviews = review_cycles.filter(status='completed').count()
        total_reviews = review_cycles.count()
        
        review_completion_rate = round((completed_reviews / total_reviews * 100), 2) if total_reviews > 0 else 0
        
        return {
            'data_submission_rate': data_submission_rate,
            'review_completion_rate': review_completion_rate,
            'pending_reviews': total_reviews - completed_reviews,
            'overdue_submissions': self._get_overdue_submissions_count()
        }
    
    def _get_overdue_submissions_count(self) -> int:
        from apps.accounts.models import User
        from apps.kpi.models import MonthlyActual
        
        current_month = timezone.now().month
        current_year = timezone.now().year
        current_day = timezone.now().day
        
        if current_day <= 5:
            return 0
        
        total_users = User.objects.filter(tenant_id=self.tenant_id, is_active=True).count()
        submitted = MonthlyActual.objects.filter(
            tenant_id=self.tenant_id,
            year=current_year,
            month=current_month
        ).values('user_id').distinct().count()
        
        return total_users - submitted
    
    def _get_pending_approvals(self) -> List[Dict]:
        from apps.kpi.models import MonthlyActual
        from apps.accounts.models import User
        
        pending_actuals = MonthlyActual.objects.filter(
            tenant_id=self.tenant_id,
            is_approved=False,
            is_rejected=False,
            submitted_at__isnull=False
        ).select_related('user', 'kpi')[:20]
        
        return [
            {
                'id': str(a.id),
                'user_name': a.user.get_full_name() if a.user else 'Unknown',
                'kpi_name': a.kpi.name if a.kpi else 'Unknown',
                'actual_value': float(a.actual_value) if a.actual_value else 0,
                'submitted_at': a.submitted_at.isoformat() if a.submitted_at else None,
                'pending_days': (timezone.now() - a.submitted_at).days if a.submitted_at else 0
            }
            for a in pending_actuals
        ]
    
    def _get_missing_data_alerts(self) -> List[Dict]:
        from apps.accounts.models import User
        from apps.kpi.models import KPI, MonthlyActual
        
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        users = User.objects.filter(tenant_id=self.tenant_id, is_active=True)
        
        missing_data = []
        for user in users:
            kpis = KPI.objects.filter(tenant_id=self.tenant_id, owner_id=user.id, is_active=True)
            
            for kpi in kpis:
                existing = MonthlyActual.objects.filter(
                    tenant_id=self.tenant_id,
                    kpi_id=kpi.id,
                    year=current_year,
                    month=current_month
                ).exists()
                
                if not existing:
                    missing_data.append({
                        'user_id': str(user.id),
                        'user_name': user.get_full_name(),
                        'kpi_id': str(kpi.id),
                        'kpi_name': kpi.name
                    })
                    
                    if len(missing_data) >= 20:
                        break
            
            if len(missing_data) >= 20:
                break
        return missing_data
    
    def _get_kpi_performance_breakdown(self) -> Dict:
        from apps.kpi.models import KPI
        from apps.structure.models import Department
        departments = Department.objects.filter(tenant_id=self.tenant_id, is_active=True)
        dept_breakdown = []
        for dept in departments:
            kpis = KPI.objects.filter(
                tenant_id=self.tenant_id,
                department=dept.name,
                is_active=True
            )
            if kpis.exists():
                dept_breakdown.append({
                    'department': dept.name,
                    'kpi_count': kpis.count(),
                    'green_count': kpis.filter(current_status=TrafficLight.GREEN).count(),
                    'red_count': kpis.filter(current_status=TrafficLight.RED).count(),
                    'average_score': kpis.aggregate(Avg('current_score'))['current_score__avg'] or 0
                })
        kpi_categories = KPI.objects.filter(tenant_id=self.tenant_id, is_active=True).values('category').annotate(
            count=Count('id'),
            avg_score=Avg('current_score')
        )
        return {
            'by_department': dept_breakdown,
            'by_category': list(kpi_categories)
        }
    def _get_user_activity(self) -> Dict:
        from apps.accounts.models import User
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        active_users = User.objects.filter(
            tenant_id=self.tenant_id,
            is_active=True,
            last_login__gte=thirty_days_ago
        ).count()
        inactive_users = User.objects.filter(
            tenant_id=self.tenant_id,
            is_active=True,
            last_login__lt=thirty_days_ago
        ).count() if thirty_days_ago else 0
        new_users = User.objects.filter(
            tenant_id=self.tenant_id,
            created_at__gte=thirty_days_ago
        ).count()
        return {
            'active_users_30d': active_users,
            'inactive_users': inactive_users,
            'new_users_30d': new_users,
            'total_logins_30d': User.objects.filter(
                tenant_id=self.tenant_id,
                last_login__gte=thirty_days_ago
            ).count()
        }
    
    def create_export_schedule(self, name: str, dashboard_type: str, format: str, schedule_type: str, recipients: List[str], filters: dict = None) -> Dict:
        from datetime import timedelta
        
        schedule = ExportSchedule.objects.create(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            dashboard_type=dashboard_type,
            format=format,
            schedule_type=schedule_type,
            recipients=recipients,
            filters=filters or {},
            name=name,
            next_run_at=timezone.now() + timedelta(days=1)
        )
        
        self._audit_log(DashboardType.CLIENT_ADMIN, 'create_export', {'schedule_id': str(schedule.id)})
        
        return {
            'id': str(schedule.id),
            'name': schedule.name,
            'schedule_type': schedule.schedule_type,
            'next_run_at': schedule.next_run_at.isoformat()
        }
    
    def create_alert(self, alert_type: str, severity: str, config: dict, frequency: str = 'daily') -> Dict:
        alert = DashboardAlert.objects.create(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            alert_type=alert_type,
            severity=severity,
            config=config,
            frequency=frequency,
            is_active=True
        )
        self._audit_log(DashboardType.CLIENT_ADMIN, 'create_alert', {'alert_id': str(alert.id)})
        return {
            'id': str(alert.id),
            'type': alert.alert_type,
            'severity': alert.severity,
            'is_active': alert.is_active
        }