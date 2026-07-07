from django.core.exceptions import PermissionDenied
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from typing import Dict, List, Any, Optional
from .base_service import BaseDashboardService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType, TrafficLight, Defaults


class SuperAdminDashboardService(BaseDashboardService):
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(self) -> Dict:
        if self.user_role != 'super_admin':
            raise PermissionDenied("Only Super Admin can access this dashboard")
        cache_key = f"super_admin_dashboard"
        cached = self.cache_service.get_dashboard_data(self.user_id, DashboardType.SUPER_ADMIN)
        if cached:
            return cached
        from apps.tenant.models import Organization
        from apps.dashboard.models import TenantOverviewSnapshot
        tenants = Organization.objects.filter(is_active=True)
        tenant_summaries = []
        for tenant in tenants:
            snapshot = TenantOverviewSnapshot.objects.filter(
                client_id=tenant.id
            ).order_by('-snapshot_date').first()
            if snapshot:
                tenant_summaries.append(self._serialize_tenant_snapshot(snapshot))
            else:
                tenant_summaries.append(self._get_tenant_basic_info(tenant))
        system_health = self._get_system_health()
        subscription_alerts = self._get_subscription_alerts(tenants)
        platform_metrics = self._get_platform_metrics()
        dashboard_data = {
            'platform_overview': {
                'total_tenants': tenants.count(),
                'active_tenants': tenants.filter(subscription_status='active').count(),
                'trial_tenants': tenants.filter(subscription_status='trial').count(),
                'total_revenue': self._calculate_total_revenue(tenants)
            },
            'tenant_summaries': tenant_summaries,
            'system_health': system_health,
            'subscription_alerts': subscription_alerts,
            'platform_metrics': platform_metrics,
            'last_updated': timezone.now().isoformat()
        }
        self.cache_service.set_dashboard_data(self.user_id, DashboardType.SUPER_ADMIN, dashboard_data, ttl=Defaults.CACHE_TTL)
        self._audit_log(DashboardType.SUPER_ADMIN, 'view', {})
        return dashboard_data
    
    def _serialize_tenant_snapshot(self, snapshot) -> Dict:
        return {
            'client_id': str(snapshot.client_id),
            'client_name': snapshot.client_name,
            'subscription_status': snapshot.subscription_status,
            'subscription_plan': snapshot.subscription_plan,
            'subscription_expires_at': snapshot.subscription_expires_at.isoformat() if snapshot.subscription_expires_at else None,
            'total_users': snapshot.total_users,
            'active_users': snapshot.active_users,
            'kpi_green_count': snapshot.kpi_green_count,
            'kpi_red_count': snapshot.kpi_red_count,
            'avg_individual_score': float(snapshot.avg_individual_score) if snapshot.avg_individual_score else 0,
            'data_submission_rate': float(snapshot.data_submission_rate) if snapshot.data_submission_rate else 0,
            'health_score': self._calculate_health_score(snapshot),
            'days_until_expiry': (snapshot.subscription_expires_at - timezone.now()).days if snapshot.subscription_expires_at else None
        }
    
    def _get_tenant_basic_info(self, tenant) -> Dict:
        from apps.accounts.models import User
        from apps.kpi.models import KPI
        user_count = User.objects.filter(tenant_id=tenant.id, is_active=True).count()
        kpi_count = KPI.objects.filter(tenant_id=tenant.id, is_active=True).count()
        return {
            'client_id': str(tenant.id),
            'client_name': tenant.name,
            'subscription_status': getattr(tenant, 'subscription_status', 'unknown'),
            'subscription_plan': getattr(tenant, 'subscription_plan', 'unknown'),
            'total_users': user_count,
            'total_kpis': kpi_count,
            'health_score': 0
        }
    
    def _calculate_health_score(self, snapshot) -> float:
        scores = []
        if snapshot.data_submission_rate:
            scores.append(float(snapshot.data_submission_rate))
        if snapshot.avg_individual_score:
            scores.append(float(snapshot.avg_individual_score))
        if snapshot.total_kpis > 0:
            green_percentage = (snapshot.kpi_green_count / snapshot.total_kpis) * 100
            scores.append(green_percentage)
        return round(sum(scores) / len(scores), 2) if scores else 0
    
    def _get_system_health(self) -> Dict:
        return {
            'api_status': 'operational',
            'database_status': 'operational',
            'cache_status': 'operational',
            'last_incident': None,
            'uptime_percentage': 99.95
        }
    def _get_subscription_alerts(self, tenants) -> List[Dict]:
        alerts = []
        thirty_days_from_now = timezone.now() + timezone.timedelta(days=30)
        for tenant in tenants:
            expires_at = getattr(tenant, 'subscription_expires_at', None)
            if expires_at and expires_at <= thirty_days_from_now:
                alerts.append({
                    'tenant_id': str(tenant.id),
                    'tenant_name': tenant.name,
                    'alert_type': 'subscription_expiring',
                    'expires_at': expires_at.isoformat(),
                    'days_remaining': (expires_at - timezone.now()).days,
                    'severity': 'critical' if (expires_at - timezone.now()).days <= 7 else 'warning'
                })
        return alerts
    
    def _get_platform_metrics(self) -> Dict:
        from apps.accounts.models import User
        from apps.kpi.models import KPI, MonthlyActual
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        total_users_across_tenants = User.objects.filter(is_active=True).count()
        total_kpis_across_tenants = KPI.objects.filter(is_active=True).count()
        total_submissions = MonthlyActual.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        return {
            'total_users_platform': total_users_across_tenants,
            'total_kpis_platform': total_kpis_across_tenants,
            'submissions_last_30d': total_submissions,
            'avg_tenants_per_day': self._calculate_avg_tenants_per_day()
        }
    
    def _calculate_total_revenue(self, tenants) -> Dict:
        active_subscriptions = tenants.filter(subscription_status='active')
        return {
            'monthly_recurring': active_subscriptions.count() * 99,
            'annual_recurring': active_subscriptions.count() * 990,
            'total_active_subscriptions': active_subscriptions.count()
        }
    
    def _calculate_avg_tenants_per_day(self) -> float:
        return 0
    
    def get_tenant_details(self, client_id: str) -> Dict:
        from apps.tenant.models import Client
        from apps.accounts.models import User
        from apps.kpi.models import KPI
        from apps.billing.models import Subscription
        tenant = Client.objects.get(id=client_id)
        users = User.objects.filter(tenant_id=client_id, is_active=True)
        kpis = KPI.objects.filter(tenant_id=client_id, is_active=True)
        subscription = Subscription.objects.filter(tenant_id=client_id).first()
        return {
            'tenant': {
                'id': str(tenant.id),
                'name': tenant.name,
                'subscription_status': getattr(tenant, 'subscription_status', 'unknown'),
                'subscription_plan': getattr(tenant, 'subscription_plan', 'unknown'),
                'created_at': tenant.created_at.isoformat() if hasattr(tenant, 'created_at') else None
            },
            'users': {
                'total': users.count(),
                'active': users.filter(is_active=True).count(),
                'by_role': users.values('role').annotate(count=Count('id'))
            },
            'kpis': {
                'total': kpis.count(),
                'green': kpis.filter(current_status=TrafficLight.GREEN).count(),
                'red': kpis.filter(current_status=TrafficLight.RED).count()
            },
            'subscription': {
                'plan': subscription.plan.name if subscription else None,
                'status': subscription.status if subscription else None,
                'start_date': subscription.start_date.isoformat() if subscription and subscription.start_date else None,
                'end_date': subscription.end_date.isoformat() if subscription and subscription.end_date else None
            } if subscription else None
        }
    
    def refresh_tenant_snapshot(self, client_id: str) -> Dict:
        from apps.tenant.models import Client
        from apps.accounts.models import User
        from apps.kpi.models import KPI, MonthlyActual
        from apps.dashboard.models import TenantOverviewSnapshot
        tenant = Client.objects.get(id=client_id)
        users = User.objects.filter(tenant_id=client_id, is_active=True)
        kpis = KPI.objects.filter(tenant_id=client_id, is_active=True)
        from apps.kpi.services import ScoreAggregator
        calc_service = ScoreAggregator(self.user, client_id)
        user_scores = []
        for user in users:
            score = calc_service.aggregate_user(str(user.id))
            if score:
                user_scores.append(score)
        avg_score = sum(user_scores) / len(user_scores) if user_scores else None
        current_month = timezone.now().month
        current_year = timezone.now().year
        submissions = MonthlyActual.objects.filter(
            tenant_id=client_id,
            year=current_year,
            month=current_month
        )
        total_expected = users.count() * kpis.count()
        submission_rate = (submissions.count() / total_expected * 100) if total_expected > 0 else 0
        snapshot, created = TenantOverviewSnapshot.objects.update_or_create(
            client_id=client_id,
            snapshot_date=timezone.now().date(),
            defaults={
                'client_name': tenant.name,
                'subscription_status': getattr(tenant, 'subscription_status', 'active'),
                'subscription_plan': getattr(tenant, 'subscription_plan', 'basic'),
                'total_users': users.count(),
                'active_users': users.filter(is_active=True, last_login__gte=timezone.now() - timezone.timedelta(days=30)).count(),
                'total_kpis': kpis.count(),
                'kpi_green_count': kpis.filter(current_status=TrafficLight.GREEN).count(),
                'kpi_yellow_count': kpis.filter(current_status=TrafficLight.YELLOW).count(),
                'kpi_red_count': kpis.filter(current_status=TrafficLight.RED).count(),
                'avg_individual_score': avg_score,
                'data_submission_rate': submission_rate,
                'is_stale': False
            }
        )
        self.cache_service.invalidate_user_dashboards(self.user_id)
        return {
            'client_id': str(client_id),
            'snapshot_date': snapshot.snapshot_date.isoformat(),
            'created': created
        }