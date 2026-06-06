from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.db.models import Q, Avg, Count, Sum
from django.core.cache import cache
from django.utils import timezone
import logging
from apps.kpi.models import KPI, Score, MonthlyActual, AggregatedScore, TrafficLight
from apps.kpi.engine import HierarchyAggregator
from .analytics import get_department_rollups, get_organization_health, get_kpi_summaries

logger = logging.getLogger(__name__)

CACHE_TTL = 300
CACHE_PREFIX = "kpi_dashboard"


class IndividualDashboard:
    def __init__(self):
        self.aggregator = HierarchyAggregator()

    def get_dashboard(self, user_id: str, year: int, month: int) -> Dict:
        cache_key = f"{CACHE_PREFIX}:individual_{user_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        scores = Score.objects.filter(
            user_id=user_id,
            year=year,
            month=month
        ).select_related('kpi', 'user')

        kpi_data = []
        for score in scores:
            traffic_light = score.traffic_lights.first()
            status = traffic_light.status if traffic_light else self._calculate_status(score.score)

            kpi_data.append({
                'kpi_id': str(score.kpi.id),
                'kpi_name': score.kpi.name,
                'score': float(score.score),
                'status': status,
                'actual_value': float(score.actual_value),
                'target_value': float(score.target_value)
            })

        aggregated = self.aggregator.aggregate_for_user(user_id, year, month)

        recent_actuals = MonthlyActual.objects.filter(
            user_id=user_id,
            year=year,
            month__lte=month
        ).order_by('-year', '-month')[:5]

        dashboard = {
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

        cache.set(cache_key, dashboard, CACHE_TTL)
        return dashboard

    def _calculate_status(self, score: float) -> str:
        if score >= 90:
            return 'GREEN'
        elif score >= 70:
            return 'YELLOW'
        return 'RED'


class ManagerDashboard:
    def __init__(self):
        self.aggregator = HierarchyAggregator()

    def get_dashboard(self, manager_id: str, year: int, month: int) -> Dict:
        cache_key = f"{CACHE_PREFIX}:manager_{manager_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        hierarchy = self.aggregator.get_hierarchy_dashboard(manager_id, year, month)
        team_members = hierarchy.get('direct_reports', [])

        status_count = {'GREEN': 0, 'YELLOW': 0, 'RED': 0}
        for member in team_members:
            member_score = member.get('score', 0)
            status = self._calculate_status(member_score)
            status_count[status] = status_count.get(status, 0) + 1

        member_ids = [m.get('user_id') for m in team_members if m.get('user_id')]
        pending = MonthlyActual.objects.filter(
            user_id__in=member_ids,
            year=year,
            month=month,
            status='PENDING'
        ).count()

        missing = self._get_missing_submissions(member_ids, year, month)

        dashboard = {
            'manager_id': manager_id,
            'period': f"{year}-{month:02d}",
            'manager_score': float(hierarchy.get('user_score', 0)),
            'manager_status': self._calculate_status(hierarchy.get('user_score', 0)),
            'team_size': hierarchy.get('team_count', 0),
            'team_avg_score': float(hierarchy.get('avg_team_score', 0)),
            'status_distribution': status_count,
            'pending_validations': pending,
            'missing_submissions': len(missing),
            'team_members': [
                {
                    'user_id': m.get('user_id', ''),
                    'name': m.get('name', 'Unknown'),
                    'score': float(m.get('score', 0)),
                    'status': self._calculate_status(m.get('score', 0))
                }
                for m in team_members
            ]
        }

        cache.set(cache_key, dashboard, CACHE_TTL)
        return dashboard

    def _calculate_status(self, score: float) -> str:
        if score >= 90:
            return 'GREEN'
        elif score >= 70:
            return 'YELLOW'
        return 'RED'

    def _get_missing_submissions(self, user_ids: List[str], year: int, month: int) -> List[str]:
        if not user_ids:
            return []
        submitted = MonthlyActual.objects.filter(
            user_id__in=user_ids,
            year=year,
            month=month
        ).values_list('user_id', flat=True).distinct()
        return list(set(user_ids) - set(submitted))


class ExecutiveDashboard:
    def get_dashboard(self, tenant_id: str, year: int, month: int) -> Dict:
        cache_key = f"{CACHE_PREFIX}:executive_{tenant_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        health = get_organization_health(tenant_id, year, month)
        rollups = get_department_rollups(tenant_id, year, month)

        department_rankings = []
        for idx, r in enumerate(rollups[:15]):
            department_rankings.append({
                'department_id': r.get('department_id'),
                'department': r.get('department_name', 'Unknown'),
                'score': r.get('overall_score', 0),
                'rank': idx + 1
            })

        tl_qs = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month
        )
        green_count = tl_qs.filter(status='GREEN').count()
        yellow_count = tl_qs.filter(status='YELLOW').count()
        red_count = tl_qs.filter(status='RED').count()
        total_tl = green_count + yellow_count + red_count
        red_pct = (red_count / total_tl * 100) if total_tl > 0 else 0

        total_kpis = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).count()

        history = self._get_health_history(tenant_id, year, month, months_back=6)

        dashboard = {
            'tenant_id': tenant_id,
            'period': f"{year}-{month:02d}",
            'overall_health': health.get('overall_health_score', 0),
            'red_kpi_count': health.get('red_kpi_count', 0),
            'red_kpi_percentage': round(red_pct, 2),
            'validation_compliance': health.get('validation_compliance_rate', 0),
            'kpi_completion_rate': health.get('kpi_completion_rate', 0),
            'department_rankings': department_rankings,
            'trend_data': history,
            'total_kpis': total_kpis or health.get('total_kpi_count', 0),
            'green_count': green_count,
            'yellow_count': yellow_count,
            'red_count': red_count,
            'active_employees': health.get('active_employees', 0),
            'risk_indicators': {
                'risk_level': health.get('risk_level', 'MEDIUM'),
                'data_source': health.get('source', 'live')
            }
        }

        cache.set(cache_key, dashboard, CACHE_TTL // 2)
        return dashboard

    def _get_health_history(self, tenant_id: str, year: int, month: int, months_back: int = 6) -> List[Dict]:
        history = []
        for i in range(months_back):
            y = year
            m = month - i
            if m < 1:
                m += 12
                y -= 1
            health = get_organization_health(tenant_id, y, m)
            history.append({
                'period': f"{y}-{m:02d}",
                'score': health.get('overall_health_score', 0)
            })
        return list(reversed(history))


class ChampionDashboard:
    def get_dashboard(self, champion_id: str, year: int, month: int) -> Dict:
        from apps.accounts.models import User
        
        cache_key = f"{CACHE_PREFIX}:champion_{champion_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            champion = User.objects.get(id=champion_id)
        except User.DoesNotExist:
            return {'error': 'Champion not found'}

        tenant_id = str(champion.tenant_id)
        rollups = get_department_rollups(tenant_id, year, month)

        red_scores = Score.objects.filter(
            kpi__tenant_id=tenant_id,
            year=year,
            month=month,
            score__lt=70
        ).select_related('kpi', 'user')[:10]

        dashboard = {
            'champion_id': champion_id,
            'period': f"{year}-{month:02d}",
            'department_compliance': self._get_department_compliance(tenant_id, year, month, rollups),
            'organization_submission_rate': self._get_submission_rate(tenant_id, year, month),
            'pending_escalations': 0,
            'unvalidated_entries': MonthlyActual.objects.filter(
                tenant_id=tenant_id,
                year=year,
                month=month,
                status='PENDING'
            ).count(),
            'red_kpi_alerts': [
                {
                    'kpi': score.kpi.name,
                    'user': score.user.email,
                    'consecutive_months': self._get_consecutive_red_months(
                        str(score.user_id), str(score.kpi_id), year, month
                    ),
                    'score': float(score.score)
                }
                for score in red_scores
            ]
        }

        cache.set(cache_key, dashboard, CACHE_TTL)
        return dashboard

    def _get_department_compliance(self, tenant_id: str, year: int, month: int, rollups: List[Dict]) -> List[Dict]:
        from apps.accounts.models import User

        compliance = []
        for dept in rollups[:20]:
            dept_id = dept.get('department_id')
            if not dept_id:
                continue

            members = User.objects.filter(department_id=dept_id, tenant_id=tenant_id, is_active=True)
            total = members.count()

            if total == 0:
                continue

            submitted = MonthlyActual.objects.filter(
                user_id__in=list(members.values_list('id', flat=True)),
                year=year,
                month=month
            ).values('user_id').distinct().count()

            compliance.append({
                'department': dept.get('department_name', 'Unknown'),
                'total_members': total,
                'submitted': submitted,
                'compliance_rate': round((submitted / total) * 100, 2) if total > 0 else 0
            })

        return compliance

    def _get_submission_rate(self, tenant_id: str, year: int, month: int) -> float:
        from apps.accounts.models import User

        total_users = User.objects.filter(tenant_id=tenant_id, is_active=True).count()
        if total_users == 0:
            return 0

        submitted = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values('user_id').distinct().count()

        return round((submitted / total_users) * 100, 2)

    def _get_consecutive_red_months(self, user_id: str, kpi_id: str, current_year: int, current_month: int) -> int:
        consecutive = 0
        year = current_year
        month = current_month

        for _ in range(6):
            score = Score.objects.filter(
                user_id=user_id,
                kpi_id=kpi_id,
                year=year,
                month=month
            ).first()

            if score and score.score < 70:
                consecutive += 1
                month -= 1
                if month <= 0:
                    month = 12
                    year -= 1
            else:
                break

        return consecutive


class RealtimeDashboard:
    def push_score_update(self, user_id: str, score_data: Dict):
        from .realtime import KPIEventBroadcaster
        
        KPIEventBroadcaster.score_updated(
            user_id=user_id,
            kpi_id=score_data.get('kpi_id', ''),
            score=score_data.get('score', 0),
            period=score_data.get('period', ''),
            status=score_data.get('status', 'UNKNOWN'),
            manager_id=score_data.get('manager_id')
        )

    def push_team_update(self, manager_id: str, team_data: Dict):
        from .realtime import KPIEventBroadcaster
        
        KPIEventBroadcaster._group_send(f'manager_{manager_id}', 'team_update', team_data)

    def push_validation_status(self, user_id: str, validation_data: Dict):
        from .realtime import KPIEventBroadcaster
        
        KPIEventBroadcaster.validation_updated(
            user_id=user_id,
            actual_id=validation_data.get('actual_id', ''),
            status=validation_data.get('status', ''),
            kpi_id=validation_data.get('kpi_id'),
            supervisor_id=validation_data.get('supervisor_id')
        )