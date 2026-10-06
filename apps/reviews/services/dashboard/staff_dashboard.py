# apps/reviews/services/dashboard/staff_dashboard.py
from django.db.models import Count, Q
from django.utils import timezone
from ...models import SelfAssessment, SupervisorReview, FinalRating, FeedbackRequest, PIP
from .base_dashboard import BaseDashboardService


class StaffDashboardService(BaseDashboardService):
    @classmethod
    def get_dashboard(cls, employee, review_cycle=None):
        cycle_id = str(review_cycle.id) if review_cycle else None
        cached = cls._get_cached(employee.tenant_id, employee.id, 'staff', cycle_id=cycle_id)
        if cached:
            return cached

        if review_cycle is None:
            from ..cycle.cycle_service import CycleService
            review_cycle = CycleService.get_active_cycle_for_employee(employee)

        data = {
            'employee': cls._get_employee_info(employee),
            'review_cycle': cls._get_cycle_info(review_cycle),
            'self_assessment': cls._get_self_assessment_status(employee, review_cycle),
            'supervisor_review': cls._get_supervisor_review_status(employee, review_cycle),
            'final_rating': cls._get_final_rating(employee, review_cycle),
            'pending_feedback_requests': cls._get_pending_feedback_requests(employee),
            'feedback_tasks_to_write': cls._get_feedback_tasks_to_write(employee),
            'active_pip': cls._get_active_pip(employee),
            'upcoming_deadlines': cls._get_upcoming_deadlines(employee, review_cycle),
        }
        cls._set_cached(employee.tenant_id, employee.id, 'staff', data, cycle_id=cycle_id)
        return data

    @classmethod
    def _get_employee_info(cls, employee):
        department_name = None
        if hasattr(employee, 'department') and employee.department:
            department_name = employee.department.name

        position_name = None
        if hasattr(employee, 'position') and employee.position:
            position_name = employee.position.name

        return {
            'id': str(employee.id),
            'name': employee.get_full_name() or employee.email,
            'email': employee.email,
            'department': department_name,
            'position': position_name,
        }

    @classmethod
    def _get_cycle_info(cls, review_cycle):
        if not review_cycle:
            return None
        return {
            'id': str(review_cycle.id),
            'name': review_cycle.name,
            'cycle_type': review_cycle.cycle_type,
            'cycle_type_display': review_cycle.get_cycle_type_display() if hasattr(review_cycle, 'get_cycle_type_display') else review_cycle.cycle_type,
            'status': review_cycle.status,
            'start_date': review_cycle.start_date.isoformat() if review_cycle.start_date else None,
            'end_date': review_cycle.end_date.isoformat() if review_cycle.end_date else None,
            'self_assessment_deadline': review_cycle.self_assessment_deadline.isoformat() if review_cycle.self_assessment_deadline else None,
            'supervisor_review_deadline': review_cycle.supervisor_review_deadline.isoformat() if review_cycle.supervisor_review_deadline else None,
            'final_approval_deadline': review_cycle.final_approval_deadline.isoformat() if review_cycle.final_approval_deadline else None,
            'kpi_weight': float(review_cycle.kpi_weight) if review_cycle.kpi_weight is not None else 0.0,
            'competency_weight': float(review_cycle.competency_weight) if review_cycle.competency_weight is not None else 0.0,
            'require_self_assessment': review_cycle.require_self_assessment,
            'require_360_feedback': review_cycle.require_360_feedback,
        }

    @classmethod
    def _get_self_assessment_status(cls, employee, review_cycle):
        if not review_cycle:
            return {
                'id': None,
                'status': 'no_active_cycle',
                'submitted': False,
                'submitted_at': None,
                'deadline': None,
                'is_overdue': False,
                'can_edit': False,
                'competency_ratings_count': 0,
            }

        deadline_iso = review_cycle.self_assessment_deadline.isoformat() if review_cycle.self_assessment_deadline else None
        today = timezone.now().date()
        is_past_deadline = (today > review_cycle.self_assessment_deadline) if review_cycle.self_assessment_deadline else False

        assessment = SelfAssessment.objects.filter(employee=employee, review_cycle=review_cycle).first()
        if not assessment:
            return {
                'id': None,
                'status': 'not_started',
                'submitted': False,
                'submitted_at': None,
                'deadline': deadline_iso,
                'is_overdue': is_past_deadline,
                'can_edit': not is_past_deadline,
                'competency_ratings_count': 0,
            }

        is_submitted = assessment.status == 'submitted'
        can_edit = (not is_submitted or review_cycle.allow_self_assessment_edit) and not is_past_deadline

        return {
            'id': str(assessment.id),
            'status': assessment.status,
            'submitted': is_submitted,
            'submitted_at': assessment.submitted_at.isoformat() if assessment.submitted_at else None,
            'deadline': deadline_iso,
            'is_overdue': is_past_deadline and not is_submitted,
            'can_edit': can_edit,
            'competency_ratings_count': assessment.competency_ratings_count,
        }

    @classmethod
    def _get_supervisor_review_status(cls, employee, review_cycle):
        if not review_cycle:
            return {
                'id': None,
                'status': 'no_active_cycle',
                'submitted': False,
                'submitted_at': None,
                'supervisor': None,
                'supervisor_id': None,
                'deadline': None,
            }

        deadline_iso = review_cycle.supervisor_review_deadline.isoformat() if review_cycle.supervisor_review_deadline else None
        review = SupervisorReview.objects.filter(employee=employee, review_cycle=review_cycle).first()
        if not review:
            supervisor_name = employee.manager.get_full_name() if getattr(employee, 'manager', None) else None
            supervisor_id = str(employee.manager_id) if getattr(employee, 'manager_id', None) else None
            return {
                'id': None,
                'status': 'pending',
                'submitted': False,
                'submitted_at': None,
                'supervisor': supervisor_name,
                'supervisor_id': supervisor_id,
                'deadline': deadline_iso,
            }

        is_submitted = review.status in ['submitted', 'approved']
        return {
            'id': str(review.id),
            'status': review.status,
            'submitted': is_submitted,
            'submitted_at': review.submitted_at.isoformat() if review.submitted_at else None,
            'supervisor': review.supervisor.get_full_name() if review.supervisor else None,
            'supervisor_id': str(review.supervisor_id) if review.supervisor_id else None,
            'deadline': deadline_iso,
            'recommendation': review.get_recommendation_display() if (review.status == 'approved' and hasattr(review, 'get_recommendation_display')) else None,
        }

    @classmethod
    def _get_final_rating(cls, employee, review_cycle):
        if not review_cycle:
            return None
        rating = FinalRating.objects.filter(employee=employee, review_cycle=review_cycle).first()
        if not rating:
            return None
        return {
            'id': str(rating.id),
            'score': float(rating.final_score) if rating.final_score is not None else None,
            'label': rating.final_rating_label or None,
            'color': rating.final_rating_color or None,
            'status': rating.status,
            'kpi_score': float(rating.kpi_score) if rating.kpi_score is not None else None,
            'competency_score': float(rating.competency_score) if rating.competency_score is not None else None,
            'is_published': rating.status in ['approved', 'locked'],
        }

    @classmethod
    def _get_pending_feedback_requests(cls, employee):
        requests = FeedbackRequest.objects.filter(
            subject=employee,
            status='draft',
            due_date__gte=timezone.now().date()
        ).select_related('reviewer')

        return [
            {
                'id': str(r.id),
                'reviewer': 'Anonymous Reviewer' if r.is_anonymous else (r.reviewer.get_full_name() if r.reviewer else 'Unknown'),
                'reviewer_type': r.get_reviewer_type_display() if hasattr(r, 'get_reviewer_type_display') else r.reviewer_type,
                'is_anonymous': r.is_anonymous,
                'due_date': r.due_date.isoformat() if r.due_date else None,
            }
            for r in requests
        ]

    @classmethod
    def _get_feedback_tasks_to_write(cls, employee):
        today = timezone.now().date()
        requests = FeedbackRequest.objects.filter(
            reviewer=employee,
            status='draft',
        ).select_related('subject', 'review_cycle').order_by('due_date')

        return [
            {
                'id': str(r.id),
                'subject_id': str(r.subject.id) if r.subject else None,
                'subject_name': r.subject.get_full_name() if r.subject else 'Unknown',
                'reviewer_type': r.get_reviewer_type_display() if hasattr(r, 'get_reviewer_type_display') else r.reviewer_type,
                'due_date': r.due_date.isoformat() if r.due_date else None,
                'cycle_name': r.review_cycle.name if r.review_cycle else None,
                'is_overdue': (today > r.due_date) if r.due_date else False,
            }
            for r in requests
        ]

    @classmethod
    def _get_active_pip(cls, employee):
        pip = PIP.objects.filter(
            employee=employee,
            status__in=['draft', 'submitted']
        ).first()
        if not pip:
            return None

        counts = pip.actions.aggregate(
            total=Count('id'),
            completed=Count('id', filter=Q(status='completed'))
        )
        total_actions = counts.get('total') or 0
        completed_actions = counts.get('completed') or 0

        effective_end_date = pip.extended_to_date or pip.end_date
        today = timezone.now().date()
        days_remaining = (effective_end_date - today).days if effective_end_date else 0

        return {
            'id': str(pip.id),
            'title': pip.title,
            'severity': pip.get_severity_display() if hasattr(pip, 'get_severity_display') else pip.severity,
            'status': pip.status,
            'start_date': pip.start_date.isoformat() if pip.start_date else None,
            'end_date': effective_end_date.isoformat() if effective_end_date else None,
            'progress': round((completed_actions / total_actions) * 100, 1) if total_actions > 0 else 0.0,
            'total_actions': total_actions,
            'completed_actions': completed_actions,
            'days_remaining': max(0, days_remaining),
        }

    @classmethod
    def _get_upcoming_deadlines(cls, employee, review_cycle):
        deadlines = []
        today = timezone.now().date()

        if review_cycle:
            if review_cycle.self_assessment_deadline and review_cycle.self_assessment_deadline >= today:
                # Only add if self assessment not yet submitted
                sa = SelfAssessment.objects.filter(employee=employee, review_cycle=review_cycle).first()
                if not sa or sa.status != 'submitted':
                    deadlines.append({
                        'type': 'self_assessment',
                        'title': f"Self Assessment for {review_cycle.name}",
                        'date': review_cycle.self_assessment_deadline.isoformat(),
                        'days_left': (review_cycle.self_assessment_deadline - today).days,
                    })

            if review_cycle.supervisor_review_deadline and review_cycle.supervisor_review_deadline >= today:
                deadlines.append({
                    'type': 'supervisor_review',
                    'title': f"Supervisor Review for {review_cycle.name}",
                    'date': review_cycle.supervisor_review_deadline.isoformat(),
                    'days_left': (review_cycle.supervisor_review_deadline - today).days,
                })

        # Also include pending feedback tasks
        pending_feedbacks = FeedbackRequest.objects.filter(
            reviewer=employee,
            status='draft',
            due_date__gte=today
        ).select_related('subject')[:3]

        for req in pending_feedbacks:
            subject_name = req.subject.get_full_name() if req.subject else 'Peer'
            deadlines.append({
                'type': 'feedback_request',
                'title': f"360 Feedback for {subject_name}",
                'date': req.due_date.isoformat() if req.due_date else None,
                'days_left': (req.due_date - today).days if req.due_date else 0,
            })

        return sorted(deadlines, key=lambda x: x['days_left'])[:5]