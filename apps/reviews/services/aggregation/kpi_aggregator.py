from decimal import Decimal
from typing import List, Dict, Optional, Any
from django.utils import timezone
from django.db.models import Avg, Q
from ..base_service import BaseReviewService


class KPIAggregator(BaseReviewService):
    """
    Aggregates KPI scores for an employee over a review period.
    Fetches data from the KPI app.
    """
    
    @staticmethod
    def get_kpi_score_for_period(employee, start_date, end_date):
        """
        Calculate average KPI score for an employee over a date range.
        
        Args:
            employee: User object
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            float: Average KPI score (0-100) or None if no data
        """
        try:
            from django.db.models import Avg
            from apps.kpi.models.calculation import Score
            
            tenant_id = getattr(employee, 'tenant_id', None)
            
            # Build month range
            months = []
            current = start_date.replace(day=1)
            while current <= end_date:
                months.append((current.year, current.month))
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1)
                else:
                    current = current.replace(month=current.month + 1)
            
            # Query scores
            qs = Score.objects.filter(
                user_id=employee.id,
                tenant_id=tenant_id if tenant_id else None,
            )
            
            # Filter by months
            month_q = Q()
            for year, month in months:
                month_q |= Q(year=year, month=month)
            
            qs = qs.filter(month_q)
            
            agg = qs.aggregate(avg=Avg('score'))
            val = agg.get('avg')
            return float(val) if val is not None else None
        except Exception as e:
            logger.error(f"Error getting KPI score for employee {employee.id}: {e}")
            return None
    
    @staticmethod
    def get_kpi_scores_for_employees(employees, start_date, end_date):
        """
        Get KPI scores for multiple employees using the ScoreAggregator.
        
        Args:
            employees: QuerySet or list of User objects
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            dict: {employee_id: score}
        """
        try:
            from apps.kpi.services import ScoreAggregator
            
            aggregator = ScoreAggregator()
            result = {}
            
            for employee in employees:
                # Get the user's aggregated score for the period
                # Use the last month of the period as reference
                score = aggregator.aggregate_user(
                    user_id=str(employee.id),
                    year=end_date.year,
                    month=end_date.month,
                    force=False
                )
                result[employee.id] = float(score) if score is not None else None
            
            return result
        except ImportError as e:
            logger.warning(f"KPI app not available: {e}")
            return {emp.id: None for emp in employees}
        except Exception as e:
            logger.error(f"Error getting KPI scores for employees: {e}")
            return {emp.id: None for emp in employees}
    
    @staticmethod
    def get_team_kpi_scores(team_id, start_date, end_date):
        """
        Get aggregated KPI scores for an entire team.
        
        Args:
            team_id: Team ID
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            dict: {
                'team_average': float,
                'member_scores': {user_id: score},
                'member_count': int
            }
        """
        try:
            from apps.kpi.services import ScoreAggregator
            from apps.structure.models import Team
            
            aggregator = ScoreAggregator()
            team = Team.objects.get(id=team_id)
            
            # Get team aggregate score
            team_score = aggregator.aggregate_team(
                team_id=str(team_id),
                year=end_date.year,
                month=end_date.month,
                force=False
            )
            
            # Get individual member scores
            member_scores = {}
            for member in team.members.all():
                score = aggregator.aggregate_user(
                    user_id=str(member.id),
                    year=end_date.year,
                    month=end_date.month,
                    force=False
                )
                member_scores[member.id] = float(score) if score else None
            
            return {
                'team_average': float(team_score) if team_score else None,
                'member_scores': member_scores,
                'member_count': len(member_scores),
                'team_name': team.name
            }
        except Exception as e:
            logger.error(f"Error getting team KPI scores for team {team_id}: {e}")
            return {
                'team_average': None,
                'member_scores': {},
                'member_count': 0,
                'team_name': None
            }
    
    @staticmethod
    def get_department_kpi_scores(department_id, start_date, end_date):
        """
        Get aggregated KPI scores for an entire department.
        
        Args:
            department_id: Department ID
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            dict: {
                'department_average': float,
                'member_scores': {user_id: score},
                'member_count': int
            }
        """
        try:
            from apps.kpi.services import ScoreAggregator
            from apps.structure.models import Department
            
            aggregator = ScoreAggregator()
            department = Department.objects.get(id=department_id)
            
            # Get department aggregate score
            dept_score = aggregator.aggregate_department(
                department_id=str(department_id),
                year=end_date.year,
                month=end_date.month,
                force=False
            )
            
            # Get individual member scores
            member_scores = {}
            for member in department.members.all():
                score = aggregator.aggregate_user(
                    user_id=str(member.id),
                    year=end_date.year,
                    month=end_date.month,
                    force=False
                )
                member_scores[member.id] = float(score) if score else None
            
            return {
                'department_average': float(dept_score) if dept_score else None,
                'member_scores': member_scores,
                'member_count': len(member_scores),
                'department_name': department.name
            }
        except Exception as e:
            logger.error(f"Error getting department KPI scores for {department_id}: {e}")
            return {
                'department_average': None,
                'member_scores': {},
                'member_count': 0,
                'department_name': None
            }
    
    @staticmethod
    def get_organization_kpi_scores(tenant_id, start_date, end_date):
        """
        Get aggregated KPI scores for entire organization.
        
        Args:
            tenant_id: Tenant ID
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            dict: {
                'org_average': float,
                'total_employees': int,
                'active_employees': int
            }
        """
        try:
            from apps.kpi.services import ScoreAggregator
            
            aggregator = ScoreAggregator()
            
            # Get organization aggregate score
            org_score = aggregator.aggregate_organization(
                tenant_id=tenant_id,
                year=end_date.year,
                month=end_date.month,
                force=False
            )
            
            # Get hierarchy dashboard for more details
            dashboard = aggregator.get_org_hierarchy(
                tenant_id=tenant_id,
                year=end_date.year,
                month=end_date.month
            )
            
            return {
                'org_average': float(org_score) if org_score else None,
                'total_employees': dashboard.get('total_employees', 0),
                'active_employees': dashboard.get('active_employees', 0),
                'department_breakdown': dashboard.get('departments', {})
            }
        except Exception as e:
            logger.error(f"Error getting org KPI scores for tenant {tenant_id}: {e}")
            return {
                'org_average': None,
                'total_employees': 0,
                'active_employees': 0,
                'department_breakdown': {}
            }
    
    @staticmethod
    def get_kpi_achievement_rate(employee, start_date, end_date):
        """
        Get percentage of KPIs achieved/targets met.
        
        Args:
            employee: User object
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            dict: {
                'achieved_count': int,
                'total_count': int,
                'percentage': float
            }
        """
        try:
            from apps.kpi.models import KPI, Score
            from django.db.models import Count, Q
            
            # Get all KPIs for the period
            kpis = KPI.objects.filter(
                tenant_id=employee.tenant_id,
                is_active=True
            )
            
            total_count = kpis.count()
            
            # Count achieved KPIs (score >= target or >= 80 depending on config)
            achieved_count = Score.objects.filter(
                user_id=employee.id,
                tenant_id=employee.tenant_id,
                year=end_date.year,
                month=end_date.month,
                score__gte=80  # Assuming 80% is achievement threshold
            ).values('kpi_id').distinct().count()
            
            percentage = (achieved_count / total_count * 100) if total_count > 0 else 0
            
            return {
                'achieved_count': achieved_count,
                'total_count': total_count,
                'percentage': round(percentage, 2)
            }
        except Exception as e:
            logger.error(f"Error getting KPI achievement rate: {e}")
            return {'achieved_count': 0, 'total_count': 0, 'percentage': 0}
    
    @staticmethod
    def get_kpi_trend(employee, months=6):
        """
        Get KPI score trend over last N months.
        
        Args:
            employee: User object
            months: Number of months to look back
        
        Returns:
            list: Monthly score data
        """
        try:
            from apps.kpi.models.calculation import Score
            from django.db.models import Avg
            
            now = timezone.now()
            trend_data = []
            
            for i in range(months):
                month = now.month - i
                year = now.year
                if month <= 0:
                    month += 12
                    year -= 1
                
                score = Score.objects.filter(
                    user_id=employee.id,
                    tenant_id=employee.tenant_id,
                    year=year,
                    month=month
                ).aggregate(avg=Avg('score'))['avg']
                
                trend_data.append({
                    'year': year,
                    'month': month,
                    'score': float(score) if score else None,
                    'month_name': timezone.datetime(year, month, 1).strftime('%B')
                })
            
            return trend_data
        except Exception as e:
            logger.error(f"Error getting KPI trend: {e}")
            return []
    
    @staticmethod
    def get_user_hierarchy_dashboard(employee, year, month):
        """
        Get complete hierarchy dashboard for a user.
        
        Args:
            employee: User object
            year: Year
            month: Month
        
        Returns:
            dict: Hierarchy dashboard data
        """
        try:
            from apps.kpi.services import ScoreAggregator
            aggregator = ScoreAggregator()
            dashboard = aggregator.get_hierarchy_dashboard(
                user_id=str(employee.id),
                year=year,
                month=month
            )
            
            return dashboard
        except Exception as e:
            logger.error(f"Error getting hierarchy dashboard: {e}")
            return {}

    @staticmethod
    def calculate_period_scores(tenant_id, year, month, force=False, user_ids=None):
        """
        Calculate scores for a period using ScoreCalculator.
        
        Args:
            tenant_id: Tenant ID
            year: Year
            month: Month
            force: Force recalculation
            user_ids: List of specific user IDs to calculate
        
        Returns:
            dict: Calculation results
        """
        try:
            from apps.kpi.services import ScoreCalculator
            
            calculator = ScoreCalculator()
            result = calculator.calculate_period(
                tenant_id=tenant_id,
                year=year,
                month=month,
                force=force,
                user_ids=user_ids
            )
            
            return result
        except Exception as e:
            logger.error(f"Error calculating period scores: {e}")
            return {'status': 'FAILED', 'error': str(e)}


# Add logger
import logging
logger = logging.getLogger(__name__)