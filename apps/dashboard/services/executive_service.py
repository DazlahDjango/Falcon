from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from typing import Dict, List, Any, Optional
from .base_service import BaseDashboardService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType, TrafficLight, Defaults
from apps.dashboard.models import DashboardConfig, WidgetConfig, ExecutiveViewPreset, PeriodComparison


class ExecutiveDashboardService(BaseDashboardService):
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(self, executive_user_id: str, filters: dict = None) -> Dict:
        self._validate_dashboard_access(DashboardType.EXECUTIVE)
        
        cache_key = f"executive_dashboard:{self.tenant_id}:{executive_user_id}"
        if filters:
            cache_key = f"{cache_key}:{hash(str(sorted(filters.items())))}"
        
        cached = self.cache_service.get_dashboard_data(executive_user_id, DashboardType.EXECUTIVE, filters)
        if cached:
            return cached
        
        from apps.accounts.models import User
        from apps.kpi.models import KPI, MonthlyActual
        from apps.structure.models import Department
        
        executive = User.objects.get(id=executive_user_id, tenant_id=self.tenant_id)
        
        departments = Department.objects.filter(tenant_id=self.tenant_id, is_active=True)
        
        dept_performance = []
        for dept in departments:
            dept_users = User.objects.filter(
                tenant_id=self.tenant_id,
                department=dept.name,
                is_active=True
            )
            
            dept_data = self._get_department_performance(dept, dept_users)
            dept_performance.append(dept_data)
        
        org_overview = self._get_organization_overview(departments)
        
        top_issues = self._get_top_issues()
        
        kpi_trends = self._get_kpi_trends(filters)
        
        recent_alerts = self._get_recent_alerts()
        
        dashboard_data = {
            'executive_info': {
                'id': str(executive.id),
                'name': executive.get_full_name(),
                'role': executive.role,
                'title': executive.title
            },
            'organization_overview': org_overview,
            'department_performance': dept_performance,
            'top_issues': top_issues,
            'kpi_trends': kpi_trends,
            'recent_alerts': recent_alerts,
            'last_updated': timezone.now().isoformat()
        }
        
        self.cache_service.set_dashboard_data(executive_user_id, DashboardType.EXECUTIVE, dashboard_data, filters)
        self._audit_log(DashboardType.EXECUTIVE, 'view', {'executive_id': executive_user_id})
        
        return dashboard_data
    
    def _get_organization_overview(self, departments) -> Dict:
        from apps.accounts.models import User
        from apps.kpi.models import KPI, MonthlyActual
        
        total_employees = User.objects.filter(
            tenant_id=self.tenant_id,
            is_active=True,
            is_superuser=False
        ).count()
        
        total_departments = departments.count()
        
        all_kpis = KPI.objects.filter(tenant_id=self.tenant_id, is_active=True)
        total_kpis = all_kpis.count()
        
        if total_kpis > 0:
            green_kpis = all_kpis.filter(current_status=TrafficLight.GREEN).count()
            yellow_kpis = all_kpis.filter(current_status=TrafficLight.YELLOW).count()
            red_kpis = all_kpis.filter(current_status=TrafficLight.RED).count()
        else:
            green_kpis = yellow_kpis = red_kpis = 0
        
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        submissions = MonthlyActual.objects.filter(
            tenant_id=self.tenant_id,
            year=current_year,
            month=current_month,
            is_approved=True
        )
        
        total_expected_submissions = total_employees * KPI.objects.filter(
            tenant_id=self.tenant_id, is_active=True
        ).count()
        
        submission_rate = (submissions.count() / total_expected_submissions * 100) if total_expected_submissions > 0 else 0
        
        return {
            'total_employees': total_employees,
            'total_departments': total_departments,
            'total_kpis': total_kpis,
            'kpi_status': {
                TrafficLight.GREEN: green_kpis,
                TrafficLight.YELLOW: yellow_kpis,
                TrafficLight.RED: red_kpis
            },
            'overall_submission_rate': round(submission_rate, 2),
            'active_kpi_percentage': round((total_kpis / (total_employees * 5)) * 100, 2) if total_employees > 0 else 0
        }
    
    def _get_department_performance(self, department, users) -> Dict:
        from apps.kpi.services import ScoreAggregator
        calc_service = ScoreAggregator(self.user, self.tenant_id)
        user_scores = []
        for user in users:
            score = calc_service.aggregate_user(str(user.id))
            if score:
                user_scores.append(score)
        avg_score = sum(user_scores) / len(user_scores) if user_scores else 0
        
        status = TrafficLight.YELLOW
        if avg_score >= 90:
            status = TrafficLight.GREEN
        elif avg_score < 50:
            status = TrafficLight.RED
        
        return {
            'id': str(department.id),
            'name': department.name,
            'employee_count': users.count(),
            'average_score': round(avg_score, 2),
            'status': status,
            'trend': self._calculate_trend(department)
        }
    
    def _calculate_trend(self, department) -> str:
        return 'stable'
    
    def _get_top_issues(self) -> List[Dict]:
        from apps.kpi.models import KPI
        from apps.reviews.models import PIP
        
        red_kpis = KPI.objects.filter(
            tenant_id=self.tenant_id,
            current_status=TrafficLight.RED,
            is_active=True
        )[:5]
        
        active_pips = PIP.objects.filter(
            tenant_id=self.tenant_id,
            status='active'
        ).count()
        
        issues = []
        for kpi in red_kpis:
            issues.append({
                'type': 'red_kpi',
                'kpi_name': kpi.name,
                'owner_id': str(kpi.owner_id) if kpi.owner_id else None,
                'current_score': kpi.current_score,
                'severity': 'critical'
            })
        
        if active_pips > 0:
            issues.append({
                'type': 'active_pips',
                'count': active_pips,
                'severity': 'warning'
            })
        
        return issues[:10]
    
    def _get_kpi_trends(self, filters: dict = None) -> List[Dict]:
        from apps.kpi.models import KPI, MonthlyActual
        
        period = filters.get('period', 'monthly') if filters else 'monthly'
        
        kpis = KPI.objects.filter(tenant_id=self.tenant_id, is_active=True)[:10]
        
        trends = []
        for kpi in kpis:
            actuals = MonthlyActual.objects.filter(
                tenant_id=self.tenant_id,
                kpi_id=kpi.id,
                is_approved=True
            ).order_by('-year', '-month')[:6]
            
            trend_data = [
                {'month': f"{a.year}-{a.month:02d}", 'actual': float(a.actual_value) if a.actual_value else 0}
                for a in actuals
            ]
            
            trends.append({
                'kpi_id': str(kpi.id),
                'kpi_name': kpi.name,
                'current_score': kpi.current_score,
                'status': kpi.current_status,
                'trend': trend_data
            })
        
        return trends
    
    def _get_recent_alerts(self) -> List[Dict]:
        from apps.dashboard.models import DashboardAlert
        
        alerts = DashboardAlert.objects.filter(
            tenant_id=self.tenant_id,
            is_active=True
        ).order_by('-last_triggered_at')[:10]
        
        return [
            {
                'id': str(a.id),
                'type': a.alert_type,
                'severity': a.severity,
                'message': f"{a.get_alert_type_display()} alert",
                'triggered_at': a.last_triggered_at.isoformat() if a.last_triggered_at else None
            }
            for a in alerts
        ]
    
    def get_department_details(self, department_id: str) -> Dict:
        from apps.structure.models import Department
        from apps.accounts.models import User
        from apps.kpi.services import ScoreAggregator
        
        department = Department.objects.get(id=department_id, tenant_id=self.tenant_id)
        
        users = User.objects.filter(
            tenant_id=self.tenant_id,
            department=department.name,
            is_active=True
        )
        
        calc_service = ScoreAggregator(self.user, self.tenant_id)
        user_scores = []
        green_count = yellow_count = red_count = 0
        
        employees_data = []
        for u in users:
            score = calc_service.aggregate_user(str(u.id)) or 0
            if score >= 90: green_count += 1
            elif score >= 50: yellow_count += 1
            else: red_count += 1
            
            user_scores.append(score)
            employees_data.append({
                'id': str(u.id),
                'name': u.get_full_name(),
                'title': u.title,
                'score': float(score)
            })

        avg_score = sum(user_scores) / len(user_scores) if user_scores else 0

        team_data = {
            'total_members': users.count(),
            'green_count': green_count,
            'yellow_count': yellow_count,
            'red_count': red_count,
            'average_score': avg_score,
        }
        
        return {
            'department': {
                'id': str(department.id),
                'name': department.name,
                'description': department.description
            },
            'employees': employees_data,
            'team_aggregate': team_data
        }
    
    def save_view_preset(self, executive_user_id: str, name: str, view_type: str, filters: dict, set_as_default: bool = False) -> Dict:
        preset = ExecutiveViewPreset.objects.create(
            tenant_id=self.tenant_id,
            user_id=executive_user_id,
            name=name,
            view_type=view_type,
            filters=filters,
            is_default=set_as_default
        )
        
        if set_as_default:
            ExecutiveViewPreset.objects.filter(
                tenant_id=self.tenant_id,
                user_id=executive_user_id,
                is_default=True
            ).exclude(id=preset.id).update(is_default=False)
        
        self.cache_service.invalidate_user_dashboards(executive_user_id)
        self._audit_log(DashboardType.EXECUTIVE, 'save_preset', {'preset_id': str(preset.id), 'name': name})
        
        return {
            'id': str(preset.id),
            'name': preset.name,
            'view_type': preset.view_type,
            'filters': preset.filters,
            'is_default': preset.is_default
        }
    
    def create_period_comparison(self, user_id: str, name: str, comparison_type: str, current_period: dict, previous_period: dict) -> Dict:
        from apps.kpi.services import ScoreAggregator
        comparison = PeriodComparison.objects.create(
            tenant_id=self.tenant_id,
            user_id=user_id,
            name=name,
            comparison_type=comparison_type,
            current_period=current_period,
            previous_period=previous_period
        )
        calc_service = ScoreAggregator(self.user, self.tenant_id)
        current_score = calc_service.aggregate_organization(current_period)
        previous_score = calc_service.aggregate_organization(previous_period)
        comparison.cached_results = {
            'current_score': current_score,
            'previous_score': previous_score,
            'variance': (current_score - previous_score) if current_score and previous_score else 0,
            'variance_percentage': ((current_score - previous_score) / previous_score * 100) if previous_score and previous_score > 0 else 0
        }
        comparison.cached_at = timezone.now()
        comparison.save()
        return {
            'id': str(comparison.id),
            'name': comparison.name,
            'comparison_type': comparison.comparison_type,
            'results': comparison.cached_results
        }