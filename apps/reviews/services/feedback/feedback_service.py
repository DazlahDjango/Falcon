from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import FeedbackRequest, FeedbackResponse
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService

class FeedbackService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_request(subject, reviewer, review_cycle, requested_by, data):
        existing = FeedbackRequest.objects.filter(review_cycle=review_cycle, subject=subject, reviewer=reviewer).first()
        if existing:
            raise ValidationError("Feedback request already exists for this reviewer")
        request = FeedbackRequest.objects.create(review_cycle=review_cycle, subject=subject, reviewer=reviewer, requested_by=requested_by, reviewer_type=data.get('reviewer_type', 'peer'), is_anonymous=data.get('is_anonymous', True), is_required=data.get('is_required', False), due_date=data.get('due_date'), status='draft', tenant_id=review_cycle.tenant_id)
        NotificationService.notify_feedback_requested(request)
        return request
    @staticmethod
    def get_pending_requests(reviewer):
        return FeedbackRequest.objects.filter(reviewer=reviewer, status='draft', due_date__gte=timezone.now().date()).select_related('subject', 'review_cycle')
    @staticmethod
    def get_overdue_requests(reviewer):
        return FeedbackRequest.objects.filter(reviewer=reviewer, status='draft', due_date__lt=timezone.now().date()).select_related('subject', 'review_cycle')
    @staticmethod
    def get_requests_for_subject(subject, review_cycle=None):
        queryset = FeedbackRequest.objects.filter(subject=subject)
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        return queryset.select_related('reviewer')
    @staticmethod
    @BaseReviewService.atomic_operation
    def submit_response(request_id, data):
        request = FeedbackRequest.objects.get(id=request_id)
        if request.status != 'draft':
            raise ValidationError("Feedback request is not pending")
        if request.due_date and request.due_date < timezone.now().date():
            raise ValidationError("Feedback deadline has passed")
        response = FeedbackResponse.objects.create(feedback_request=request, overall_rating=data.get('overall_rating'), strengths=data.get('strengths', ''), areas_for_improvement=data.get('areas_for_improvement', ''), specific_examples=data.get('specific_examples', ''), suggestions=data.get('suggestions', ''), additional_comments=data.get('additional_comments', ''), ratings=data.get('ratings', {}), is_anonymous=request.is_anonymous, tenant_id=request.tenant_id)
        request.status = 'submitted'
        request.completed_at = timezone.now()
        request.save()
        from .summary_service import SummaryService
        pending_required = FeedbackRequest.objects.filter(review_cycle=request.review_cycle, subject=request.subject, is_required=True, status='draft').count()
        if pending_required == 0:
            SummaryService.generate_summary(request.review_cycle.id, request.subject.id)
        return response
    @staticmethod
    def get_response_summary(subject, review_cycle):
        responses = FeedbackResponse.objects.filter(feedback_request__review_cycle=review_cycle, feedback_request__subject=subject).select_related('feedback_request')
        if not responses.exists():
            return None
        type_ratings = {}
        all_ratings = []
        for response in responses:
            req = response.feedback_request
            if response.overall_rating:
                if req.reviewer_type not in type_ratings:
                    type_ratings[req.reviewer_type] = []
                type_ratings[req.reviewer_type].append(float(response.overall_rating))
                all_ratings.append(float(response.overall_rating))
        for r_type in type_ratings:
            type_ratings[r_type] = round(sum(type_ratings[r_type]) / len(type_ratings[r_type]), 1)
        return {'total_responses': responses.count(), 'average_by_type': type_ratings, 'overall_average': round(sum(all_ratings) / len(all_ratings), 1) if all_ratings else None, 'strengths': [r.strengths for r in responses if r.strengths], 'improvements': [r.areas_for_improvement for r in responses if r.areas_for_improvement]}