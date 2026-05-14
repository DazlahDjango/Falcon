# apps/reviews/services/aggregation/kpi_aggregator.py
"""
Pull KPI scores from KPI app for review periods
"""

from django.utils import timezone
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
            from apps.kpi.services.kpi_aggregator import KPIAggregator as KPIAppAggregator
            return KPIAppAggregator.get_score_for_period(employee, start_date, end_date)
        except ImportError:
            # KPI app not available yet
            return None
    
    @staticmethod
    def get_kpi_scores_for_employees(employees, start_date, end_date):
        """
        Get KPI scores for multiple employees.
        
        Args:
            employees: QuerySet or list of User objects
            start_date: Start of review period
            end_date: End of review period
        
        Returns:
            dict: {employee_id: score}
        """
        try:
            from apps.kpi.services.kpi_aggregator import KPIAggregator as KPIAppAggregator
            return KPIAppAggregator.get_scores_for_employees(employees, start_date, end_date)
        except ImportError:
            return {emp.id: None for emp in employees}
    
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
            from apps.kpi.services.kpi_aggregator import KPIAggregator as KPIAppAggregator
            return KPIAppAggregator.get_achievement_rate(employee, start_date, end_date)
        except ImportError:
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
            from apps.kpi.services.kpi_aggregator import KPIAggregator as KPIAppAggregator
            return KPIAppAggregator.get_trend(employee, months)
        except ImportError:
            return []