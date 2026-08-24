from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import PIP, PIPAction, PIPReview, FinalRating
from apps.reviews.services.pip.pip_service import PIPService
from apps.reviews.services.pip.pip_generator import PIPGenerator
from apps.reviews.services.pip.pip_tracker import PIPTracker
from apps.reviews.services.reporting.pip_report_service import PIPReportService
from apps.reviews.api.v1.serializers import PIPSerializer, PIPListSerializer, PIPDetailSerializer, PIPCreateSerializer, PIPActionSerializer, PIPActionCompleteSerializer, PIPReviewSerializer, PIPApproveSerializer, PIPExtendSerializer
from .base_views import BaseReviewViewSet
from ..permissions import IsAdminOrManager, IsAdminOnly
from apps.accounts.constants import UserRoles

class PIPViewSet(BaseReviewViewSet):
    queryset = PIP.objects.all()
    def get_serializer_class(self):
        if self.action == 'list':
            return PIPListSerializer
        elif self.action == 'retrieve':
            return PIPDetailSerializer
        elif self.action == 'create':
            return PIPCreateSerializer
        return PIPSerializer
    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [IsAdminOrManager]
        elif self.action in ['approve', 'extend', 'complete', 'cancel']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        pip = self.get_object()
        if pip.status != 'draft':
            return Response({'error': f'Cannot approve with status: {pip.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PIPApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pip.status = 'submitted'
        pip.manager_signed_at = timezone.now()
        pip.save()
        return Response(self.get_serializer(pip).data)
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        pip = self.get_object()
        if pip.status != 'submitted':
            return Response({'error': f'Cannot start with status: {pip.status}'}, status=status.HTTP_400_BAD_REQUEST)
        pip.status = 'submitted'
        pip.employee_acknowledged_at = timezone.now()
        pip.save()
        return Response(self.get_serializer(pip).data)
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        pip = self.get_object()
        if pip.status not in ['draft', 'submitted']:
            return Response({'error': f'Cannot extend with status: {pip.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PIPExtendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pip.extended_to_date = serializer.validated_data['new_end_date']
        pip.extension_reason = serializer.validated_data['reason']
        pip.save()
        return Response(self.get_serializer(pip).data)
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        pip = self.get_object()
        if pip.status not in ['draft', 'submitted']:
            return Response({'error': f'Cannot complete with status: {pip.status}'}, status=status.HTTP_400_BAD_REQUEST)
        outcome = request.data.get('outcome')
        notes = request.data.get('notes', '')
        if outcome not in ['successful', 'failed', 'extended', 'terminated', 'resigned']:
            return Response({'error': 'outcome must be successful, failed, extended, terminated, or resigned'}, status=status.HTTP_400_BAD_REQUEST)
        pip.status = 'completed'
        pip.outcome = outcome
        pip.outcome_notes = notes
        pip.completed_at = timezone.now()
        pip.save()
        return Response(self.get_serializer(pip).data)
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        pip = self.get_object()
        if pip.status not in ['draft', 'submitted']:
            return Response({'error': f'Cannot cancel with status: {pip.status}'}, status=status.HTTP_400_BAD_REQUEST)
        pip.status = 'cancelled'
        pip.save()
        return Response(self.get_serializer(pip).data)
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        pip = self.get_object()
        progress = PIPTracker.get_pip_progress(pip.id)
        return Response(progress)
    @action(detail=True, methods=['post'])
    def add_action(self, request, pk=None):
        pip = self.get_object()
        action_data = request.data
        action = PIPAction.objects.create(pip=pip, title=action_data.get('title'), description=action_data.get('description', ''), priority=action_data.get('priority', 'medium'), due_date=action_data.get('due_date'), requires_evidence=action_data.get('requires_evidence', False))
        return Response(PIPActionSerializer(action).data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['post'], url_path='actions/(?P<action_id>[^/.]+)/complete')
    def complete_action(self, request, pk=None, action_id=None):
        pip = self.get_object()
        try:
            action = pip.actions.get(id=action_id)
            if action.status == 'completed':
                return Response({'error': 'Action already completed'}, status=status.HTTP_400_BAD_REQUEST)
            action.status = 'completed'
            action.completed_at = timezone.now()
            if request.data.get('notes'):
                action.progress_notes = request.data['notes']
            if request.data.get('evidence'):
                action.evidence = request.data['evidence']
            action.save()
            return Response(PIPActionSerializer(action).data)
        except PIPAction.DoesNotExist:
            return Response({'error': 'Action not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['post'], url_path='actions/(?P<action_id>[^/.]+)/verify')
    def verify_action(self, request, pk=None, action_id=None):
        pip = self.get_object()
        try:
            action = pip.actions.get(id=action_id)
            if action.status != 'completed':
                return Response({'error': 'Action must be completed first'}, status=status.HTTP_400_BAD_REQUEST)
            if not action.requires_evidence:
                return Response({'error': 'This action does not require verification'}, status=status.HTTP_400_BAD_REQUEST)
            action.evidence_verified_by = request.user
            action.evidence_verified_at = timezone.now()
            action.save()
            return Response(PIPActionSerializer(action).data)
        except PIPAction.DoesNotExist:
            return Response({'error': 'Action not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        pip = self.get_object()
        review = PIPReview.objects.create(pip=pip, reviewer=request.user, employee_id=request.data.get('employee_id'), review_date=request.data.get('review_date', timezone.now().date()), rating=request.data.get('rating'), summary=request.data.get('summary'), accomplishments=request.data.get('accomplishments', ''), challenges=request.data.get('challenges', ''), action_items=request.data.get('action_items', ''), employee_attended=request.data.get('employee_attended', True), employee_signature=request.data.get('employee_signature', False))
        return Response(PIPReviewSerializer(review).data, status=status.HTTP_201_CREATED)
    @action(detail=False, methods=['get'])
    def my(self, request):
        pips = self.get_queryset().filter(employee=request.user)
        return Response(self.get_serializer(pips, many=True).data)
    @action(detail=False, methods=['get'])
    def managing(self, request):
        pips = self.get_queryset().filter(owner=request.user)
        return Response(self.get_serializer(pips, many=True).data)
    @action(detail=False, methods=['get'])
    def active(self, request):
        pips = self.get_queryset().filter(status__in=['draft', 'submitted'])
        return Response(self.get_serializer(pips, many=True).data)
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        pips = self.get_queryset().filter(status__in=['draft', 'submitted'], end_date__lt=timezone.now().date())
        return Response(self.get_serializer(pips, many=True).data)
    @action(detail=False, methods=['get'], url_path='for-employee/(?P<employee_id>[^/.]+)')
    def for_employee(self, request, employee_id=None):
        from apps.accounts.models import User
        try:
            employee = User.objects.get(id=employee_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and request.user != employee.manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            pips = self.get_queryset().filter(employee=employee)
            return Response(self.get_serializer(pips, many=True).data)
        except User.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'])
    def team(self, request):
        if request.user.role not in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        direct_reports = request.user.direct_reports.all()
        pips = self.get_queryset().filter(employee__in=direct_reports)
        return Response(self.get_serializer(pips, many=True).data)
    @action(detail=False, methods=['post'], url_path='generate-from-rating/(?P<rating_id>[^/.]+)')
    def generate_from_rating(self, request, rating_id=None):
        try:
            rating = FinalRating.objects.get(id=rating_id)
            if rating.final_score and rating.final_score >= 60:
                return Response({'error': 'Score is above 60%, PIP not needed'}, status=status.HTTP_400_BAD_REQUEST)
            pip = PIPGenerator.generate_pip_from_rating(rating_id)
            return Response(self.get_serializer(pip).data if pip else {'error': 'Could not generate PIP'}, status=status.HTTP_201_CREATED if pip else status.HTTP_400_BAD_REQUEST)
        except FinalRating.DoesNotExist:
            return Response({'error': 'Rating not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get', 'post'])
    def report(self, request):
        from apps.tenant.models import Organization
        try:
            tenant = Organization.objects.get(id=request.user.tenant_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)
        report = PIPReportService.get_organization_pip_summary(tenant)
        return Response(report)
    @action(detail=True, methods=['get'])
    def full_report(self, request, pk=None):
        pip = self.get_object()
        report = PIPReportService.get_pip_details(pip.id)
        return Response(report)
    @action(detail=False, methods=['get'])
    def trends(self, request):
        from apps.tenant.models import Organization
        tenant = Organization.objects.get(id=request.user.tenant_id)
        months = int(request.query_params.get('months', 6))
        trends = PIPReportService.get_pip_trends(tenant, months)
        return Response(trends)

from ..permissions import IsAdminOrManager, IsAdminOnly, IsSupervisorOrAdmin, IsAuthenticated

class PIPActionViewSet(BaseReviewViewSet):
    queryset = PIPAction.objects.all()
    serializer_class = PIPActionSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'complete', 'verify']:
            self.permission_classes = [IsSupervisorOrAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        action = self.get_object()
        if action.status == 'completed':
            return Response({'error': 'Action already completed'}, status=status.HTTP_400_BAD_REQUEST)
        action.status = 'completed'
        action.completed_at = timezone.now()
        if request.data.get('notes'):
            action.progress_notes = request.data['notes']
        if request.data.get('evidence'):
            action.evidence = request.data['evidence']
        action.save()
        return Response(self.get_serializer(action).data)
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        action = self.get_object()
        if action.status != 'completed':
            return Response({'error': 'Action must be completed first'}, status=status.HTTP_400_BAD_REQUEST)
        if not action.requires_evidence:
            return Response({'error': 'This action does not require verification'}, status=status.HTTP_400_BAD_REQUEST)
        action.evidence_verified_by = request.user
        action.evidence_verified_at = timezone.now()
        action.save()
        return Response(self.get_serializer(action).data)
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        action = self.get_object()
        if action.status != 'completed':
            return Response({'error': 'Only completed actions can be reopened'}, status=status.HTTP_400_BAD_REQUEST)
        action.status = 'pending'
        action.completed_at = None
        action.evidence_verified_by = None
        action.evidence_verified_at = None
        action.save()
        return Response(self.get_serializer(action).data)
    @action(detail=False, methods=['get'], url_path='for-pip/(?P<pip_id>[^/.]+)')
    def for_pip(self, request, pip_id=None):
        try:
            pip = PIP.objects.get(id=pip_id)
            actions = self.get_queryset().filter(pip=pip)
            return Response(self.get_serializer(actions, many=True).data)
        except PIP.DoesNotExist:
            return Response({'error': 'PIP not found'}, status=status.HTTP_404_NOT_FOUND)

class PIPReviewViewSet(BaseReviewViewSet):
    queryset = PIPReview.objects.all()
    serializer_class = PIPReviewSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSupervisorOrAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
    @action(detail=False, methods=['get'], url_path='for-pip/(?P<pip_id>[^/.]+)')
    def for_pip(self, request, pip_id=None):
        try:
            pip = PIP.objects.get(id=pip_id)
            reviews = self.get_queryset().filter(pip=pip)
            return Response(self.get_serializer(reviews, many=True).data)
        except PIP.DoesNotExist:
            return Response({'error': 'PIP not found'}, status=status.HTTP_404_NOT_FOUND)