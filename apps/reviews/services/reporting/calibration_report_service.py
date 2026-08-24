from django.utils import timezone
from django.db.models import Avg, Count
from ...models import CalibrationSession, CalibrationRating, FinalRating
from ..base_service import BaseReviewService
from ..calibration.outlier_detector import OutlierDetector

class CalibrationReportService(BaseReviewService):
    @staticmethod
    def get_session_report(session_id):
        session = CalibrationSession.objects.get(id=session_id)
        adjustments = session.rating_adjustments.all()
        adjustment_values = [float(adj.after_score - adj.before_score) for adj in adjustments]
        return {'session': {'id': str(session.id), 'name': session.name, 'type': session.get_session_type_display(), 'scheduled_date': session.scheduled_date.isoformat(), 'actual_start_time': session.actual_start_time.isoformat() if session.actual_start_time else None, 'actual_end_time': session.actual_end_time.isoformat() if session.actual_end_time else None, 'status': session.get_status_display(), 'outcome': session.get_outcome_display(), 'facilitator': session.facilitator.email if session.facilitator else None}, 'participants': [{'id': str(p.id), 'name': p.get_full_name(), 'email': p.email} for p in session.participants.all()], 'adjustments': {'total': adjustments.count(), 'average_adjustment': round(sum(adjustment_values) / len(adjustment_values), 2) if adjustment_values else 0, 'max_increase': max(adjustment_values) if adjustment_values else 0, 'max_decrease': min(adjustment_values) if adjustment_values else 0, 'list': [{'employee': adj.final_rating.employee.get_full_name(), 'before_score': float(adj.before_score), 'after_score': float(adj.after_score), 'adjustment': float(adj.after_score - adj.before_score), 'reason': adj.adjustment_reason, 'adjusted_by': adj.adjusted_by.email if adj.adjusted_by else None, 'adjusted_at': adj.adjusted_at.isoformat()} for adj in adjustments]}, 'departments_included': [dept.name for dept in session.departments_included.all()] if session.departments_included.exists() else ['All Departments'], 'notes': session.notes, 'decisions': session.decisions}
    @staticmethod
    def get_cycle_calibration_summary(review_cycle):
        sessions = CalibrationSession.objects.filter(review_cycle=review_cycle)
        adjustments = CalibrationRating.objects.filter(calibration_session__review_cycle=review_cycle)
        calibrated_ratings = FinalRating.objects.filter(review_cycle=review_cycle, calibration_adjustment__isnull=False)
        before_scores = []
        after_scores = []
        for r in calibrated_ratings:
            first_adjustment = r.calibration_adjustments.first()
            if first_adjustment:
                before_scores.append(float(first_adjustment.before_score))
                after_scores.append(float(first_adjustment.after_score))
        avg_before = sum(before_scores) / len(before_scores) if before_scores else 0
        inc_count = sum(1 for adj in adjustments if adj.after_score > adj.before_score)
        dec_count = sum(1 for adj in adjustments if adj.after_score < adj.before_score)
        no_change_count = sum(1 for adj in adjustments if adj.after_score == adj.before_score)
        total_ratings_in_cycle = FinalRating.objects.filter(review_cycle=review_cycle).count()
        return {'review_cycle': {'id': str(review_cycle.id), 'name': review_cycle.name}, 'sessions': {'total': sessions.count(), 'completed': sessions.filter(outcome='completed').count(), 'cancelled': sessions.filter(outcome='cancelled').count(), 'list': [{'id': str(s.id), 'name': s.name, 'date': s.scheduled_date.isoformat(), 'status': s.get_status_display(), 'adjustments_count': s.rating_adjustments.count()} for s in sessions.order_by('-scheduled_date')]}, 'calibration_impact': {'total_ratings_calibrated': calibrated_ratings.count(), 'total_ratings_in_cycle': total_ratings_in_cycle, 'percentage_calibrated': round((calibrated_ratings.count() / total_ratings_in_cycle) * 100, 1) if total_ratings_in_cycle > 0 else 0, 'average_before_score': round(avg_before, 2), 'average_after_score': round(avg_after, 2), 'average_change': round(avg_after - avg_before, 2), 'total_adjustments': adjustments.count(), 'increases': inc_count, 'decreases': dec_count, 'no_change': no_change_count}}
    @staticmethod
    def get_outlier_report(review_cycle):
        outliers = OutlierDetector.find_outliers(review_cycle)
        inconsistent_managers = OutlierDetector.find_inconsistent_managers(review_cycle)
        recommendations = OutlierDetector.get_calibration_recommendations(review_cycle)
        return {'review_cycle': {'id': str(review_cycle.id), 'name': review_cycle.name}, 'outliers': {'total': len(outliers), 'list': outliers}, 'inconsistent_managers': {'total': len(inconsistent_managers), 'list': inconsistent_managers}, 'recommendations': recommendations, 'department_statistics': OutlierDetector.get_department_statistics(review_cycle), 'manager_statistics': OutlierDetector.get_manager_statistics(review_cycle)}
    @staticmethod
    def generate_calibration_report_pdf(session_id):
        report = CalibrationReportService.get_session_report(session_id)
        session_obj = CalibrationSession.objects.get(id=session_id)
        cycle_summary = CalibrationReportService.get_cycle_calibration_summary(session_obj.review_cycle)
        return {'session_report': report, 'cycle_summary': cycle_summary, 'generated_at': timezone.now().isoformat()}