# apps/reviews/services/assessment/self_assessment_service.py
"""
Self Assessment business logic
"""

from django.utils import timezone
from django.core.exceptions import ValidationError

from ...models import SelfAssessment, CompetencyRating
from ..base_service import BaseReviewService
from ..rating.score_calculator import ScoreCalculator
from ..notification.notification_service import NotificationService


class SelfAssessmentService(BaseReviewService):
    """
    Handles all business logic for Self Assessment model
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_or_update(employee, review_cycle, data, is_submit=False):
        """
        Create or update a self assessment.
        
        Args:
            employee: User object
            review_cycle: ReviewCycle object
            data: Dictionary with assessment data
            is_submit: If True, submit the assessment
        
        Returns:
            SelfAssessment object
        """
        # Get or create existing assessment
        assessment, created = SelfAssessment.objects.get_or_create(
            employee=employee,
            review_cycle=review_cycle,
            defaults={
                'status': 'draft'
            }
        )
        
        # Check if already submitted and not allowing edits
        if assessment.status == 'submitted' and not review_cycle.allow_self_assessment_edit:
            raise ValidationError("Self assessment already submitted and cannot be edited")
        
        # Update fields
        fields = ['overall_comment', 'strengths', 'areas_for_improvement', 
                  'career_aspirations', 'challenges_faced', 'achievements',
                  'training_completed', 'training_requested', 'goals_achieved',
                  'goals_for_next_period']
        
        for field in fields:
            if field in data:
                setattr(assessment, field, data[field])
        
        # Handle competency ratings
        if 'competency_ratings' in data:
            for rating_data in data['competency_ratings']:
                CompetencyRating.objects.update_or_create(
                    content_type=ContentType.objects.get_for_model(SelfAssessment),
                    object_id=str(assessment.id),
                    competency_id=rating_data['competency_id'],
                    defaults={
                        'raw_score': rating_data['raw_score'],
                        'comment': rating_data.get('comment', '')
                    }
                )
        
        # Submit if requested and not already submitted
        if is_submit and assessment.status != 'submitted':
            # Check deadline
            today = timezone.now().date()
            if today > review_cycle.self_assessment_deadline:
                raise ValidationError("Self assessment deadline has passed")
            
            assessment.status = 'submitted'
            assessment.submitted_at = timezone.now()
            
            # Calculate and store average rating
            assessment.avg_competency_rating = ScoreCalculator.calculate_avg_competency_score(assessment)
        
        assessment.save()
        
        # Send notifications
        if is_submit:
            NotificationService.notify_supervisor_review_ready(assessment)
        
        return assessment
    
    @staticmethod
    def get_for_manager(manager, review_cycle=None):
        """
        Get all self assessments for manager's direct reports.
        
        Args:
            manager: User object (manager)
            review_cycle: Optional cycle filter
        
        Returns:
            QuerySet of SelfAssessment objects
        """
        # Get all direct reports of manager
        direct_reports = manager.direct_reports.all()
        
        queryset = SelfAssessment.objects.filter(
            employee__in=direct_reports,
            status='submitted'
        )
        
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        
        return queryset
    
    @staticmethod
    def get_progress_stats(review_cycle):
        """
        Get completion statistics for self assessments in a cycle.
        
        Args:
            review_cycle: ReviewCycle object
        
        Returns:
            dict: Statistics
        """
        total_employees = review_cycle.get_participating_employees().count()
        submitted = SelfAssessment.objects.filter(
            review_cycle=review_cycle,
            status='submitted'
        ).count()
        
        return {
            'total_employees': total_employees,
            'submitted': submitted,
            'pending': total_employees - submitted,
            'percentage': round((submitted / total_employees) * 100, 1) if total_employees > 0 else 0
        }