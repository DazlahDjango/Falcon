from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from ...models import SupervisorReview, CompetencyRating, FinalRating, SelfAssessment
from ..base_service import BaseReviewService
from .final_rating_service import FinalRatingService
from ..notification.notification_service import NotificationService

class SupervisorReviewService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_or_update(employee, supervisor, review_cycle, data, is_submit=False):
        """
        Create or update a supervisor review.
        
        Args:
            employee: User object (employee being reviewed)
            supervisor: User object (manager conducting review)
            review_cycle: ReviewCycle object
            data: Dictionary with review data
            is_submit: If True, submit the review
        
        Returns:
            SupervisorReview object
        """
        # Get or create existing review
        review, created = SupervisorReview.objects.get_or_create(
            employee=employee,
            review_cycle=review_cycle,
            defaults={
                'supervisor': supervisor,
                'status': 'draft'
            }
        )
        
        # Check if already submitted
        if review.status in ['submitted', 'approved']:
            raise ValidationError("Review already submitted and cannot be modified")
        
        # Update fields
        fields = ['overall_comment', 'performance_summary', 'strengths_observed',
                  'development_areas', 'achievements_recognized', 'career_progression_notes',
                  'training_recommendations', 'goals_for_next_period', 'recommendation',
                  'promotion_readiness', 'promotion_target_role', 'promotion_timeline',
                  'bonus_recommendation', 'bonus_percentage', 'override_kpi_score',
                  'override_reason']
        
        for field in fields:
            if field in data:
                setattr(review, field, data[field])
        
        # Link self assessment if exists
        if not review.self_assessment:
            self_assessment = review_cycle.self_assessments.filter(employee=employee).first()
            if self_assessment:
                review.self_assessment = self_assessment
        
        # Handle competency ratings
        if 'competency_ratings' in data:
            # Clear existing ratings for this review
            CompetencyRating.objects.filter(
                content_type=ContentType.objects.get_for_model(SupervisorReview),
                object_id=str(review.id)
            ).delete()
            
            for rating_data in data['competency_ratings']:
                CompetencyRating.objects.create(
                    content_type=ContentType.objects.get_for_model(SupervisorReview),
                    object_id=str(review.id),
                    competency_id=rating_data['competency_id'],
                    raw_score=rating_data['raw_score'],
                    comment=rating_data.get('comment', '')
                )
        
        # Submit if requested
        if is_submit and review.status not in ['submitted', 'approved']:
            # Check deadline
            today = timezone.now().date()
            if today > review_cycle.supervisor_review_deadline:
                raise ValidationError("Supervisor review deadline has passed")
            
            review.status = 'submitted'
            review.submitted_at = timezone.now()
        
        review.save()
        
        # Generate final rating if submitted
        if is_submit:
            FinalRatingService.create_or_update_from_review(review)
            NotificationService.notify_review_completed(review)
        
        return review
    
    @staticmethod
    def approve_review(review_id, approved_by):
        """
        Approve a supervisor review (usually by HR).
        
        Args:
            review_id: ID of SupervisorReview
            approved_by: User object approving
        
        Returns:
            SupervisorReview object
        """
        review = SupervisorReview.objects.get(id=review_id)
        
        if review.status != 'submitted':
            raise ValidationError("Only submitted reviews can be approved")
        
        review.status = 'approved'
        review.reviewed_at = timezone.now()
        review.reviewed_by = approved_by
        review.save()
        
        # Update final rating
        final_rating = FinalRating.objects.filter(
            review_cycle=review.review_cycle,
            employee=review.employee
        ).first()
        
        if final_rating:
            final_rating.status = 'approved'
            final_rating.approved_by = approved_by
            final_rating.approved_at = timezone.now()
            final_rating.save()
        
        NotificationService.notify_review_approved(review)
        
        return review
    
    @staticmethod
    def reject_review(review_id, reason, rejected_by):
        """
        Reject a supervisor review and request revisions.
        
        Args:
            review_id: ID of SupervisorReview
            reason: String reason for rejection
            rejected_by: User object rejecting
        
        Returns:
            SupervisorReview object
        """
        review = SupervisorReview.objects.get(id=review_id)
        
        if review.status != 'submitted':
            raise ValidationError("Only submitted reviews can be rejected")
        
        review.status = 'rejected'
        review.rejection_reason = reason
        review.reviewed_by = rejected_by
        review.reviewed_at = timezone.now()
        review.save()
        
        # Update self assessment to draft for revision
        if review.self_assessment:
            review.self_assessment.status = 'draft'
            review.self_assessment.save()
        
        NotificationService.notify_review_rejected(review, reason)
        
        return review
    
    @staticmethod
    def get_queue(manager, review_cycle=None):
        """
        Get review queue for a manager (all direct reports needing review).
        
        Args:
            manager: User object (manager)
            review_cycle: Optional cycle filter
        
        Returns:
            QuerySet of SupervisorReview objects
        """
        direct_reports = manager.direct_reports.all()
        
        queryset = SupervisorReview.objects.filter(
            employee__in=direct_reports
        ).exclude(status='approved')
        
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        
        return queryset.select_related('employee', 'self_assessment')
    
    @staticmethod
    def get_comparison(review_id):
        """
        Get comparison between self assessment and supervisor review.
        
        Args:
            review_id: ID of SupervisorReview
        
        Returns:
            dict: Comparison data
        """
        review = SupervisorReview.objects.get(id=review_id)
        
        if not review.self_assessment:
            return {'error': 'No self assessment available'}
        
        # Get self competency ratings
        self_ratings = CompetencyRating.objects.filter(
            content_type=ContentType.objects.get_for_model(SelfAssessment),
            object_id=str(review.self_assessment.id)
        ).select_related('competency')
        
        # Get supervisor competency ratings
        supervisor_ratings = CompetencyRating.objects.filter(
            content_type=ContentType.objects.get_for_model(SupervisorReview),
            object_id=str(review.id)
        ).select_related('competency')
        
        # Map ratings by competency
        comparison = []
        for self_rating in self_ratings:
            supervisor_rating = supervisor_ratings.filter(
                competency=self_rating.competency
            ).first()
            
            comparison.append({
                'competency': self_rating.competency.name,
                'self_score': float(self_rating.raw_score) if self_rating.raw_score else None,
                'supervisor_score': float(supervisor_rating.raw_score) if supervisor_rating and supervisor_rating.raw_score else None,
                'gap': self_rating.raw_score - supervisor_rating.raw_score if self_rating.raw_score and supervisor_rating and supervisor_rating.raw_score else None
            })
        
        return {
            'employee': str(review.employee),
            'supervisor': str(review.supervisor),
            'review_cycle': review.review_cycle.name,
            'comparison': comparison
        }