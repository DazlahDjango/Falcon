from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import FeedbackRequest, FeedbackResponse, FeedbackSummary, ReviewCycle
from apps.reviews.services.feedback.feedback_service import FeedbackService
from apps.reviews.services.feedback.summary_service import SummaryService
from apps.reviews.api.v1.serializers import FeedbackRequestSerializer, FeedbackRequestCreateSerializer, FeedbackResponseSerializer, FeedbackResponseSubmitSerializer, FeedbackSummarySerializer, FeedbackSummaryShareSerializer
from .base_views import BaseReviewViewSet, BaseReadOnlyReviewViewSet
from apps.accounts.constants import UserRoles
from apps.reviews.api.v1.permissions.base_permissions import IsAuthenticated, IsAdminOnly, IsSupervisorOrAdmin

class FeedbackRequestViewSet(BaseReviewViewSet):
    queryset = FeedbackRequest.objects.all()
    def get_serializer_class(self):
        return FeedbackRequestCreateSerializer if self.action == 'create' else FeedbackRequestSerializer
    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [IsSupervisorOrAdmin]
        elif self.action in ['update', 'partial_update', 'destroy', 'remind', 'cancel']:
            self.permission_classes = [IsAdminOnly]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user, tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def remind(self, request, pk=None):
        req = self.get_object()
        if req.status != 'draft':
            return Response({'error': f'Cannot remind: status is {req.status}'}, status=status.HTTP_400_BAD_REQUEST)
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_feedback_reminder(req)
        req.reminder_sent_at = timezone.now()
        req.save()
        return Response({'message': 'Reminder sent'})
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        req = self.get_object()
        if req.status != 'draft':
            return Response({'error': f'Cannot cancel: status is {req.status}'}, status=status.HTTP_400_BAD_REQUEST)
        req.status = 'cancelled'
        req.save()
        return Response(self.get_serializer(req).data)
    @action(detail=False, methods=['get'])
    def pending(self, request):
        requests = self.get_queryset().filter(reviewer=request.user, status='draft').select_related('subject', 'review_cycle')
        return Response(self.get_serializer(requests, many=True).data)
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        requests = self.get_queryset().filter(reviewer=request.user, status='draft', due_date__lt=timezone.now().date())
        return Response(self.get_serializer(requests, many=True).data)
    @action(detail=False, methods=['get'], url_path='for-subject/(?P<subject_id>[^/.]+)')
    def for_subject(self, request, subject_id=None):
        from apps.accounts.models import User
        try:
            subject = User.objects.get(id=subject_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and request.user != subject.manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            requests = self.get_queryset().filter(subject=subject)
            return Response(self.get_serializer(requests, many=True).data)
        except User.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            requests = self.get_queryset().filter(review_cycle=cycle)
            return Response(self.get_serializer(requests, many=True).data)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        reviewers = request.data.get('reviewers', [])
        subject_id = request.data.get('subject_id')
        cycle_id = request.data.get('cycle_id')
        reviewer_type = request.data.get('reviewer_type', 'peer')
        due_date = request.data.get('due_date')
        if not reviewers or not subject_id or not cycle_id:
            return Response({'error': 'reviewers, subject_id, and cycle_id required'}, status=status.HTTP_400_BAD_REQUEST)
        from apps.accounts.models import User
        try:
            subject = User.objects.get(id=subject_id)
            cycle = ReviewCycle.objects.get(id=cycle_id)
            created = []
            for reviewer_id in reviewers:
                reviewer = User.objects.get(id=reviewer_id)
                req, created_flag = FeedbackRequest.objects.get_or_create(review_cycle=cycle, subject=subject, reviewer=reviewer, defaults={'requested_by': request.user, 'reviewer_type': reviewer_type, 'due_date': due_date, 'tenant_id': request.user.tenant_id})
                if created_flag:
                    created.append(req)
            return Response(self.get_serializer(created, many=True).data, status=status.HTTP_201_CREATED)
        except (User.DoesNotExist, ReviewCycle.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

class FeedbackResponseViewSet(BaseReviewViewSet):
    queryset = FeedbackResponse.objects.all()
    serializer_class = FeedbackResponseSerializer
    def get_permissions(self):
        self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    @action(detail=False, methods=['post'], url_path='submit/(?P<request_id>[^/.]+)')
    def submit(self, request, request_id=None):
        try:
            feedback_request = FeedbackRequest.objects.get(id=request_id)
            if feedback_request.reviewer_id != request.user.id:
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            if feedback_request.status != 'draft':
                return Response({'error': 'Already submitted'}, status=status.HTTP_400_BAD_REQUEST)
            if feedback_request.due_date and feedback_request.due_date < timezone.now().date():
                return Response({'error': 'Deadline passed'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = FeedbackResponseSubmitSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            response = FeedbackResponse.objects.create(feedback_request=feedback_request, overall_rating=data.get('overall_rating'), strengths=data.get('strengths', ''), areas_for_improvement=data.get('areas_for_improvement', ''), specific_examples=data.get('specific_examples', ''), suggestions=data.get('suggestions', ''), additional_comments=data.get('additional_comments', ''), ratings=data.get('ratings', {}), is_anonymous=feedback_request.is_anonymous, tenant_id=request.user.tenant_id)
            feedback_request.status = 'submitted'
            feedback_request.completed_at = timezone.now()
            feedback_request.save()
            pending = FeedbackRequest.objects.filter(review_cycle=feedback_request.review_cycle, subject=feedback_request.subject, is_required=True, status='draft').count()
            if pending == 0:
                SummaryService.generate_summary(feedback_request.review_cycle.id, feedback_request.subject.id)
            return Response(self.get_serializer(response).data, status=status.HTTP_201_CREATED)
        except FeedbackRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'], url_path='for-request/(?P<request_id>[^/.]+)')
    def for_request(self, request, request_id=None):
        try:
            feedback_request = FeedbackRequest.objects.get(id=request_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and request.user != feedback_request.reviewer and request.user != feedback_request.subject.manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            response = self.get_queryset().filter(feedback_request=feedback_request).first()
            return Response(self.get_serializer(response).data if response else {'message': 'No response yet'})
        except FeedbackRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'], url_path='for-subject/(?P<subject_id>[^/.]+)')
    def for_subject(self, request, subject_id=None):
        from apps.accounts.models import User
        try:
            subject = User.objects.get(id=subject_id)
            is_hr = request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]
            responses = self.get_queryset().filter(feedback_request__subject=subject).select_related('feedback_request')
            if not is_hr:
                anonymized = [{'reviewer_type': r.feedback_request.get_reviewer_type_display(), 'overall_rating': r.overall_rating, 'strengths': r.strengths, 'areas_for_improvement': r.areas_for_improvement, 'suggestions': r.suggestions} for r in responses]
                return Response({'responses': anonymized})
            return Response(self.get_serializer(responses, many=True).data)
        except User.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

class FeedbackSummaryViewSet(BaseReadOnlyReviewViewSet):
    queryset = FeedbackSummary.objects.all()
    serializer_class = FeedbackSummarySerializer
    def get_permissions(self):
        if self.action == 'share':
            self.permission_classes = [IsAdminOnly]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    @action(detail=False, methods=['get'])
    def my(self, request):
        cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status__in=['completed', 'archived']).order_by('-end_date').first()
        if not cycle:
            return Response({'message': 'No completed cycle found'}, status=status.HTTP_200_OK)
        summary = self.get_queryset().filter(review_cycle=cycle, subject=request.user).first()
        return Response(self.get_serializer(summary).data if summary else {'message': 'No summary available'})
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            summaries = self.get_queryset().filter(review_cycle=cycle)
            return Response(self.get_serializer(summaries, many=True).data)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        summary = self.get_object()
        if summary.is_shared_with_subject:
            return Response({'error': 'Already shared'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = FeedbackSummaryShareSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        summary.is_shared_with_subject = True
        summary.shared_at = timezone.now()
        summary.shared_by = request.user
        summary.save()
        return Response(self.get_serializer(summary).data)
    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        summary = self.get_object()
        SummaryService.generate_summary(summary.review_cycle.id, summary.subject.id)
        return Response({'message': 'Summary regenerated'})