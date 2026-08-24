# apps/reviews/services/feedback/summary_service.py
"""
Generate aggregated, anonymized feedback summaries
"""

from django.utils import timezone

from ...models import FeedbackRequest, FeedbackResponse, FeedbackSummary
from ..base_service import BaseReviewService


class SummaryService(BaseReviewService):
    """
    Generates aggregated feedback summaries from individual responses
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def generate_summary(review_cycle_id, subject_id):
        """
        Generate a feedback summary for a subject.
        
        Args:
            review_cycle_id: ReviewCycle ID
            subject_id: User ID (employee being reviewed)
        
        Returns:
            FeedbackSummary object
        """
        from apps.accounts.models import User
        from ...models import ReviewCycle
        
        review_cycle = ReviewCycle.objects.get(id=review_cycle_id)
        subject = User.objects.get(id=subject_id)
        
        # Get all completed feedback responses
        responses = FeedbackResponse.objects.filter(
            feedback_request__review_cycle=review_cycle,
            feedback_request__subject=subject,
            feedback_request__status__in=['completed', 'submitted']
        ).select_related('feedback_request')
        
        if not responses.exists():
            return None
        
        # Calculate averages by reviewer type
        type_ratings = {
            'manager': [],
            'peer': [],
            'subordinate': [],
            'cross_dept': []
        }
        
        all_ratings = []
        common_strengths = []
        common_improvements = []
        
        for response in responses:
            req = response.feedback_request
            
            # Collect ratings
            if response.overall_rating:
                rating_type = req.reviewer_type
                if rating_type in type_ratings:
                    type_ratings[rating_type].append(float(response.overall_rating))
                all_ratings.append(float(response.overall_rating))
            
            # Collect strengths (simple frequency counting)
            if response.strengths:
                common_strengths.append(response.strengths)
            
            # Collect improvements
            if response.areas_for_improvement:
                common_improvements.append(response.areas_for_improvement)
        
        # Calculate averages
        avg_manager = round(sum(type_ratings['manager']) / len(type_ratings['manager']), 1) if type_ratings['manager'] else None
        avg_peer = round(sum(type_ratings['peer']) / len(type_ratings['peer']), 1) if type_ratings['peer'] else None
        avg_subordinate = round(sum(type_ratings['subordinate']) / len(type_ratings['subordinate']), 1) if type_ratings['subordinate'] else None
        avg_cross = round(sum(type_ratings['cross_dept']) / len(type_ratings['cross_dept']), 1) if type_ratings['cross_dept'] else None
        overall_avg = round(sum(all_ratings) / len(all_ratings), 1) if all_ratings else None
        
        # Create or update summary
        summary, created = FeedbackSummary.objects.update_or_create(
            review_cycle=review_cycle,
            subject=subject,
            defaults={
                'tenant_id': subject.tenant_id,
                'total_responses': responses.count(),
                'avg_manager_rating': avg_manager,
                'avg_peer_rating': avg_peer,
                'avg_subordinate_rating': avg_subordinate,
                'avg_cross_dept_rating': avg_cross,
                'overall_avg_rating': overall_avg,
                'common_strengths': common_strengths[:10],  # Top 10
                'common_improvements': common_improvements[:10],
                'anonymized_responses': SummaryService._anonymize_responses(responses)
            }
        )
        
        return summary
    
    @staticmethod
    def _anonymize_responses(responses):
        """
        Anonymize feedback responses by removing reviewer names.
        
        Args:
            responses: QuerySet of FeedbackResponse objects
        
        Returns:
            list: Anonymized response dictionaries
        """
        anonymized = []
        
        for response in responses:
            anonymized.append({
                'reviewer_type': response.feedback_request.reviewer_type,
                'overall_rating': float(response.overall_rating) if response.overall_rating else None,
                'strengths': response.strengths,
                'areas_for_improvement': response.areas_for_improvement,
                'suggestions': response.suggestions
            })
        
        return anonymized
    
    @staticmethod
    def get_summary(subject, review_cycle):
        """
        Get existing feedback summary for a subject.
        
        Args:
            subject: User object
            review_cycle: ReviewCycle object
        
        Returns:
            FeedbackSummary object or None
        """
        try:
            return FeedbackSummary.objects.get(
                review_cycle=review_cycle,
                subject=subject
            )
        except FeedbackSummary.DoesNotExist:
            return None
    
    @staticmethod
    def share_with_subject(summary_id, shared_by):
        """
        Mark feedback summary as shared with the subject.
        
        Args:
            summary_id: FeedbackSummary ID
            shared_by: User who shared (usually HR)
        
        Returns:
            FeedbackSummary object
        """
        summary = FeedbackSummary.objects.get(id=summary_id)
        
        summary.is_shared_with_subject = True
        summary.shared_at = timezone.now()
        summary.shared_by = shared_by
        summary.save()
        
        return summary