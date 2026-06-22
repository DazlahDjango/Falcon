from django.db.models import Count, Avg, Q
from django.utils import timezone
from ...models import SelfAssessment, SupervisorReview, FinalRating, ReviewCycle
from .base_dashboard import BaseDashboardService

class SupervisorDashboardService(BaseDashboardService):
    @classmethod
    def get_dashboard(cls, supervisor, review_cycle=None):
        cache_key = cls._cache_key(supervisor.tenant_id, supervisor.id, 'supervisor')
        cached = cls._get_cached(supervisor.tenant_id, supervisor.id, 'supervisor')
        if cached:
            return cached
        if review_cycle is None:
            from ..cycle.cycle_service import CycleService
            review_cycle = CycleService.get_active_cycle_for_employee(supervisor)
        direct_reports = supervisor.direct_reports.filter(is_active=True)
        data = {
            'supervisor': {'id': str(supervisor.id), 'name': supervisor.get_full_name(), 'email': supervisor.email},
            'team_summary': cls._get_team_summary(supervisor, direct_reports, review_cycle),
            'pending_reviews': cls._get_pending_reviews(supervisor, direct_reports, review_cycle),
            'completed_reviews': cls._get_completed_reviews(supervisor, direct_reports, review_cycle),
            'self_assessment_progress': cls._get_self_assessment_progress(direct_reports, review_cycle),
            'ratings_distribution': cls._get_ratings_distribution(direct_reports, review_cycle),
            'alerts': cls._get_alerts(supervisor, direct_reports, review_cycle),
        }
        cls._set_cached(supervisor.tenant_id, supervisor.id, 'supervisor', data)
        return data
    @classmethod
    def _get_team_summary(cls, supervisor, direct_reports, review_cycle):
        total = direct_reports.count()
        if total == 0:
            return {'total_employees': 0, 'self_assessment_completed': 0, 'review_completed': 0, 'avg_final_score': None}
        self_assessment_completed = SelfAssessment.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status='submitted').count() if review_cycle else 0
        review_completed = SupervisorReview.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status='approved').count() if review_cycle else 0
        avg_score = FinalRating.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, final_score__isnull=False).aggregate(avg=Avg('final_score'))['avg']
        return {'total_employees': total, 'self_assessment_completed': self_assessment_completed, 'self_assessment_percentage': round((self_assessment_completed / total) * 100, 1) if total > 0 else 0, 'review_completed': review_completed, 'review_percentage': round((review_completed / total) * 100, 1) if total > 0 else 0, 'avg_final_score': round(float(avg_score), 1) if avg_score else None}
    @classmethod
    def _get_pending_reviews(cls, supervisor, direct_reports, review_cycle):
        if not review_cycle:
            return []
        pending = SupervisorReview.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status__in=['draft', 'submitted']).select_related('employee')
        return [{'employee_id': str(r.employee.id), 'employee_name': r.employee.get_full_name(), 'status': r.status, 'self_assessment_submitted': r.self_assessment is not None and r.self_assessment.status == 'submitted', 'deadline': review_cycle.supervisor_review_deadline.isoformat()} for r in pending]
    @classmethod
    def _get_completed_reviews(cls, supervisor, direct_reports, review_cycle):
        if not review_cycle:
            return []
        completed = SupervisorReview.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status='approved').select_related('employee')
        return [{'employee_id': str(r.employee.id), 'employee_name': r.employee.get_full_name(), 'submitted_at': r.submitted_at.isoformat() if r.submitted_at else None} for r in completed]
    @classmethod
    def _get_self_assessment_progress(cls, direct_reports, review_cycle):
        if not review_cycle:
            return {'submitted': 0, 'pending': 0, 'percentage': 0}
        total = direct_reports.count()
        submitted = SelfAssessment.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status='submitted').count()
        return {'submitted': submitted, 'pending': total - submitted, 'percentage': round((submitted / total) * 100, 1) if total > 0 else 0}
    @classmethod
    def _get_ratings_distribution(cls, direct_reports, review_cycle):
        if not review_cycle:
            return {}
        ratings = FinalRating.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, final_rating_label__isnull=False).values('final_rating_label').annotate(count=Count('id'))
        return {r['final_rating_label']: r['count'] for r in ratings}
    @classmethod
    def _get_alerts(cls, supervisor, direct_reports, review_cycle):
        alerts = []
        if review_cycle and timezone.now().date() > review_cycle.supervisor_review_deadline:
            overdue_count = SupervisorReview.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status__in=['draft', 'submitted']).count()
            if overdue_count > 0:
                alerts.append({'type': 'overdue_reviews', 'message': f"{overdue_count} reviews are overdue", 'severity': 'high'})
        pending_count = SupervisorReview.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, status='draft', self_assessment__status='submitted').count() if review_cycle else 0
        if pending_count > 0:
            alerts.append({'type': 'pending_reviews', 'message': f"{pending_count} self-assessments ready for your review", 'severity': 'medium'})
        low_performers = FinalRating.objects.filter(employee__in=direct_reports, review_cycle=review_cycle, final_score__lt=60).count() if review_cycle else 0
        if low_performers > 0:
            alerts.append({'type': 'low_performers', 'message': f"{low_performers} team members have scores below 60%", 'severity': 'high'})
        return alerts