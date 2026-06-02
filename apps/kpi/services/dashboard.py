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
        scores = Score.objects.filter(
            user_id=user_id, 
            year=year, 
            month=month
        ).select_related('kpi')  # Only select_related 'kpi', not 'traffic_light'
        
        kpi_data = []
        for score in scores:
            # Calculate status based on score percentage instead of traffic_light
            status = self._calculate_status(score.score, score.target_value)
            
            kpi_data.append({
                'kpi_id': str(score.kpi.id),
                'kpi_name': score.kpi.name,
                'score': float(score.score),
                'status': status,
                'actual_value': float(score.actual_value) if hasattr(score, 'actual_value') else float(score.score),
                'target_value': float(score.target_value) if hasattr(score, 'target_value') else 100
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
                    'kpi': a.kpi.name if hasattr(a, 'kpi') else 'Unknown',
                    'actual': float(a.actual_value) if hasattr(a, 'actual_value') else 0,
                    'month': a.month,
                    'status': getattr(a, 'status', 'COMPLETED')
                }
                for a in recent_actuals
            ]
        }
        
        cache.set(cache_key, dashboard, 300)
        return dashboard
    
    def _calculate_status(self, score: float, target_value: float = 100) -> str:
        """Calculate status based on score percentage"""
        if target_value and target_value > 0:
            percentage = (score / target_value) * 100
            if percentage >= 90:
                return 'GREEN'
            elif percentage >= 70:
                return 'YELLOW'
            else:
                return 'RED'
        return 'YELLOW'

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
        
        # Calculate status distribution from scores instead of traffic_light
        status_count = {'GREEN': 0, 'YELLOW': 0, 'RED': 0}
        
        for member in team_members:
            # Get member's overall score and calculate status
            member_score = member.get('score', 0)
            status = self._calculate_status_from_score(member_score)
            status_count[status] = status_count.get(status, 0) + 1
        
        # Get pending submissions
        member_ids = [m['user_id'] for m in team_members if m.get('user_id')]
        
        pending = MonthlyActual.objects.filter(
            user_id__in=member_ids,
            year=year,
            month=month,
            status='PENDING'
        ).count()
        
        from ..managers import MonthlyActualManager
        missing = MonthlyActualManager().missing_for_period(member_ids, year, month) if member_ids else []
        
        dashboard = {
            'manager_id': manager_id,
            'period': f"{year}-{month:02d}",
            'manager_score': float(hierarchy.get('user_score', 0)),
            'manager_status': self._calculate_status_from_score(hierarchy.get('user_score', 0)),
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
                    'status': self._calculate_status_from_score(m.get('score', 0))
                }
                for m in team_members
            ]
        }
        
        cache.set(cache_key, dashboard, 300)
        return dashboard
    
    def _calculate_status_from_score(self, score: float) -> str:
        """Calculate status based on score percentage"""
        if score >= 90:
            return 'GREEN'
        elif score >= 70:
            return 'YELLOW'
        else:
            return 'RED'
    
class ExecutiveDashboard:
    def get_dashboard(self, tenant_id: str, year: int, month: int) -> Dict:
        cache_key = f"dashboard_executive_{tenant_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Build dashboard without traffic_light dependency
        dashboard = self._build_executive_dashboard(tenant_id, year, month)
        cache.set(cache_key, dashboard, 300)
        return dashboard
    
    def _build_executive_dashboard(self, tenant_id: str, year: int, month: int) -> Dict:
        """Build executive dashboard without traffic_light model"""
        
        # Get all scores for the tenant
        scores = Score.objects.filter(
            kpi__tenant_id=tenant_id,
            year=year,
            month=month
        ).select_related('kpi', 'user')
        
        total_kpis = scores.count()
        avg_score = scores.aggregate(Avg('score'))['score__avg'] or 0
        
        # Calculate status distribution
        green_count = 0
        yellow_count = 0
        red_count = 0
        
        for score in scores:
            if score.score >= 90:
                green_count += 1
            elif score.score >= 70:
                yellow_count += 1
            else:
                red_count += 1
        
        # Department performance
        from apps.accounts.models import User
        department_performance = {}
        
        for score in scores:
            user = score.user
            dept = getattr(user, 'department_name', 'Unassigned')
            if dept not in department_performance:
                department_performance[dept] = {
                    'total_scores': 0,
                    'total_score': 0,
                    'green_count': 0,
                    'yellow_count': 0,
                    'red_count': 0
                }
            
            department_performance[dept]['total_scores'] += 1
            department_performance[dept]['total_score'] += score.score
            
            if score.score >= 90:
                department_performance[dept]['green_count'] += 1
            elif score.score >= 70:
                department_performance[dept]['yellow_count'] += 1
            else:
                department_performance[dept]['red_count'] += 1
        
        # Calculate averages
        for dept in department_performance:
            total = department_performance[dept]['total_scores']
            department_performance[dept]['avg_score'] = department_performance[dept]['total_score'] / total if total > 0 else 0
        
        # Top and bottom KPIs
        kpi_performance = {}
        for score in scores:
            kpi_name = score.kpi.name
            if kpi_name not in kpi_performance:
                kpi_performance[kpi_name] = {
                    'scores': [],
                    'avg_score': 0,
                    'status': 'YELLOW'
                }
            kpi_performance[kpi_name]['scores'].append(score.score)
        
        for kpi_name in kpi_performance:
            scores_list = kpi_performance[kpi_name]['scores']
            avg = sum(scores_list) / len(scores_list) if scores_list else 0
            kpi_performance[kpi_name]['avg_score'] = avg
            
            if avg >= 90:
                kpi_performance[kpi_name]['status'] = 'GREEN'
            elif avg >= 70:
                kpi_performance[kpi_name]['status'] = 'YELLOW'
            else:
                kpi_performance[kpi_name]['status'] = 'RED'
        
        # Sort by performance
        top_kpis = sorted(kpi_performance.items(), key=lambda x: x[1]['avg_score'], reverse=True)[:10]
        bottom_kpis = sorted(kpi_performance.items(), key=lambda x: x[1]['avg_score'])[:5]
        
        return {
            'tenant_id': tenant_id,
            'period': f"{year}-{month:02d}",
            'summary': {
                'total_kpis': total_kpis,
                'average_score': round(avg_score, 2),
                'green_count': green_count,
                'yellow_count': yellow_count,
                'red_count': red_count,
                'completion_rate': round((green_count + yellow_count) / total_kpis * 100, 2) if total_kpis > 0 else 0
            },
            'department_performance': department_performance,
            'top_performing_kpis': [{'name': name, 'avg_score': round(data['avg_score'], 2), 'status': data['status']} for name, data in top_kpis],
            'bottom_performing_kpis': [{'name': name, 'avg_score': round(data['avg_score'], 2), 'status': data['status']} for name, data in bottom_kpis],
            'trend': self._calculate_trend(tenant_id, year, month)
        }
    
    def _calculate_trend(self, tenant_id: str, current_year: int, current_month: int) -> Dict:
        """Calculate performance trend over last 3 months"""
        trend_data = []
        
        for i in range(3):
            year = current_year
            month = current_month - i
            if month <= 0:
                month += 12
                year -= 1
            
            avg_score = Score.objects.filter(
                kpi__tenant_id=tenant_id,
                year=year,
                month=month
            ).aggregate(Avg('score'))['score__avg']
            
            trend_data.append({
                'period': f"{year}-{month:02d}",
                'avg_score': round(avg_score, 2) if avg_score else 0
            })
        
        return {
            'trend': trend_data,
            'direction': 'up' if len(trend_data) >= 2 and trend_data[0]['avg_score'] > trend_data[1]['avg_score'] else 'down'
        }

class ChampionDashboard:
    def get_dashboard(self, champion_id: str, year: int, month: int) -> Dict:
        cache_key = f"dashboard_champion_{champion_id}_{year}_{month}"
        cached = cache.get(cache_key)
        if cached:
            return cached
            
        from apps.structure.models import Department
        from apps.accounts.models import User
        
        champion = User.objects.get(id=champion_id)
        tenant_id = champion.tenant_id
        
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
        
        # Get red KPIs (scores below 70%)
        red_kpis = Score.objects.filter(
            kpi__tenant_id=tenant_id,
            year=year,
            month=month,
            score__lt=70
        ).select_related('kpi', 'user')[:10]
        
        dashboard = {
            'champion_id': champion_id,
            'period': f"{year}-{month:02d}",
            'department_compliance': dept_compliance,
            'organization_submission_rate': self._get_org_submission_rate(tenant_id, year, month),
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
                    'consecutive_months': self._get_consecutive_red_months(score.user_id, score.kpi_id, year, month),
                    'score': float(score.score)
                }
                for score in red_kpis
            ]
        }
        
        cache.set(cache_key, dashboard, 300)
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
    
    def _get_consecutive_red_months(self, user_id: str, kpi_id: str, current_year: int, current_month: int) -> int:
        """Calculate consecutive months with RED status"""
        consecutive = 0
        year = current_year
        month = current_month
        
        for i in range(6):  # Check up to 6 months back
            score = Score.objects.filter(
                user_id=user_id,
                kpi_id=kpi_id,
                year=year,
                month=month,
                score__lt=70
            ).first()
            
            if score:
                consecutive += 1
                month -= 1
                if month <= 0:
                    month = 12
                    year -= 1
            else:
                break
        
        return consecutive
        
class RealtimeDashboard:
    """Backward-compatible facade — delegates to KPIEventBroadcaster (sync)."""

    def push_score_update(self, user_id: str, score_data: Dict):
        from .realtime import KPIEventBroadcaster
        KPIEventBroadcaster.score_updated(
            user_id=user_id,
            kpi_id=score_data.get('kpi_id', ''),
            score=score_data.get('score', 0),
            period=score_data.get('period', ''),
            status=score_data.get('status', 'UNKNOWN'),
            manager_id=score_data.get('manager_id'),
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
            supervisor_id=validation_data.get('supervisor_id'),
        )