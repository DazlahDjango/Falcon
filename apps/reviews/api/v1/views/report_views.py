# apps/reviews/api/v1/views/report_views.py
"""
Views for generating reports
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models

from apps.reviews.models import ReviewCycle, FinalRating, PIP
from apps.reviews.services.reporting.review_summary_service import ReviewSummaryService
from apps.reviews.services.reporting.pip_report_service import PIPReportService
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService
from ..serializers import (
    DateRangeSerializer,
    RatingDistributionSerializer,
)
from .base_views import BaseActionViewSet
from ..permissions import CanViewReview, CanViewPIP, CanViewCalibrationSession


class ReportViewSet(BaseActionViewSet):
    """
    ViewSet for generating various reports.
    
    Actions:
    - POST /reports/employee-summary/ - Get employee review summary
    - POST /reports/team-summary/ - Get team review summary
    - POST /reports/cycle-summary/ - Get cycle summary report
    - POST /reports/pip-summary/ - Get PIP summary report
    - POST /reports/calibration-summary/ - Get calibration summary
    - POST /reports/rating-distribution/ - Get rating distribution
    - POST /reports/export/ - Export report to file
    """
    
    permission_classes = [CanViewReview]
    
    def get_queryset(self):
        return None  # This viewset doesn't use queryset
    
    @action(detail=False, methods=['post'], url_path='employee-summary')
    def employee_summary(self, request):
        """
        Generate review summary for an employee.
        """
        employee_id = request.data.get('employee_id')
        cycle_id = request.data.get('cycle_id')
        
        if not employee_id or not cycle_id:
            return Response(
                {'error': 'employee_id and cycle_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        
        try:
            employee = User.objects.get(id=employee_id)
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except User.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Review cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission
        if request.user.role not in ['admin', 'hr'] and request.user != employee.manager:
            return Response(
                {'error': 'You do not have permission to view this summary'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        summary = ReviewSummaryService.get_employee_summary(employee, cycle)
        return Response(summary)
    
    @action(detail=False, methods=['post'], url_path='team-summary')
    def team_summary(self, request):
        """
        Generate review summary for a manager's team.
        """
        manager_id = request.data.get('manager_id')
        cycle_id = request.data.get('cycle_id')
        
        if not manager_id or not cycle_id:
            return Response(
                {'error': 'manager_id and cycle_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        
        try:
            manager = User.objects.get(id=manager_id)
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except User.DoesNotExist:
            return Response({'error': 'Manager not found'}, status=status.HTTP_404_NOT_FOUND)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Review cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission
        if request.user.role not in ['admin', 'hr'] and request.user != manager:
            return Response(
                {'error': 'You do not have permission to view this team summary'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        summary = ReviewSummaryService.get_team_summary(manager, cycle)
        return Response(summary)
    
    @action(detail=False, methods=['post'], url_path='cycle-summary')
    def cycle_summary(self, request):
        """
        Generate summary report for a review cycle.
        """
        cycle_id = request.data.get('cycle_id')
        
        if not cycle_id:
            return Response(
                {'error': 'cycle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Review cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission
        if request.user.role not in ['admin', 'hr', 'manager', 'executive']:
            return Response(
                {'error': 'You do not have permission to view this report'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get cycle statistics
        ratings = FinalRating.objects.filter(review_cycle=cycle, final_score__isnull=False)
        
        scores = [float(r.final_score) for r in ratings if r.final_score]
        
        return Response({
            'cycle_id': str(cycle.id),
            'cycle_name': cycle.name,
            'cycle_type': cycle.get_cycle_type_display(),
            'period': f"{cycle.start_date} to {cycle.end_date}",
            'total_employees': cycle.get_participating_employees().count(),
            'total_ratings': ratings.count(),
            'average_score': round(sum(scores) / len(scores), 2) if scores else None,
            'min_score': min(scores) if scores else None,
            'max_score': max(scores) if scores else None,
            'promotions': ratings.filter(promotion_recommended=True).count(),
            'pips': ratings.filter(pip_recommended=True).count(),
        })
    
    @action(detail=False, methods=['post'], url_path='pip-summary')
    def pip_summary(self, request):
        """
        Generate PIP summary report.
        """
        tenant = request.user.tenant
        
        report = PIPReportService.get_organization_pip_summary(tenant)
        
        # Add permission check
        if request.user.role not in ['admin', 'hr', 'manager', 'executive']:
            return Response(
                {'error': 'You do not have permission to view this report'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response(report)
    
    @action(detail=False, methods=['post'], url_path='calibration-summary')
    def calibration_summary(self, request):
        """
        Generate calibration summary for a cycle.
        """
        cycle_id = request.data.get('cycle_id')
        
        if not cycle_id:
            return Response(
                {'error': 'cycle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Review cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission
        if request.user.role not in ['admin', 'hr']:
            return Response(
                {'error': 'You do not have permission to view this report'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        report = CalibrationReportService.get_cycle_calibration_summary(cycle)
        return Response(report)
    
    @action(detail=False, methods=['post'], url_path='rating-distribution')
    def rating_distribution(self, request):
        """
        Get rating distribution for a cycle.
        """
        cycle_id = request.data.get('cycle_id')
        
        if not cycle_id:
            return Response(
                {'error': 'cycle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Review cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        ratings = FinalRating.objects.filter(
            review_cycle=cycle,
            final_rating_label__isnull=False
        )
        
        # Calculate distribution
        distribution = {}
        total = ratings.count()
        
        for rating in ratings:
            label = rating.final_rating_label
            if label not in distribution:
                distribution[label] = {
                    'count': 0,
                    'percentage': 0,
                    'color': rating.final_rating_color
                }
            distribution[label]['count'] += 1
        
        for label in distribution:
            distribution[label]['percentage'] = round(
                (distribution[label]['count'] / total) * 100, 1
            ) if total > 0 else 0
        
        # Convert to list format
        distribution_list = [
            {
                'rating_label': label,
                'count': data['count'],
                'percentage': data['percentage'],
                'color': data['color']
            }
            for label, data in distribution.items()
        ]
        
        serializer = RatingDistributionSerializer(distribution_list, many=True)
        
        return Response({
            'cycle_id': str(cycle.id),
            'cycle_name': cycle.name,
            'total_ratings': total,
            'distribution': serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='export')
    def export(self, request):
        """
        Export report to CSV/Excel/PDF.
        """
        report_type = request.data.get('report_type')
        format_type = request.data.get('format', 'csv')
        cycle_id = request.data.get('cycle_id')
        
        if not report_type or not cycle_id:
            return Response(
                {'error': 'report_type and cycle_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Review cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Build export data based on report type
        if report_type == 'ratings':
            ratings = FinalRating.objects.filter(review_cycle=cycle)
            export_data = []
            for rating in ratings:
                export_data.append({
                    'Employee': rating.employee.get_full_name(),
                    'Email': rating.employee.email,
                    'Final Score': float(rating.final_score) if rating.final_score else None,
                    'Rating': rating.final_rating_label,
                    'Promotion': 'Yes' if rating.promotion_recommended else 'No',
                    'PIP': 'Yes' if rating.pip_recommended else 'No',
                })
        elif report_type == 'pips':
            pips = PIP.objects.filter(review_cycle=cycle)
            export_data = []
            for pip in pips:
                export_data.append({
                    'Employee': pip.employee.get_full_name(),
                    'Title': pip.title,
                    'Severity': pip.get_severity_display(),
                    'Status': pip.get_status_display(),
                    'Start Date': pip.start_date,
                    'End Date': pip.end_date,
                    'Outcome': pip.get_outcome_display() if pip.outcome else 'In Progress',
                })
        else:
            return Response(
                {'error': f'Unknown report_type: {report_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'cycle_name': cycle.name,
            'report_type': report_type,
            'format': format_type,
            'total_records': len(export_data),
            'data': export_data,
            'message': f'Export prepared for {format_type} format'
        })
