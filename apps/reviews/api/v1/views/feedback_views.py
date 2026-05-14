# apps/reviews/api/v1/views/feedback_views.py
"""
Views for FeedbackRequest, FeedbackResponse, and FeedbackSummary models
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models

from apps.reviews.models import FeedbackRequest, FeedbackResponse, FeedbackSummary, ReviewCycle
from apps.reviews.services.feedback.feedback_service import FeedbackService
from apps.reviews.services.feedback.summary_service import SummaryService
from ..serializers import (
    FeedbackRequestSerializer,
    FeedbackRequestCreateSerializer,
    FeedbackResponseSerializer,
    FeedbackResponseSubmitSerializer,
    FeedbackSummarySerializer,
    FeedbackSummaryShareSerializer,
)
from .base_views import BaseReviewViewSet, BaseReadOnlyViewSet
from ..permissions import (
    CanRequestFeedback,
    CanProvideFeedback,
    CanViewFeedbackSummary,
    CanManageFeedbackRequests,
)
from ..filters.feedback_filters import (
    FeedbackRequestFilter,
    FeedbackResponseFilter,
    FeedbackSummaryFilter,
)


class FeedbackRequestViewSet(BaseReviewViewSet):
    """
    ViewSet for Feedback Requests.
    
    Actions:
    - GET /feedback-requests/ - List feedback requests
    - POST /feedback-requests/ - Create new feedback request
    - GET /feedback-requests/{id}/ - Get request details
    - PUT /feedback-requests/{id}/ - Update request
    - DELETE /feedback-requests/{id}/ - Delete request
    - GET /feedback-requests/pending/ - Get pending requests for current user
    - GET /feedback-requests/for-subject/{subject_id}/ - Get requests for a subject
    - GET /feedback-requests/for-cycle/{cycle_id}/ - Get by cycle
    - POST /feedback-requests/{id}/remind/ - Send reminder
    """
    
    queryset = FeedbackRequest.objects.all()
    filterset_class = FeedbackRequestFilter
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FeedbackRequestCreateSerializer
        return FeedbackRequestSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [CanRequestFeedback]
        elif self.action in ['update', 'partial_update', 'destroy', 'remind']:
            self.permission_classes = [CanManageFeedbackRequests]
        else:
            self.permission_classes = [CanProvideFeedback]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get pending feedback requests for the current user (as reviewer).
        """
        reviewer = request.user
        
        requests = self.get_queryset().filter(
            reviewer=reviewer,
            status='pending'
        ).select_related('subject', 'review_cycle')
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-subject/(?P<subject_id>[^/.]+)')
    def for_subject(self, request, subject_id=None):
        """
        Get all feedback requests for a specific subject (employee).
        """
        from apps.accounts.models import User
        
        try:
            subject = User.objects.get(id=subject_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Subject not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if request.user.role not in ['admin', 'hr'] and request.user != subject.manager:
            return Response(
                {'error': 'You do not have permission to view these requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        requests = self.get_queryset().filter(subject=subject)
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        """
        Get all feedback requests for a specific cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        requests = self.get_queryset().filter(review_cycle=cycle)
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def remind(self, request, pk=None):
        """
        Send a reminder for a pending feedback request.
        """
        feedback_request = self.get_object()
        
        if feedback_request.status != 'pending':
            return Response(
                {'error': f'Cannot remind: request status is {feedback_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send reminder via notification service
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_feedback_reminder(feedback_request)
        
        feedback_request.reminder_sent_at = timezone.now()
        feedback_request.save()
        
        return Response({'message': 'Reminder sent successfully'})


class FeedbackResponseViewSet(BaseReviewViewSet):
    """
    ViewSet for Feedback Responses.
    
    Actions:
    - GET /feedback-responses/ - List responses
    - GET /feedback-responses/{id}/ - Get response details
    - POST /feedback-responses/submit/{request_id}/ - Submit response
    - GET /feedback-responses/for-request/{request_id}/ - Get by request
    - GET /feedback-responses/for-subject/{subject_id}/ - Get by subject
    """
    
    queryset = FeedbackResponse.objects.all()
    filterset_class = FeedbackResponseFilter
    serializer_class = FeedbackResponseSerializer
    
    def get_permissions(self):
        if self.action == 'submit':
            self.permission_classes = [CanProvideFeedback]
        else:
            self.permission_classes = [CanViewFeedbackSummary]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], url_path='submit/(?P<request_id>[^/.]+)')
    def submit(self, request, request_id=None):
        """
        Submit feedback response for a request.
        """
        try:
            feedback_request = FeedbackRequest.objects.get(id=request_id)
        except FeedbackRequest.DoesNotExist:
            return Response(
                {'error': 'Feedback request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is the reviewer
        if feedback_request.reviewer != request.user:
            return Response(
                {'error': 'You are not authorized to respond to this feedback request'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already submitted
        if feedback_request.status == 'completed':
            return Response(
                {'error': 'Feedback already submitted for this request'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check deadline
        if feedback_request.due_date and feedback_request.due_date < timezone.now().date():
            return Response(
                {'error': 'Feedback deadline has passed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FeedbackResponseSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Create response
        response = FeedbackResponse.objects.create(
            feedback_request=feedback_request,
            overall_rating=data.get('overall_rating'),
            strengths=data.get('strengths', ''),
            areas_for_improvement=data.get('areas_for_improvement', ''),
            specific_examples=data.get('specific_examples', ''),
            suggestions=data.get('suggestions', ''),
            additional_comments=data.get('additional_comments', ''),
            ratings=data.get('ratings', {}),
            is_anonymous=feedback_request.is_anonymous
        )
        
        # Update request status
        feedback_request.status = 'completed'
        feedback_request.completed_at = timezone.now()
        feedback_request.save()
        
        # Generate summary if all required feedback is collected
        pending = FeedbackRequest.objects.filter(
            review_cycle=feedback_request.review_cycle,
            subject=feedback_request.subject,
            is_required=True,
            status='pending'
        ).count()
        
        if pending == 0:
            SummaryService.generate_summary(
                feedback_request.review_cycle.id,
                feedback_request.subject.id
            )
        
        result_serializer = self.get_serializer(response)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='for-request/(?P<request_id>[^/.]+)')
    def for_request(self, request, request_id=None):
        """
        Get response for a specific feedback request.
        """
        try:
            feedback_request = FeedbackRequest.objects.get(id=request_id)
        except FeedbackRequest.DoesNotExist:
            return Response(
                {'error': 'Feedback request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if request.user.role not in ['admin', 'hr'] and request.user != feedback_request.reviewer:
            return Response(
                {'error': 'You do not have permission to view this response'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        response = self.get_queryset().filter(feedback_request=feedback_request).first()
        
        if not response:
            return Response(
                {'message': 'No response found for this request'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(response)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-subject/(?P<subject_id>[^/.]+)')
    def for_subject(self, request, subject_id=None):
        """
        Get all responses for a subject (anonymized for non-HR).
        """
        from apps.accounts.models import User
        
        try:
            subject = User.objects.get(id=subject_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Subject not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        is_hr_or_admin = request.user.role in ['admin', 'hr']
        
        responses = self.get_queryset().filter(
            feedback_request__subject=subject
        ).select_related('feedback_request')
        
        if not is_hr_or_admin:
            # Anonymize responses for non-HR users
            anonymized = []
            for response in responses:
                anonymized.append({
                    'reviewer_type': response.feedback_request.get_reviewer_type_display(),
                    'overall_rating': response.overall_rating,
                    'strengths': response.strengths,
                    'areas_for_improvement': response.areas_for_improvement,
                    'suggestions': response.suggestions
                })
            return Response({'responses': anonymized})
        
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data)


class FeedbackSummaryViewSet(BaseReadOnlyViewSet):
    """
    ViewSet for Feedback Summaries (read-only).
    
    Actions:
    - GET /feedback-summaries/ - List summaries
    - GET /feedback-summaries/{id}/ - Get summary details
    - GET /feedback-summaries/my/ - Get my summary
    - GET /feedback-summaries/for-cycle/{cycle_id}/ - Get by cycle
    - POST /feedback-summaries/{id}/share/ - Share summary with subject
    """
    
    queryset = FeedbackSummary.objects.all()
    filterset_class = FeedbackSummaryFilter
    serializer_class = FeedbackSummarySerializer
    
    def get_permissions(self):
        if self.action == 'share':
            self.permission_classes = [CanManageFeedbackRequests]
        else:
            self.permission_classes = [CanViewFeedbackSummary]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Get feedback summary for the current user.
        """
        employee = request.user
        
        # Find the most recent completed cycle
        cycle = ReviewCycle.objects.filter(
            tenant=employee.tenant,
            status__in=['completed', 'archived']
        ).order_by('-end_date').first()
        
        if not cycle:
            return Response(
                {'message': 'No completed review cycle found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        summary = self.get_queryset().filter(
            review_cycle=cycle,
            subject=employee
        ).first()
        
        if not summary:
            return Response(
                {'message': 'No feedback summary found for the latest cycle'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(summary)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        """
        Get all feedback summaries for a specific cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        summaries = self.get_queryset().filter(review_cycle=cycle)
        serializer = self.get_serializer(summaries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Share feedback summary with the subject.
        """
        summary = self.get_object()
        
        if summary.is_shared_with_subject:
            return Response(
                {'error': 'Summary has already been shared'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FeedbackSummaryShareSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        summary.is_shared_with_subject = True
        summary.shared_at = timezone.now()
        summary.shared_by = request.user
        summary.save()
        
        # Notify subject
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_feedback_summary_shared(summary)
        
        result_serializer = self.get_serializer(summary)
        return Response(result_serializer.data)