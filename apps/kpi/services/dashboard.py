from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db.models import Q, Sum, F, Avg, Count
from django.core.cache import cache
from apps.kpi.models import KPI, Score, TrafficLight, MonthlyActual, AggregatedScore
from apps.kpi.engine import HierarchyAggregator
from ..constants import TrafficLightStatus

class IndividualDashboard:
    def __init__(self):
        self.aggregator = HierarchyAggregator()
    def get_dashboard(self, user_id: str, year: int, month: int) -> Dict:
        cache_key = f"dashboard_individual_{user_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        scores = Score.objects.filter(user_id=user_id, year=year, month=month).select_related('kpi', 'traffic_light')
        kpi_data = []
        for score in scores:
            kpi_data.append({
                'kpi_id': str(score.kpi.id),
                'kpi_name': score.kpi.name,
                'score': float(score.score),
                'status': score.traffic_light.status if hasattr(score, 'traffic_light') else 'UNKNOWN',
                'actual_value': float(score.actual_value),
                'target_value': float(score.target_value)
            })
        aggregated = self.aggregator.aggregate_for_user(user_id, year, month)
        recent_actuals = MonthlyActual.objects.filter(
            user_id=user_id,
            year=year,
            month__lte=month
        ).order_by('-year', '-month')[:5]
        dashboad = {
            'user_id': user_id,
            'period': f"{year}-{month:02d}",
            'overall_score': float(aggregated) if aggregated else 0,
            'kpi_count': len(kpi_data),
            'kpis': kpi_data,
            'recent_activity': [
                {
                    'kpi': a.kpi.name,
                    'actual': float(a.actual_value),
                    'month': a.month,
                    'status': a.status
                }
                for a in recent_actuals
            ]
        }

class ManagerDashboard:
    def __init__(self):
        self.aggregator = HierarchyAggregator()
    def get_dashboard(self, manager_id: str, year: int, month: int) -> Dict:
        cache_key = f"dashboard_manager_{manager_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        hierarchy = self.aggregator.get_hierarchy_dashboard(manager_id, year, month)
        team_members = hierarchy.get('direct_reports', [])
        status_count = {'GREEN': 0, 'YELLOW': 0, 'RED': 0}
        for member in team_members:
            status = member.get('traffic_light', 'YELLOW')
            status_count[status] = status_count.get(status, 0) + 1
        pending = MonthlyActual.objects.filter(
            user_id__in=[m['user_id'] for m in team_members],
            year=year,
            month=month,
            status='PENDING'
        ).count()
        from ..managers import MonthlyActualManager
        missing = MonthlyActualManager().missing_for_period(
            [m['user_id'] for m in team_members], year, month
        )
        dashboard = {
             'manager_id': manager_id,
            'period': f"{year}-{month:02d}",
            'manager_score': float(hierarchy.get('user_score', 0)),
            'manager_status': hierarchy.get('user_traffic_light', 'YELLOW'),
            'team_size': hierarchy.get('team_count', 0),
            'team_avg_score': float(hierarchy.get('avg_team_score', 0)),
            'status_distribution': status_count,
            'pending_validations': pending,
            'missing_submissions': len(missing),
            'team_members': [
                {
                    'user_id': m['user_id'],
                    'name': m.get('name', 'Unknown'),
                    'score': float(m.get('score', 0)),
                    'status': m.get('traffic_light', 'YELLOW')
                }
                for m in team_members
            ]
        }
        cache.set(cache_key, dashboard, 300)
        return dashboard
    
class ExecutiveDashboard:
    def get_dashboard(self, tenant_id: str, year: int, month: int) -> Dict:
        cache_key = f"dashboard_executive_{tenant_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        org_health = AggregatedScore.objects.filter(
            level='ORGANIZATION',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).first()
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).order_by('-aggregated_score')[:10]
        red_count = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month,
            status='RED'
        ).count()
        total_kpis = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).count()
        red_percentage = (red_count / total_kpis * 100) if total_kpis > 0 else 0
        total_expected = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).count()
        validated = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            status='APPROVED'
        ).count()
        compliance_rate = (validated / total_expected * 100) if total_expected > 0 else 0
        dashboard = {
            'tenant_id': tenant_id,
            'period': f"{year}-{month:02d}",
            'overall_health': float(org_health.aggregated_score) if org_health else 0,
            'red_kpi_count': red_count,
            'red_kpi_percentage': round(red_percentage, 2),
            'validation_compliance': round(compliance_rate, 2),
            'department_rankings': [
                {
                    'department': d.entity_name,
                    'score': float(d.aggregated_score)
                }
                for d in dept_scores
            ],
            'trend': self._get_trend_data(tenant_id, year, month)
        }
        cache.set(cache_key, dashboard, 300)
        return dashboard
    def _get_trend_data(self, tenant_id: str, year: int, month: int) -> List[Dict]:
        trends = []
        for m in range(max(1, month-5), month+1):
            org_score = AggregatedScore.objects.filter(
                level='ORGANIZATION',
                tenant_id=tenant_id,
                year=year,
                month=m
            ).first()
            trends.append({
                'period': f"{year}-{m:02d}",
                'score': float(org_score.aggregated_score) if org_score else 0
            })
        return trends

class ChampionDashboard:
    def get_dashboard(self, champion_id: str, year: int, month: int) -> Dict:
        from apps.organisations.models import Department
        from apps.accounts.models import User
        tenant_id = User.objects.get(id=champion_id).tenant_id
        departments = Department.objects.filter(tenant_id=tenant_id)
        dept_compliance = []
        for dept in departments:
            members = User.objects.filter(department=dept, is_active=True)
            total_members = members.count()
            submitted = MonthlyActual.objects.filter(
                user_id__in=members.values_list('id', flat=True),
                year=year,
                month=month
            ).values('user_id').distinct().count()
            compliance = (submitted / total_members * 100) if total_members > 0 else 0
            dept_compliance.append({
                'department': dept.name,
                'total_members': total_members,
                'submitted': submitted,
                'compliance_rate': round(compliance, 2)
            })
        from ..models import Escalation
        pending_escalations = Escalation.objects.filter(
            tenant_id=tenant_id,
            status='PENDING'
        ).count()
        unvalidated = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            status='PENDING'
        ).count()
        dashboard = {
            'champion_id': champion_id,
            'period': f"{year}-{month:02d}",
            'department_compliance': dept_compliance,
            'organization_submission_rate': self._get_org_submission_rate(tenant_id, year, month),
            'pending_escalations': pending_escalations,
            'unvalidated_entries': unvalidated,
            'red_kpi_alerts': self._get_red_kpi_alerts(tenant_id, year, month)
        }
        return dashboard
    
    def _get_org_submission_rate(self, tenant_id: str, year: int, month: int) -> float:
        from apps.accounts.models import User
        total_users = User.objects.filter(tenant_id=tenant_id, is_active=True).count()
        submitted = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values('user_id').distinct().count()
        return (submitted / total_users * 100) if total_users > 0 else 0
    def _get_red_kpi_alerts(self, tenant_id: str, year: int, month: int) -> List[Dict]:
        from ..models import TrafficLight, KPI
        red_kpis = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month,
            status='RED',
            consecutive_red_count__gte=2
        ).select_related('score__kpi', 'score__user')
        return [
            {
                'kpi': kpi.score.kpi.name,
                'user': kpi.score.user.email,
                'consecutive_months': kpi.consecutive_red_count,
                'score': float(kpi.score_value)
            }
            for kpi in red_kpis
        ]

class RealtimeDashboard:
    def __init__(self):
        self.channel_layer = None
        self._init_channel_layer()
    def _init_channel_layer(self):
        try:
            from channels.layers import get_channel_layer
            self.channel_layer = get_channel_layer()
        except:
            pass
    async def push_score_update(self, user_id: str, score_data: Dict):
        if self.channel_layer:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                f"user_{user_id}",
                {
                    'type': 'score_update',
                    'data': score_data
                }
            )
    async def push_team_update(self, manager_id: str, team_data: Dict):
        if self.channel_layer:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                f"manager_{manager_id}",
                {
                    'type': 'team_update',
                    'data': team_data
                }
            )
    async def push_validation_status(self, user_id: str, validation_data: Dict):
        if self.channel_layer:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                f"user_{user_id}",
                {
                    'type': 'validation_update',
                    'data': validation_data
                }
            )