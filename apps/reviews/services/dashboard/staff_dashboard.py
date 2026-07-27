from django.db.models import Count, Q
from django.utils import timezone
from ...models import SelfAssessment, SupervisorReview, FinalRating, FeedbackRequest, PIP
from .base_dashboard import BaseDashboardService

class StaffDashboardService(BaseDashboardService):
    @classmethod
    def get_dashboard(cls, employee, review_cycle=None):
        cache_key = cls._cache_key(employee.tenant_id, employee.id, 'staff')
        cached = cls._get_cached(employee.tenant_id, employee.id, 'staff')
        if cached:
            return cached
        if review_cycle is None:
            from ..cycle.cycle_service import CycleService
            review_cycle = CycleService.get_active_cycle_for_employee(employee)
        data = {
            'employee': {'id': str(employee.id), 'name': employee.get_full_name(), 'email': employee.email},
            'self_assessment': cls._get_self_assessment_status(employee, review_cycle),
            'supervisor_review': cls._get_supervisor_review_status(employee, review_cycle),
            'final_rating': cls._get_final_rating(employee, review_cycle),
            'pending_feedback_requests': cls._get_pending_feedback_requests(employee),
            'feedback_tasks_to_write': cls._get_feedback_tasks_to_write(employee),
            'active_pip': cls._get_active_pip(employee),
            'upcoming_deadlines': cls._get_upcoming_deadlines(employee, review_cycle),
        }
        cls._set_cached(employee.tenant_id, employee.id, 'staff', data)
        return data
    @classmethod
    def _get_self_assessment_status(cls, employee, review_cycle):
        if not review_cycle:
            return {'status': 'no_active_cycle', 'submitted': False, 'deadline': None}
        assessment = SelfAssessment.objects.filter(employee=employee, review_cycle=review_cycle).first()
        if not assessment:
            return {'status': 'not_started', 'submitted': False, 'deadline': review_cycle.self_assessment_deadline.isoformat()}
        return {'status': assessment.status, 'submitted': assessment.status == 'submitted', 'submitted_at': assessment.submitted_at.isoformat() if assessment.submitted_at else None, 'deadline': review_cycle.self_assessment_deadline.isoformat(), 'is_overdue': timezone.now().date() > review_cycle.self_assessment_deadline and assessment.status != 'submitted'}
    @classmethod
    def _get_supervisor_review_status(cls, employee, review_cycle):
        if not review_cycle:
            return {'status': 'no_active_cycle'}
        review = SupervisorReview.objects.filter(employee=employee, review_cycle=review_cycle).first()
        if not review:
            return {'status': 'pending', 'submitted': False}
        return {'status': review.status, 'submitted': review.status in ['submitted', 'approved'], 'submitted_at': review.submitted_at.isoformat() if review.submitted_at else None, 'supervisor': review.supervisor.get_full_name() if review.supervisor else None}
    @classmethod
    def _get_final_rating(cls, employee, review_cycle):
        if not review_cycle:
            return None
        rating = FinalRating.objects.filter(employee=employee, review_cycle=review_cycle).first()
        if not rating:
            return None
        return {'score': float(rating.final_score) if rating.final_score else None, 'label': rating.final_rating_label, 'color': rating.final_rating_color, 'status': rating.status}
    @classmethod
    def _get_pending_feedback_requests(cls, employee):
        requests = FeedbackRequest.objects.filter(subject=employee, status='draft', due_date__gte=timezone.now().date()).select_related('reviewer')
        return [{'id': str(r.id), 'reviewer': r.reviewer.get_full_name(), 'reviewer_type': r.get_reviewer_type_display(), 'due_date': r.due_date.isoformat()} for r in requests]
    @classmethod
    def _get_feedback_tasks_to_write(cls, employee):
        requests = FeedbackRequest.objects.filter(
            reviewer=employee,
            status='draft',
            due_date__gte=timezone.now().date()
        ).select_related('subject', 'review_cycle')
        return [
            {
                'id': str(r.id),
                'subject_id': str(r.subject.id),
                'subject_name': r.subject.get_full_name(),
                'reviewer_type': r.get_reviewer_type_display(),
                'due_date': r.due_date.isoformat(),
                'cycle_name': r.review_cycle.name
            }
            for r in requests
        ]
    @classmethod
    def _get_active_pip(cls, employee):
        pip = PIP.objects.filter(employee=employee, status__in=['draft', 'submitted']).first()
        if not pip:
            return None
        total_actions = pip.actions.count()
        completed_actions = pip.actions.filter(status='completed').count()
        return {'id': str(pip.id), 'title': pip.title, 'start_date': pip.start_date.isoformat(), 'end_date': pip.end_date.isoformat(), 'progress': round((completed_actions / total_actions) * 100, 1) if total_actions > 0 else 0, 'days_remaining': (pip.end_date - timezone.now().date()).days}
    @classmethod
    def _get_upcoming_deadlines(cls, employee, review_cycle):
        deadlines = []
        if review_cycle:
            today = timezone.now().date()
            if review_cycle.self_assessment_deadline > today:
                deadlines.append({'type': 'self_assessment', 'date': review_cycle.self_assessment_deadline.isoformat(), 'days_left': (review_cycle.self_assessment_deadline - today).days})
            if review_cycle.supervisor_review_deadline > today:
                deadlines.append({'type': 'supervisor_review', 'date': review_cycle.supervisor_review_deadline.isoformat(), 'days_left': (review_cycle.supervisor_review_deadline - today).days})
        return sorted(deadlines, key=lambda x: x['days_left'])[:3]