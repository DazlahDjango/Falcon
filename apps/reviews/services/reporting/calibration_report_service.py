from django.db.models import Avg, Count, Q
from django.utils import timezone

from ...models import CalibrationSession, CalibrationRating, FinalRating
from ..base_service import BaseReviewService
from ..calibration.outlier_detector import OutlierDetector


class CalibrationReportService(BaseReviewService):
    """
    Generates reports and analytics for calibration sessions
    """
    
    @staticmethod
    def get_session_report(session_id):
        """
        Get detailed report for a calibration session.
        
        Args:
            session_id: ID of CalibrationSession instance
        
        Returns:
            dict: Detailed session report
        """
        session = CalibrationSession.objects.get(id=session_id)
        
        # Get all adjustments made in this session
        adjustments = session.rating_adjustments.all()
        
        # Calculate adjustment statistics
        adjustment_values = [float(adj.adjustment_amount) for adj in adjustments]
        
        return {
            'session': {
                'id': session.id,
                'name': session.name,
                'type': session.get_session_type_display(),
                'scheduled_date': session.scheduled_date.isoformat(),
                'actual_start_time': session.actual_start_time.isoformat() if session.actual_start_time else None,
                'actual_end_time': session.actual_end_time.isoformat() if session.actual_end_time else None,
                'status': session.get_status_display(),
                'outcome': session.get_outcome_display(),
                'facilitator': session.facilitator.email if session.facilitator else None,
            },
            'participants': [
                {
                    'id': p.id,
                    'name': p.get_full_name(),
                    'email': p.email,
                }
                for p in session.participants.all()
            ],
            'adjustments': {
                'total': adjustments.count(),
                'average_adjustment': round(sum(adjustment_values) / len(adjustment_values), 2) if adjustment_values else 0,
                'max_increase': max(adjustment_values) if adjustment_values else 0,
                'max_decrease': min(adjustment_values) if adjustment_values else 0,
                'list': [
                    {
                        'employee': adj.final_rating.employee.get_full_name(),
                        'before_score': float(adj.before_score),
                        'after_score': float(adj.after_score),
                        'adjustment': float(adj.adjustment_amount),
                        'reason': adj.adjustment_reason,
                        'adjusted_by': adj.adjusted_by.email if adj.adjusted_by else None,
                        'adjusted_at': adj.adjusted_at.isoformat(),
                    }
                    for adj in adjustments
                ]
            },
            'departments_included': [
                dept.name for dept in session.departments_included.all()
            ] if session.departments_included.exists() else ['All Departments'],
            'notes': session.notes,
            'decisions': session.decisions,
        }
    
    @staticmethod
    def get_cycle_calibration_summary(review_cycle):
        """
        Get calibration summary for a review cycle.
        
        Args:
            review_cycle: ReviewCycle instance
        
        Returns:
            dict: Calibration summary for the cycle
        """
        sessions = CalibrationSession.objects.filter(review_cycle=review_cycle)
        
        # Get all calibration adjustments for this cycle
        adjustments = CalibrationRating.objects.filter(
            calibration_session__review_cycle=review_cycle
        )
        
        # Get final ratings that were calibrated
        calibrated_ratings = FinalRating.objects.filter(
            review_cycle=review_cycle,
            calibration_adjustment__isnull=False
        )
        
        # Calculate calibration impact
        before_scores = [float(r.calibration_adjustments.first().before_score) for r in calibrated_ratings if r.calibration_adjustments.exists()]
        after_scores = [float(r.calibration_adjustments.first().after_score) for r in calibrated_ratings if r.calibration_adjustments.exists()]
        
        avg_before = sum(before_scores) / len(before_scores) if before_scores else 0
        avg_after = sum(after_scores) / len(after_scores) if after_scores else 0
        
        return {
            'review_cycle': {
                'id': review_cycle.id,
                'name': review_cycle.name,
            },
            'sessions': {
                'total': sessions.count(),
                'completed': sessions.filter(outcome='completed').count(),
                'cancelled': sessions.filter(outcome='cancelled').count(),
                'list': [
                    {
                        'id': s.id,
                        'name': s.name,
                        'date': s.scheduled_date.isoformat(),
                        'status': s.get_status_display(),
                        'adjustments_count': s.rating_adjustments.count(),
                    }
                    for s in sessions.order_by('-scheduled_date')
                ]
            },
            'calibration_impact': {
                'total_ratings_calibrated': calibrated_ratings.count(),
                'total_ratings_in_cycle': FinalRating.objects.filter(review_cycle=review_cycle).count(),
                'percentage_calibrated': round((calibrated_ratings.count() / FinalRating.objects.filter(review_cycle=review_cycle).count()) * 100, 1) if calibrated_ratings.count() > 0 else 0,
                'average_before_score': round(avg_before, 2),
                'average_after_score': round(avg_after, 2),
                'average_change': round(avg_after - avg_before, 2),
                'total_adjustments': adjustments.count(),
                'increases': adjustments.filter(adjustment_amount__gt=0).count(),
                'decreases': adjustments.filter(adjustment_amount__lt=0).count(),
                'no_change': adjustments.filter(adjustment_amount=0).count(),
            }
        }
    
    @staticmethod
    def get_outlier_report(review_cycle):
        """
        Get report of rating outliers that need calibration attention.
        
        Args:
            review_cycle: ReviewCycle instance
        
        Returns:
            dict: Outlier report
        """
        outliers = OutlierDetector.find_outliers(review_cycle)
        inconsistent_managers = OutlierDetector.find_inconsistent_managers(review_cycle)
        recommendations = OutlierDetector.get_calibration_recommendations(review_cycle)
        
        return {
            'review_cycle': {
                'id': review_cycle.id,
                'name': review_cycle.name,
            },
            'outliers': {
                'total': len(outliers),
                'list': outliers
            },
            'inconsistent_managers': {
                'total': len(inconsistent_managers),
                'list': inconsistent_managers
            },
            'recommendations': recommendations,
            'department_statistics': OutlierDetector.get_department_statistics(review_cycle),
            'manager_statistics': OutlierDetector.get_manager_statistics(review_cycle),
        }
    
    @staticmethod
    def generate_calibration_report_pdf(session_id):
        """
        Generate PDF report for a calibration session.
        
        Args:
            session_id: ID of CalibrationSession instance
        
        Returns:
            dict: Report data (PDF generation would go here)
        """
        report = CalibrationReportService.get_session_report(session_id)
        cycle_summary = CalibrationReportService.get_cycle_calibration_summary(report['session'].get('review_cycle_id'))
        
        return {
            'session_report': report,
            'cycle_summary': cycle_summary,
            'generated_at': timezone.now().isoformat(),
        }