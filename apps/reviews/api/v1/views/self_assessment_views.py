from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import SelfAssessment, ReviewCycle, SupervisorReview
from apps.reviews.services.cycle.cycle_service import CycleService
from apps.reviews.services.assessment.self_assessment_service import SelfAssessmentService
from apps.reviews.api.v1.serializers import SelfAssessmentSerializer, SelfAssessmentDetailSerializer, SelfAssessmentSubmitSerializer
from .base_views import BaseReviewViewSet
from apps.reviews.api.v1.permissions.base_permissions import IsAuthenticated, IsAdminOnly
from apps.accounts.constants import UserRoles

class SelfAssessmentViewSet(BaseReviewViewSet):
    queryset = SelfAssessment.objects.all()

    def get_queryset(self):
        qs = super().get_queryset().select_related('employee', 'review_cycle')
        user = self.request.user

        if not user or not user.is_authenticated:
            return qs.none()

        params = getattr(self.request, 'query_params', getattr(self.request, 'GET', {}))
        is_team = params.get('is_team') in ['true', '1', True]
        scope = params.get('scope')

        # 1. Staff users and read-only users can ONLY EVER see their own assessments
        if user.role in [UserRoles.STAFF, UserRoles.READ_ONLY] or scope == 'my' or (user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE, UserRoles.SUPERVISOR]):
            qs = qs.filter(employee=user)
        # 2. Managers/Supervisors
        elif user.role == UserRoles.SUPERVISOR:
            if is_team or scope == 'team':
                direct_reports = getattr(user, 'direct_reports', None)
                if direct_reports and hasattr(direct_reports, 'all'):
                    reports_qs = direct_reports.all()
                else:
                    from apps.accounts.models import User
                    reports_qs = User.objects.filter(models.Q(manager=user) | models.Q(supervisor=user))
                if reports_qs.exists():
                    qs = qs.filter(employee__in=reports_qs)
                else:
                    qs = qs.none()
            else:
                qs = qs.filter(employee=user)
        # 3. Admins / HR Admin (HR Admin sees organization-wide records, or personal if scope == 'my')
        elif user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            if scope == 'my':
                qs = qs.filter(employee=user)
            # Default or team view for HR / Admin shows company-wide submitted assessments
        # 4. Executive / CEO (Direct reports or company oversight)
        elif user.role == UserRoles.EXECUTIVE:
            if scope == 'my':
                qs = qs.filter(employee=user)
            elif is_team or scope == 'team':
                direct_reports = getattr(user, 'direct_reports', None)
                if direct_reports and hasattr(direct_reports, 'all'):
                    reports_qs = direct_reports.all()
                else:
                    from apps.accounts.models import User
                    reports_qs = User.objects.filter(models.Q(manager=user) | models.Q(supervisor=user))
                if reports_qs.exists():
                    qs = qs.filter(employee__in=reports_qs)
                else:
                    qs = qs.none()
        else:
            qs = qs.filter(employee=user)

        status_param = params.get('status')
        if status_param and status_param != 'all':
            qs = qs.filter(status=status_param)
        elif self.action == 'list' and (is_team or user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE]):
            # When admins/managers view team or tenant-wide records, exclude draft records
            if user.role != UserRoles.STAFF and scope != 'my' and not (not is_team and user.role == UserRoles.SUPERVISOR):
                qs = qs.exclude(status='draft')

        return qs

    def get_serializer_class(self):
        return SelfAssessmentDetailSerializer if self.action == 'retrieve' else SelfAssessmentSerializer
    def get_permissions(self):
        if self.action in ['reset_to_draft', 'reset_to_draft_hyphen']:
            self.permission_classes = [IsAdminOnly]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        is_admin = request.user.is_superuser or request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]
        is_owner = instance.employee_id == request.user.id and instance.status == 'draft'
        if not (is_admin or is_owner):
            return Response({'error': 'Permission denied. Only admins or draft authors can delete a self-assessment.'}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    def perform_create(self, serializer):
        serializer.save(employee=self.request.user, tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        assessment = self.get_object()
        if assessment.status == 'submitted':
            cycle = assessment.review_cycle
            if not cycle.allow_self_assessment_edit:
                return Response({'error': 'Already submitted and cannot be edited'}, status=status.HTTP_400_BAD_REQUEST)
        if assessment.review_cycle.self_assessment_deadline and timezone.now().date() > assessment.review_cycle.self_assessment_deadline:
            if not (assessment.review_cycle.allow_self_assessment_edit or request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]):
                return Response({'error': f'Deadline passed: {assessment.review_cycle.self_assessment_deadline}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SelfAssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment.status = 'submitted'
        assessment.submitted_at = timezone.now()
        assessment.save()
        supervisor = getattr(assessment.employee, 'manager', None) or getattr(assessment.employee, 'supervisor', None)
        if supervisor:
            SupervisorReview.objects.get_or_create(
                employee=assessment.employee,
                review_cycle=assessment.review_cycle,
                defaults={
                    'supervisor': supervisor,
                    'self_assessment': assessment,
                    'status': 'draft',
                    'tenant_id': assessment.tenant_id
                }
            )
        try:
            from apps.reviews.services.notification.notification_service import NotificationService
            NotificationService.notify_supervisor_review_ready(assessment)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Notification on submit failed: {e}")
        return Response(SelfAssessmentDetailSerializer(assessment).data)

    @action(detail=True, methods=['post'], url_path='save-draft')
    def save_draft_hyphen(self, request, pk=None):
        return self.save_draft(request, pk)

    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        assessment = self.get_object()
        updatable = ['overall_comment', 'strengths', 'areas_for_improvement', 'career_aspirations', 'challenges_faced', 'achievements', 'training_completed', 'training_requested', 'goals_achieved', 'goals_for_next_period']
        for field in updatable:
            if field in request.data:
                setattr(assessment, field, request.data[field])
        assessment.save()

        if 'competency_ratings' in request.data and isinstance(request.data['competency_ratings'], list):
            from apps.reviews.models import Competency, CompetencyRating
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(SelfAssessment)
            for rating_data in request.data['competency_ratings']:
                comp_id = rating_data.get('competency_id') or rating_data.get('competency')
                score = rating_data.get('raw_score') if rating_data.get('raw_score') is not None else rating_data.get('score')
                comment = rating_data.get('comment', '')
                if comp_id and score is not None:
                    comp = None
                    if str(comp_id).isdigit():
                        comp = Competency.objects.filter(id=int(comp_id)).first()
                    if not comp:
                        comp_name = rating_data.get('competency_name')
                        if comp_name:
                            comp = Competency.objects.filter(name__iexact=comp_name, tenant_id=assessment.tenant_id).first() or Competency.objects.filter(name__iexact=comp_name).first()
                    
                    if comp:
                        CompetencyRating.objects.update_or_create(
                            content_type=ct,
                            object_id=str(assessment.id),
                            competency=comp,
                            defaults={
                                'raw_score': score,
                                'comment': comment or '',
                                'tenant_id': assessment.tenant_id
                            }
                        )

        return Response(SelfAssessmentDetailSerializer(assessment).data)

    @action(detail=True, methods=['post'], url_path='reset-to-draft')
    def reset_to_draft_hyphen(self, request, pk=None):
        return self.reset_to_draft(request, pk)

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
        assessment = SelfAssessment.objects.filter(review_cycle=cycle, employee=request.user, is_deleted=False).first()
        if not assessment:
            # Check if there is an existing soft-deleted one, restore it
            assessment = SelfAssessment.objects.filter(review_cycle=cycle, employee=request.user).first()
            if assessment:
                assessment.is_deleted = False
                assessment.deleted_at = None
                assessment.save()
            else:
                assessment = SelfAssessment.objects.create(review_cycle=cycle, employee=request.user, status='draft', tenant_id=request.user.tenant_id)
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
        if not direct_reports.exists() and request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.EXECUTIVE]:
            assessments = self.get_queryset().select_related('employee', 'review_cycle')
        else:
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
    @action(detail=True, methods=['delete', 'post'], url_path='soft-delete')
    def soft_delete_hyphen(self, request, pk=None):
        return self.soft_delete(request, pk)

    @action(detail=True, methods=['delete', 'post'])
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