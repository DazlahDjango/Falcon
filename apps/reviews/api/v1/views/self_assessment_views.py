from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import SelfAssessment, ReviewCycle
from apps.reviews.services.cycle.cycle_service import CycleService
from apps.reviews.services.assessment.self_assessment_service import SelfAssessmentService
from apps.reviews.api.v1.serializers import SelfAssessmentSerializer, SelfAssessmentDetailSerializer, SelfAssessmentSubmitSerializer
from .base_views import BaseReviewViewSet
from apps.accounts.constants import UserRoles

class SelfAssessmentViewSet(BaseReviewViewSet):
    queryset = SelfAssessment.objects.all()
    def get_serializer_class(self):
        return SelfAssessmentDetailSerializer if self.action == 'retrieve' else SelfAssessmentSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'save_draft']:
            self.permission_classes = [lambda: self.request.user.role in [UserRoles.STAFF, UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]]
        elif self.action == 'submit':
            self.permission_classes = [lambda: self.request.user.role in [UserRoles.STAFF, UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(employee=self.request.user, tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        assessment = self.get_object()
        if assessment.status == 'submitted':
            cycle = assessment.review_cycle
            if not cycle.allow_self_assessment_edit:
                return Response({'error': 'Already submitted and cannot be edited'}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.now().date() > assessment.review_cycle.self_assessment_deadline:
            return Response({'error': f'Deadline passed: {assessment.review_cycle.self_assessment_deadline}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SelfAssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment.status = 'submitted'
        assessment.submitted_at = timezone.now()
        assessment.save()
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_supervisor_review_ready(assessment)
        return Response(self.get_serializer(assessment).data)
    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        assessment = self.get_object()
        updatable = ['overall_comment', 'strengths', 'areas_for_improvement', 'career_aspirations', 'challenges_faced', 'achievements', 'training_completed', 'training_requested', 'goals_achieved', 'goals_for_next_period']
        for field in updatable:
            if field in request.data:
                setattr(assessment, field, request.data[field])
        assessment.save()
        return Response(self.get_serializer(assessment).data)
    @action(detail=True, methods=['post'])
    def reset_to_draft(self, request, pk=None):
        assessment = self.get_object()
        if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and assessment.employee_id != request.user.id:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        assessment.status = 'draft'
        assessment.submitted_at = None
        assessment.save()
        return Response(self.get_serializer(assessment).data)
    @action(detail=False, methods=['get'])
    def my(self, request):
        cycle = CycleService.get_active_cycle_for_employee(request.user)
        if not cycle:
            return Response({'message': 'No active review cycle found'}, status=status.HTTP_200_OK)
        assessment, created = SelfAssessment.objects.get_or_create(review_cycle=cycle, employee=request.user, defaults={'status': 'draft', 'tenant_id': request.user.tenant_id})
        return Response(SelfAssessmentDetailSerializer(assessment).data)
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            assessments = self.get_queryset().filter(review_cycle=cycle)
            return Response(self.get_serializer(assessments, many=True).data)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'])
    def team(self, request):
        if request.user.role not in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        direct_reports = request.user.direct_reports.all()
        assessments = self.get_queryset().filter(employee__in=direct_reports).select_related('employee', 'review_cycle')
        return Response(self.get_serializer(assessments, many=True).data)
    @action(detail=False, methods=['get'])
    def pending(self, request):
        if request.user.role in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            direct_reports = request.user.direct_reports.all()
            assessments = self.get_queryset().filter(employee__in=direct_reports, status='draft')
        else:
            assessments = self.get_queryset().filter(employee=request.user, status='draft')
        return Response(self.get_serializer(assessments, many=True).data)
    @action(detail=False, methods=['get'])
    def submitted(self, request):
        if request.user.role in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            direct_reports = request.user.direct_reports.all()
            assessments = self.get_queryset().filter(employee__in=direct_reports, status='submitted')
        else:
            assessments = self.get_queryset().filter(employee=request.user, status='submitted')
        return Response(self.get_serializer(assessments, many=True).data)
    @action(detail=False, methods=['get'])
    def stats(self, request):
        cycle_id = request.query_params.get('cycle_id')
        if not cycle_id:
            return Response({'error': 'cycle_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            stats = SelfAssessmentService.get_progress_stats(cycle)
            return Response(stats)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        assessment = self.get_object()
        if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and assessment.employee_id != request.user.id:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        assessment.deleted_at = timezone.now()
        assessment.is_deleted = True
        assessment.save()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        assessment = self.get_object()
        if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        assessment.deleted_at = None
        assessment.is_deleted = False
        assessment.save()
        return Response(self.get_serializer(assessment).data)