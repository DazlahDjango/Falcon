# apps/reviews/services/feedback/feedback_service.py
"""
360 feedback request and response business logic
"""

from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType

from ...models import FeedbackRequest, FeedbackResponse, CompetencyRating
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService


class FeedbackService(BaseReviewService):
    """
    Handles business logic for 360 feedback requests and responses
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_request(subject, reviewer, review_cycle, requested_by, data):
        """
        Create a feedback request.
        
        Args:
            subject: User being reviewed
            reviewer: User giving feedback
            review_cycle: ReviewCycle object
            requested_by: User who requested (HR or manager)
            data: Dictionary with request data
        
        Returns:
            FeedbackRequest object
        """
        # Check if request already exists
        existing = FeedbackRequest.objects.filter(
            review_cycle=review_cycle,
            subject=subject,
            reviewer=reviewer
        ).first()
        
        if existing:
            raise ValidationError("Feedback request already exists for this reviewer")
        
        # Create request
        request = FeedbackRequest.objects.create(
            review_cycle=review_cycle,
            subject=subject,
            reviewer=reviewer,
            requested_by=requested_by,
            reviewer_type=data.get('reviewer_type', 'peer'),
            is_anonymous=data.get('is_anonymous', True),
            is_required=data.get('is_required', False),
            due_date=data.get('due_date'),
            status='pending'
        )
        
        # Send notification to reviewer
        NotificationService.notify_feedback_requested(request)
        
        return request
    
    @staticmethod
    def get_pending_requests(reviewer):
        """
        Get all pending feedback requests for a reviewer.
        
        Args:
            reviewer: User object
        
        Returns:
            QuerySet of FeedbackRequest objects
        """
        return FeedbackRequest.objects.filter(
            reviewer=reviewer,
            status='pending',
            due_date__gte=timezone.now().date()
        ).select_related('subject', 'review_cycle')
    
    @staticmethod
    def get_overdue_requests(reviewer):
        """
        Get overdue feedback requests for a reviewer.
        
        Args:
            reviewer: User object
        
        Returns:
            QuerySet of FeedbackRequest objects
        """
        return FeedbackRequest.objects.filter(
            reviewer=reviewer,
            status='pending',
            due_date__lt=timezone.now().date()
        ).select_related('subject', 'review_cycle')
    
    @staticmethod
    def get_requests_for_subject(subject, review_cycle=None):
        """
        Get all feedback requests for a subject (employee being reviewed).
        
        Args:
            subject: User object
            review_cycle: Optional cycle filter
        
        Returns:
            QuerySet of FeedbackRequest objects
        """
        queryset = FeedbackRequest.objects.filter(subject=subject)
        
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        
        return queryset.select_related('reviewer')
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def submit_response(request_id, data):
        """
        Submit feedback response.
        
        Args:
            request_id: FeedbackRequest ID
            data: Dictionary with response data
        
        Returns:
            FeedbackResponse object
        """
        request = FeedbackRequest.objects.get(id=request_id)
        
        if request.status != 'pending':
            raise ValidationError("Feedback request is not pending")
        
        # Check deadline
        if request.due_date and request.due_date < timezone.now().date():
            raise ValidationError("Feedback deadline has passed")
        
        # Create response
        response = FeedbackResponse.objects.create(
            feedback_request=request,
            overall_rating=data.get('overall_rating'),
            strengths=data.get('strengths', ''),
            areas_for_improvement=data.get('areas_for_improvement', ''),
            specific_examples=data.get('specific_examples', ''),
            suggestions=data.get('suggestions', ''),
            additional_comments=data.get('additional_comments', ''),
            ratings=data.get('ratings', {}),
            is_anonymous=request.is_anonymous
        )
        
        # Update request status
        request.status = 'completed'
        request.completed_at = timezone.now()
        request.save()
        
        # Check if all required requests are complete
        FeedbackService._check_all_requests_complete(request.review_cycle, request.subject)
        
        return response
    
    @staticmethod
    def _check_all_requests_complete(review_cycle, subject):
        """
        Check if all required feedback requests for a subject are complete.
        Triggers summary generation if complete.
        """
        pending_requests = FeedbackRequest.objects.filter(
            review_cycle=review_cycle,
            subject=subject,
            is_required=True,
            status='pending'
        ).count()
        
        if pending_requests == 0:
            # All required feedback collected - generate summary
            from .summary_service import SummaryService
            SummaryService.generate_summary(review_cycle.id, subject.id)
    
    @staticmethod
    def get_response_summary(subject, review_cycle):
        """
        Get summary of all feedback responses for a subject.
        
        Args:
            subject: User object
            review_cycle: ReviewCycle object
        
        Returns:
            dict: Summary statistics
        """
        responses = FeedbackResponse.objects.filter(
            feedback_request__review_cycle=review_cycle,
            feedback_request__subject=subject
        ).select_related('feedback_request')
        
        if not responses.exists():
            return None
        
        # Calculate averages by reviewer type
        type_ratings = {}
        all_ratings = []
        
        for response in responses:
            req = response.feedback_request
            if response.overall_rating:
                if req.reviewer_type not in type_ratings:
                    type_ratings[req.reviewer_type] = []
                type_ratings[req.reviewer_type].append(float(response.overall_rating))
                all_ratings.append(float(response.overall_rating))
        
        # Calculate averages
        for r_type in type_ratings:
            type_ratings[r_type] = round(sum(type_ratings[r_type]) / len(type_ratings[r_type]), 1)
        
        return {
            'total_responses': responses.count(),
            'average_by_type': type_ratings,
            'overall_average': round(sum(all_ratings) / len(all_ratings), 1) if all_ratings else None,
            'strengths': [r.strengths for r in responses if r.strengths],
            'improvements': [r.areas_for_improvement for r in responses if r.areas_for_improvement]
        }