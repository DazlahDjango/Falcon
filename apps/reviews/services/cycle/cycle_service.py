from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import ReviewCycle, SelfAssessment, FinalRating, SupervisorReview
from ..base_service import BaseReviewService
from ..assessment.final_rating_service import FinalRatingService
from ..notification.notification_service import NotificationService

class CycleService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def activate_cycle(cycle_id):
        cycle = ReviewCycle.objects.get(id=cycle_id)
        if cycle.status != 'draft':
            raise ValidationError(f"Cannot activate cycle with status: {cycle.status}")
        if cycle.start_date > timezone.now().date():
            raise ValidationError(f"Cannot activate cycle before start date: {cycle.start_date}")
        cycle.status = 'submitted'
        cycle.save()
        CycleService.create_self_assessments_for_cycle(cycle)
        employees = list(cycle.self_assessments.values_list('employee', flat=True))
        from apps.accounts.models import User
        participants = User.objects.filter(id__in=employees)
        NotificationService.notify_cycle_started(cycle, participants)
        return cycle
    @staticmethod
    @BaseReviewService.atomic_operation
    def close_cycle(cycle_id):
        cycle = ReviewCycle.objects.get(id=cycle_id)
        if cycle.status != 'submitted':
            raise ValidationError(f"Cannot close cycle with status: {cycle.status}")
        cycle.status = 'completed'
        cycle.save()
        CycleService.process_cycle_completion(cycle)
        return cycle
    @staticmethod
    @BaseReviewService.atomic_operation
    def archive_cycle(cycle_id):
        cycle = ReviewCycle.objects.get(id=cycle_id)
        if cycle.status not in ['completed', 'approved']:
            raise ValidationError("Only completed cycles can be archived")
        cycle.status = 'archived'
        cycle.save()
        return cycle
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_self_assessments_for_cycle(cycle):
        from apps.accounts.models import User
        employees = User.objects.filter(tenant_id=cycle.tenant_id, is_active=True)
        if not cycle.include_all_departments:
            employees = employees.filter(department_id__in=cycle.included_departments.values_list('id', flat=True))
        created_count = 0
        for employee in employees:
            assessment, created = SelfAssessment.objects.get_or_create(review_cycle=cycle, employee=employee, defaults={'status': 'draft', 'tenant_id': cycle.tenant_id})
            if created:
                created_count += 1
        return created_count
    @staticmethod
    @BaseReviewService.atomic_operation
    def process_cycle_completion(cycle):
        reviews = SupervisorReview.objects.filter(review_cycle=cycle, status='approved')
        generated_count = 0
        for review in reviews:
            try:
                final_rating = FinalRatingService.create_or_update_from_review(review.id)
                if final_rating:
                    generated_count += 1
            except Exception:
                pass
        return generated_count
    @staticmethod
    def get_cycle_progress(cycle_id):
        cycle = ReviewCycle.objects.get(id=cycle_id)
        from apps.accounts.models import User
        total_employees = User.objects.filter(tenant_id=cycle.tenant_id, is_active=True).count()
        self_assessments = SelfAssessment.objects.filter(review_cycle=cycle)
        self_submitted = self_assessments.filter(status='submitted').count()
        self_pending = total_employees - self_submitted
        supervisor_reviews = SupervisorReview.objects.filter(review_cycle=cycle)
        supervisor_completed = supervisor_reviews.filter(status='approved').count()
        supervisor_pending = total_employees - supervisor_completed
        final_ratings = FinalRating.objects.filter(review_cycle=cycle)
        final_locked = final_ratings.filter(status='locked').count()
        final_pending = total_employees - final_locked
        overall_completed = final_locked
        return {'total_employees': total_employees, 'self_assessment': {'submitted': self_submitted, 'pending': self_pending, 'percentage': round((self_submitted / total_employees) * 100, 1) if total_employees > 0 else 0}, 'supervisor_review': {'completed': supervisor_completed, 'pending': supervisor_pending, 'percentage': round((supervisor_completed / total_employees) * 100, 1) if total_employees > 0 else 0}, 'final_rating': {'locked': final_locked, 'pending': final_pending, 'percentage': round((final_locked / total_employees) * 100, 1) if total_employees > 0 else 0}, 'overall_completion_percentage': round((overall_completed / total_employees) * 100, 1) if total_employees > 0 else 0}
    @staticmethod
    def get_upcoming_cycles(tenant, limit=5):
        today = timezone.now().date()
        return ReviewCycle.objects.filter(tenant_id=tenant.id, start_date__gt=today, status__in=['draft', 'submitted']).order_by('start_date')[:limit]
    @staticmethod
    def get_active_cycle_for_employee(employee):
        today = timezone.now().date()
        return ReviewCycle.objects.filter(tenant_id=employee.tenant_id, start_date__lte=today, end_date__gte=today, status='submitted').first()
    @staticmethod
    def can_employee_submit_self_assessment(employee, cycle=None):
        if cycle is None:
            cycle = CycleService.get_active_cycle_for_employee(employee)
        if not cycle:
            return False, "No active review cycle found"
        assessment = SelfAssessment.objects.filter(review_cycle=cycle, employee=employee).first()
        if assessment and assessment.status == 'submitted':
            if not cycle.allow_self_assessment_edit:
                return False, "Your self assessment has already been submitted and cannot be edited"
        if timezone.now().date() > cycle.self_assessment_deadline:
            return False, f"Self assessment deadline has passed ({cycle.self_assessment_deadline})"
        return True, None