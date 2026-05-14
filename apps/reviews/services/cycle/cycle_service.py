# apps/reviews/services/cycle/cycle_service.py
"""
Cycle Service - Handles review cycle activation, completion, and management
"""

from django.utils import timezone
from django.core.exceptions import ValidationError

from ...models import ReviewCycle, SelfAssessment, FinalRating
from ..base_service import BaseReviewService
from ..assessment.final_rating_service import FinalRatingService
from ..notification.notification_service import NotificationService


class CycleService(BaseReviewService):
    """
    Handles business logic for review cycles
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def activate_cycle(cycle_id):
        """
        Activate a review cycle.
        
        Args:
            cycle_id: ID of ReviewCycle instance
        
        Returns:
            ReviewCycle instance
        """
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        if cycle.status != 'draft':
            raise ValidationError(f"Cannot activate cycle with status: {cycle.status}")
        
        # Check dates
        today = timezone.now().date()
        if cycle.start_date > today:
            raise ValidationError(f"Cannot activate cycle before start date: {cycle.start_date}")
        
        cycle.status = 'active'
        cycle.save()
        
        # Create self assessments for all employees
        CycleService.create_self_assessments_for_cycle(cycle)
        
        # Send notifications
        employees = cycle.get_participating_employees()
        NotificationService.notify_cycle_started(cycle, employees)
        
        return cycle
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def close_cycle(cycle_id):
        """
        Close a review cycle (mark as completed).
        
        Args:
            cycle_id: ID of ReviewCycle instance
        
        Returns:
            ReviewCycle instance
        """
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        if cycle.status != 'active':
            raise ValidationError(f"Cannot close cycle with status: {cycle.status}")
        
        cycle.status = 'completed'
        cycle.save()
        
        # Process cycle completion (generate final ratings)
        CycleService.process_cycle_completion(cycle)
        
        return cycle
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def archive_cycle(cycle_id):
        """
        Archive a completed review cycle.
        
        Args:
            cycle_id: ID of ReviewCycle instance
        
        Returns:
            ReviewCycle instance
        """
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        if cycle.status not in ['completed', 'closed']:
            raise ValidationError("Only completed cycles can be archived")
        
        cycle.status = 'archived'
        cycle.save()
        
        return cycle
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_self_assessments_for_cycle(cycle):
        """
        Create self assessments for all employees in a cycle.
        
        Args:
            cycle: ReviewCycle instance
        
        Returns:
            int: Number of self assessments created
        """
        employees = cycle.get_participating_employees()
        created_count = 0
        
        for employee in employees:
            assessment, created = SelfAssessment.objects.get_or_create(
                review_cycle=cycle,
                employee=employee,
                defaults={
                    'status': 'draft',
                    'tenant': cycle.tenant
                }
            )
            if created:
                created_count += 1
        
        return created_count
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def process_cycle_completion(cycle):
        """
        Process cycle completion - generate final ratings for all employees.
        
        Args:
            cycle: ReviewCycle instance
        
        Returns:
            int: Number of final ratings generated
        """
        # Get all approved supervisor reviews
        reviews = cycle.supervisor_reviews.filter(status='approved')
        generated_count = 0
        
        for review in reviews:
            try:
                final_rating = FinalRatingService.create_or_update_from_review(review.id)
                if final_rating:
                    generated_count += 1
            except Exception as e:
                # Log error but continue with other reviews
                print(f"Error generating final rating for review {review.id}: {e}")
        
        return generated_count
    
    @staticmethod
    def get_cycle_progress(cycle_id):
        """
        Get progress statistics for a review cycle.
        
        Args:
            cycle_id: ID of ReviewCycle instance
        
        Returns:
            dict: Progress statistics
        """
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        total_employees = cycle.get_participating_employees().count()
        
        # Self assessment progress
        self_assessments = SelfAssessment.objects.filter(review_cycle=cycle)
        self_submitted = self_assessments.filter(status='submitted').count()
        self_pending = total_employees - self_submitted
        
        # Supervisor review progress
        supervisor_reviews = cycle.supervisor_reviews.all()
        supervisor_completed = supervisor_reviews.filter(status='approved').count()
        supervisor_pending = total_employees - supervisor_completed
        
        # Final rating progress
        final_ratings = FinalRating.objects.filter(review_cycle=cycle)
        final_locked = final_ratings.filter(status='locked').count()
        final_pending = total_employees - final_locked
        
        # Overall completion (all three stages complete)
        overall_completed = final_locked
        
        return {
            'total_employees': total_employees,
            'self_assessment': {
                'submitted': self_submitted,
                'pending': self_pending,
                'percentage': round((self_submitted / total_employees) * 100, 1) if total_employees > 0 else 0
            },
            'supervisor_review': {
                'completed': supervisor_completed,
                'pending': supervisor_pending,
                'percentage': round((supervisor_completed / total_employees) * 100, 1) if total_employees > 0 else 0
            },
            'final_rating': {
                'locked': final_locked,
                'pending': final_pending,
                'percentage': round((final_locked / total_employees) * 100, 1) if total_employees > 0 else 0
            },
            'overall_completion_percentage': round((overall_completed / total_employees) * 100, 1) if total_employees > 0 else 0
        }
    
    @staticmethod
    def get_upcoming_cycles(tenant, limit=5):
        """
        Get upcoming review cycles for a tenant.
        
        Args:
            tenant: Client instance
            limit: Maximum number of cycles to return
        
        Returns:
            QuerySet of ReviewCycle objects
        """
        today = timezone.now().date()
        
        return ReviewCycle.objects.filter(
            tenant=tenant,
            start_date__gt=today,
            status__in=['draft', 'active']
        ).order_by('start_date')[:limit]
    
    @staticmethod
    def get_active_cycle_for_employee(employee):
        """
        Get the current active review cycle for an employee.
        
        Args:
            employee: User instance
        
        Returns:
            ReviewCycle instance or None
        """
        today = timezone.now().date()
        
        return ReviewCycle.objects.filter(
            tenant=employee.tenant,
            start_date__lte=today,
            end_date__gte=today,
            status='active'
        ).first()
    
    @staticmethod
    def can_employee_submit_self_assessment(employee, cycle=None):
        """
        Check if an employee can submit their self assessment.
        
        Args:
            employee: User instance
            cycle: Optional ReviewCycle instance
        
        Returns:
            tuple: (can_submit, reason)
        """
        if cycle is None:
            cycle = CycleService.get_active_cycle_for_employee(employee)
        
        if not cycle:
            return False, "No active review cycle found"
        
        # Check if employee is part of the cycle
        if not cycle.get_participating_employees().filter(id=employee.id).exists():
            return False, "You are not part of this review cycle"
        
        # Check if already submitted
        assessment = SelfAssessment.objects.filter(
            review_cycle=cycle,
            employee=employee
        ).first()
        
        if assessment and assessment.status == 'submitted':
            if not cycle.allow_self_assessment_edit:
                return False, "Your self assessment has already been submitted and cannot be edited"
        
        # Check deadline
        today = timezone.now().date()
        if today > cycle.self_assessment_deadline:
            return False, f"Self assessment deadline has passed ({cycle.self_assessment_deadline})"
        
        return True, None