# apps/reviews/services/reporting/report_service.py
"""
Report Service - Generates various reports from review data
"""

from django.utils import timezone
from django.db.models import Avg, Count, Q
from typing import Dict, Any

from ...models import FinalRating, ReviewCycle, PIP, CalibrationSession
from ...constants import ReportType, ReportFormat
from ..base_service import BaseReviewService
from .export_service import ExportService
from ..analytics.analytics_service import AnalyticsService


class ReportService(BaseReviewService):
    """
    Generates comprehensive reports from review data.
    """
    
    @staticmethod
    def generate_employee_report(employee_id, cycle_id=None, format=ReportFormat.PDF):
        """
        Generate report for a single employee.
        
        Args:
            employee_id: Employee user ID
            cycle_id: Optional review cycle ID
            format: Export format
        
        Returns:
            HttpResponse: Report file
        """
        from apps.accounts.models import User
        
        employee = User.objects.get(id=employee_id)
        
        # Get ratings
        ratings = FinalRating.objects.filter(employee=employee)
        if cycle_id:
            ratings = ratings.filter(review_cycle_id=cycle_id)
        
        # Get PIPs
        pips = PIP.objects.filter(employee=employee)
        
        # Get promotion recommendations
        promotions = employee.promotion_recommendations.all()
        
        # Build report data
        report_data = {
            'employee': employee,
            'ratings': ratings,
            'pips': pips,
            'promotions': promotions,
            'generated_at': timezone.now()
        }
        
        if format == ReportFormat.PDF:
            return ExportService.export_to_pdf(
                'reports/employee_report.html',
                report_data,
                f'employee_report_{employee.id}.pdf'
            )
        elif format == ReportFormat.EXCEL:
            data = list(ratings.values(
                'review_cycle__name', 'final_score', 'final_rating_label',
                'promotion_recommended', 'pip_recommended'
            ))
            return ExportService.export_to_excel(data, f'Employee_{employee.id}')
        elif format == ReportFormat.CSV:
            data = list(ratings.values(
                'review_cycle__name', 'final_score', 'final_rating_label'
            ))
            return ExportService.export_to_csv(data, f'employee_{employee.id}.csv')
        else:
            return ExportService.export_to_json(report_data, f'employee_{employee.id}.json')
    
    @staticmethod
    def generate_team_report(manager_id, cycle_id=None, format=ReportFormat.PDF):
        """
        Generate report for a manager's team.
        
        Args:
            manager_id: Manager user ID
            cycle_id: Optional review cycle ID
            format: Export format
        
        Returns:
            HttpResponse: Report file
        """
        from apps.accounts.models import User
        
        manager = User.objects.get(id=manager_id)
        team = manager.direct_reports.all()
        
        # Get team ratings
        ratings = FinalRating.objects.filter(employee__in=team)
        if cycle_id:
            ratings = ratings.filter(review_cycle_id=cycle_id)
        
        # Calculate team stats
        team_stats = {
            'total_employees': team.count(),
            'average_score': ratings.aggregate(avg=Avg('final_score'))['avg'] or 0,
            'promotions': ratings.filter(promotion_recommended=True).count(),
            'pips': ratings.filter(pip_recommended=True).count(),
        }
        
        report_data = {
            'manager': manager,
            'team': team,
            'ratings': ratings,
            'team_stats': team_stats,
            'generated_at': timezone.now()
        }
        
        if format == ReportFormat.PDF:
            return ExportService.export_to_pdf(
                'reports/team_report.html',
                report_data,
                f'team_report_{manager_id}.pdf'
            )
        elif format == ReportFormat.EXCEL:
            data = list(ratings.values(
                'employee__email', 'final_score', 'final_rating_label',
                'promotion_recommended', 'pip_recommended'
            ))
            return ExportService.export_to_excel(data, f'Team_{manager_id}')
        elif format == ReportFormat.CSV:
            data = list(ratings.values(
                'employee__email', 'final_score', 'final_rating_label'
            ))
            return ExportService.export_to_csv(data, f'team_{manager_id}.csv')
        else:
            return ExportService.export_to_json(report_data, f'team_{manager_id}.json')
    
    @staticmethod
    def generate_cycle_report(cycle_id, format=ReportFormat.PDF):
        """
        Generate report for a review cycle.
        
        Args:
            cycle_id: Review cycle ID
            format: Export format
        
        Returns:
            HttpResponse: Report file
        """
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        # Get cycle ratings
        ratings = FinalRating.objects.filter(review_cycle=cycle, final_score__isnull=False)
        
        # Calculate cycle stats
        scores = [r.final_score for r in ratings if r.final_score]
        
        cycle_stats = {
            'total_employees': cycle.get_participating_employees().count(),
            'total_ratings': ratings.count(),
            'average_score': round(sum(scores) / len(scores), 2) if scores else 0,
            'min_score': min(scores) if scores else 0,
            'max_score': max(scores) if scores else 0,
            'promotions': ratings.filter(promotion_recommended=True).count(),
            'pips': ratings.filter(pip_recommended=True).count(),
        }
        
        report_data = {
            'cycle': cycle,
            'ratings': ratings,
            'cycle_stats': cycle_stats,
            'generated_at': timezone.now()
        }
        
        if format == ReportFormat.PDF:
            return ExportService.export_to_pdf(
                'reports/cycle_report.html',
                report_data,
                f'cycle_report_{cycle_id}.pdf'
            )
        elif format == ReportFormat.EXCEL:
            data = list(ratings.values(
                'employee__email', 'employee__department__name',
                'final_score', 'final_rating_label', 'promotion_recommended'
            ))
            return ExportService.export_to_excel(data, f'Cycle_{cycle.name}')
        elif format == ReportFormat.CSV:
            data = list(ratings.values(
                'employee__email', 'final_score', 'final_rating_label'
            ))
            return ExportService.export_to_csv(data, f'cycle_{cycle_id}.csv')
        else:
            return ExportService.export_to_json(report_data, f'cycle_{cycle_id}.json')
    
    @staticmethod
    def generate_pip_report(format=ReportFormat.PDF):
        """
        Generate organization-wide PIP report.
        
        Args:
            format: Export format
        
        Returns:
            HttpResponse: Report file
        """
        from apps.reviews.services.reporting.pip_report_service import PIPReportService
        from apps.accounts.models import User
        
        # Get tenant from request context (passed via service)
        tenant = None  # This would be set from request
        
        report = PIPReportService.get_organization_pip_summary(tenant) if tenant else {}
        
        report_data = {
            'report': report,
            'generated_at': timezone.now()
        }
        
        if format == ReportFormat.PDF:
            return ExportService.export_to_pdf(
                'reports/pip_report.html',
                report_data,
                'pip_report.pdf'
            )
        elif format == ReportFormat.EXCEL:
            return ExportService.export_to_excel(report.get('active_pip_details', []), 'PIP_Report')
        else:
            return ExportService.export_to_json(report_data, 'pip_report.json')