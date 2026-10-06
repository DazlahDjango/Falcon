from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import SupervisorReview, ReviewCycle, SelfAssessment
from apps.reviews.services.assessment.supervisor_review_service import SupervisorReviewService
from apps.reviews.services.assessment.final_rating_service import FinalRatingService
from apps.reviews.api.v1.serializers import SupervisorReviewSerializer, SupervisorReviewDetailSerializer, SupervisorReviewSubmitSerializer, SupervisorReviewApproveSerializer
from .base_views import BaseReviewViewSet
from apps.reviews.api.v1.permissions import IsAdminOnly
from apps.accounts.constants import UserRoles



class SupervisorReviewViewSet(BaseReviewViewSet):
    queryset = SupervisorReview.objects.all()

    def get_queryset(self):
        qs = super().get_queryset().select_related('employee', 'supervisor', 'review_cycle', 'self_assessment')
        user = self.request.user
        if not user or not user.is_authenticated:
            return qs.none()

        params = getattr(self.request, 'query_params', getattr(self.request, 'GET', {}))
        scope = params.get('scope')
        is_team = params.get('is_team') in ['true', '1', True]

        # 1. Staff users can ONLY see appraisals where they are the employee
        if user.role in [UserRoles.STAFF, UserRoles.READ_ONLY] or (user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE, UserRoles.SUPERVISOR]):
            qs = qs.filter(employee=user)
        # 2. HR Admin / Client Admin / Super Admin: Whole organization oversight, or personal if scope == 'my'
        elif user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            if scope == 'my':
                qs = qs.filter(employee=user)
        # 3. Manager / Supervisor: Sees direct reports and supervised reviews, or personal if scope == 'my'
        elif user.role == UserRoles.SUPERVISOR:
            if scope == 'my':
                qs = qs.filter(employee=user)
            else:
                direct_reports = getattr(user, 'direct_reports', None)
                if direct_reports and hasattr(direct_reports, 'all') and direct_reports.all().exists():
                    qs = qs.filter(models.Q(supervisor=user) | models.Q(employee__in=direct_reports.all()))
                else:
                    qs = qs.filter(supervisor=user)
        # 4. Executive / CEO: Direct reports leadership queue or company oversight
        elif user.role == UserRoles.EXECUTIVE:
            if scope == 'my':
                qs = qs.filter(employee=user)
            elif is_team or scope == 'team':
                direct_reports = getattr(user, 'direct_reports', None)
                if direct_reports and hasattr(direct_reports, 'all') and direct_reports.all().exists():
                    qs = qs.filter(models.Q(supervisor=user) | models.Q(employee__in=direct_reports.all()))
                else:
                    qs = qs.filter(supervisor=user)

        # Filters
        cycle_id = params.get('cycle_id') or params.get('review_cycle')
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        status_param = params.get('status')
        if status_param and status_param != 'all':
            qs = qs.filter(status=status_param)

        return qs

    def get_serializer_class(self):
        return SupervisorReviewDetailSerializer if self.action == 'retrieve' else SupervisorReviewSerializer
    def get_permissions(self):
        if self.action in ['approve', 'reject', 'request_changes', 'request_changes_hyphen', 'reset_to_draft', 'reset_to_draft_hyphen']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()

    def get_object(self):
        pk = self.kwargs.get(self.lookup_field or 'pk')
        try:
            return super().get_object()
        except Exception:
            obj = self.get_queryset().filter(employee_id=pk).first()
            if obj:
                return obj
            raise

    def perform_create(self, serializer):
        cycle = serializer.validated_data.get('review_cycle')
        if not cycle:
            cycle = ReviewCycle.objects.filter(tenant_id=self.request.user.tenant_id, is_deleted=False).order_by('-end_date').first()
            serializer.save(supervisor=self.request.user, review_cycle=cycle, tenant_id=self.request.user.tenant_id)
        else:
            serializer.save(supervisor=self.request.user, tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        review = self.get_object()
        if review.status != 'draft':
            return Response({'error': f'Cannot submit with status: {review.status}'}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.now().date() > review.review_cycle.supervisor_review_deadline:
            return Response({'error': f'Deadline passed: {review.review_cycle.supervisor_review_deadline}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SupervisorReviewSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review.status = 'submitted'
        review.submitted_at = timezone.now()
        review.save()
        return Response(self.get_serializer(review).data)
    @action(detail=True, methods=['post'], url_path='save-draft')
    def save_draft_hyphen(self, request, pk=None):
        return self.save_draft(request, pk)

    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        review = self.get_object()
        updatable = ['overall_comment', 'performance_summary', 'strengths_observed', 'development_areas', 'achievements_recognized', 'career_progression_notes', 'training_recommendations', 'goals_for_next_period', 'recommendation', 'promotion_readiness', 'promotion_target_role', 'promotion_timeline', 'bonus_recommendation', 'bonus_percentage', 'override_kpi_score', 'override_reason']
        for field in updatable:
            if field in request.data:
                val = request.data[field]
                if field == 'promotion_readiness':
                    val = bool(val in [True, 'true', 'True', 'ready_now', 'ready', 'yes', '1', 1])
                setattr(review, field, val)
        review.save()

        if 'competency_ratings' in request.data and isinstance(request.data['competency_ratings'], list):
            from apps.reviews.models import Competency, CompetencyRating
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(SupervisorReview)
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
                            comp = Competency.objects.filter(name__iexact=comp_name, tenant_id=review.tenant_id).first() or Competency.objects.filter(name__iexact=comp_name).first()
                    
                    if comp:
                        CompetencyRating.objects.update_or_create(
                            content_type=ct,
                            object_id=str(review.id),
                            competency=comp,
                            defaults={
                                'raw_score': score,
                                'comment': comment or '',
                                'tenant_id': review.tenant_id
                            }
                        )

        return Response(SupervisorReviewDetailSerializer(review).data)
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        review = self.get_object()
        if review.status != 'submitted':
            return Response({'error': f'Cannot approve with status: {review.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SupervisorReviewApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review.status = 'approved'
        review.reviewed_at = timezone.now()
        review.reviewed_by = request.user
        review.save()
        FinalRatingService.create_or_update_from_review(review.id)
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_review_approved(review)
        return Response(self.get_serializer(review).data)
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        review = self.get_object()
        if review.status != 'submitted':
            return Response({'error': f'Cannot reject with status: {review.status}'}, status=status.HTTP_400_BAD_REQUEST)
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Reason required'}, status=status.HTTP_400_BAD_REQUEST)
        review.status = 'rejected'
        review.rejection_reason = reason
        review.reviewed_at = timezone.now()
        review.reviewed_by = request.user
        review.save()
        if review.self_assessment:
            review.self_assessment.status = 'draft'
            review.self_assessment.save()
        return Response(self.get_serializer(review).data)
    @action(detail=True, methods=['post'], url_path='request-changes')
    def request_changes_hyphen(self, request, pk=None):
        return self.request_changes(request, pk)

    @action(detail=True, methods=['post'])
    def request_changes(self, request, pk=None):
        review = self.get_object()
        if review.status not in ['submitted', 'approved']:
            return Response({'error': f'Cannot request changes with status: {review.status}'}, status=status.HTTP_400_BAD_REQUEST)
        feedback = request.data.get('feedback')
        if not feedback:
            return Response({'error': 'Feedback required'}, status=status.HTTP_400_BAD_REQUEST)
        review.status = 'draft'
        review.rejection_reason = feedback
        review.save()
        return Response(self.get_serializer(review).data)
    @action(detail=True, methods=['post'], url_path='reset-to-draft')
    def reset_to_draft_hyphen(self, request, pk=None):
        return self.reset_to_draft(request, pk)

    @action(detail=True, methods=['post'])
    def reset_to_draft(self, request, pk=None):
        review = self.get_object()
        if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        review.status = 'draft'
        review.submitted_at = None
        review.reviewed_at = None
        review.reviewed_by = None
        review.save()
        return Response(self.get_serializer(review).data)
    @action(detail=False, methods=['get'], url_path='my-queue')
    def my_queue(self, request):
        if request.user.role not in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.HR_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Auto-create / link SupervisorReviews for submitted self-assessments in active cycles for this tenant
        try:
            active_cycles = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, is_deleted=False)
            submitted_sas = SelfAssessment.objects.filter(review_cycle__in=active_cycles, status='submitted')
            for sa in submitted_sas:
                manager = getattr(sa.employee, 'manager', None) or getattr(sa.employee, 'supervisor', None) or request.user
                SupervisorReview.objects.get_or_create(
                    employee=sa.employee,
                    review_cycle=sa.review_cycle,
                    defaults={
                        'supervisor': manager,
                        'self_assessment': sa,
                        'status': 'draft',
                        'tenant_id': sa.tenant_id
                    }
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Error syncing supervisor review queue: {e}")

        if request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
            reviews = self.get_queryset().exclude(status__in=['approved', 'rejected', 'archived', 'cancelled']).select_related('employee', 'review_cycle', 'self_assessment')
        else:
            direct_reports = getattr(request.user, 'direct_reports', None)
            if direct_reports and hasattr(direct_reports, 'all') and direct_reports.all().exists():
                reviews = self.get_queryset().filter(employee__in=direct_reports.all()).exclude(status__in=['approved', 'rejected', 'archived', 'cancelled']).select_related('employee', 'review_cycle', 'self_assessment')
            else:
                reviews = self.get_queryset().filter(supervisor=request.user).exclude(status__in=['approved', 'rejected', 'archived', 'cancelled']).select_related('employee', 'review_cycle', 'self_assessment')
        return Response(self.get_serializer(reviews, many=True).data)
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            reviews = self.get_queryset().filter(review_cycle=cycle)
            return Response(self.get_serializer(reviews, many=True).data)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'], url_path='for-employee/(?P<employee_id>[^/.]+)')
    def for_employee(self, request, employee_id=None):
        from apps.accounts.models import User
        try:
            employee = User.objects.get(id=employee_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN] and request.user != employee.manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            cycle_id = request.query_params.get('cycle_id')
            if cycle_id:
                cycle = ReviewCycle.objects.filter(id=cycle_id).first()
            else:
                cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, is_deleted=False).order_by('-end_date').first()
            review = None
            if cycle:
                review = self.get_queryset().filter(review_cycle=cycle, employee=employee).first()
            if not review:
                review = self.get_queryset().filter(employee=employee).first()
            return Response(self.get_serializer(review).data if review else {'message': 'No review found'})
        except User.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['get'], url_path='compare')
    def compare(self, request, pk=None):
        review = self.get_object()
        if not review.self_assessment:
            return Response({'error': 'No self assessment available'}, status=status.HTTP_404_NOT_FOUND)
        from apps.reviews.services.aggregation.competency_aggregator import CompetencyAggregator
        comparison = CompetencyAggregator.get_rating_gap_analysis(review.self_assessment, review)
        return Response(comparison)
    @action(detail=False, methods=['get'])
    def stats(self, request):
        cycle_id = request.query_params.get('cycle_id')
        if not cycle_id:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, is_deleted=False).order_by('-end_date').first()
            if not cycle:
                return Response({'total_employees': 0, 'completed': 0, 'pending': 0, 'percentage': 0})
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        total = cycle.get_participating_employees().count()
        completed = self.get_queryset().filter(review_cycle=cycle, status='approved').count()
        return Response({'total_employees': total, 'completed': completed, 'pending': total - completed, 'percentage': round((completed / total) * 100, 1) if total > 0 else 0})
    @action(detail=False, methods=['get'], url_path='pending_approvals')
    def pending_approvals(self, request):
        if request.user.role not in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE, UserRoles.SUPERVISOR]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.HR_ADMIN]:
            reviews = self.get_queryset().filter(status='submitted').select_related('employee', 'supervisor', 'review_cycle')
        else:
            direct_reports = getattr(request.user, 'direct_reports', None)
            if direct_reports and hasattr(direct_reports, 'all') and direct_reports.all().exists():
                reviews = self.get_queryset().filter(status='submitted', employee__in=direct_reports.all()).select_related('employee', 'supervisor', 'review_cycle')
            else:
                reviews = self.get_queryset().filter(status='submitted', supervisor=request.user).select_related('employee', 'supervisor', 'review_cycle')
        return Response(self.get_serializer(reviews, many=True).data)
    @action(detail=False, methods=['get'], url_path='pending-approvals')
    def pending_approvals_hyphen(self, request):
        return self.pending_approvals(request)