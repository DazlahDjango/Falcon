# apps/reviews/api/v1/views/pip_views.py
"""
Views for PIP, PIPAction, and PIPReview models
"""

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
from ..serializers import (
    PIPSerializer,
    PIPListSerializer,
    PIPDetailSerializer,
    PIPCreateSerializer,
    PIPActionSerializer,
    PIPActionCompleteSerializer,
    PIPReviewSerializer,
    PIPApproveSerializer,
    PIPExtendSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import (
    CanViewPIP,
    CanCreatePIP,
    CanManagePIP,
    CanApprovePIP,
    CanCompletePIPAction,
)
from ..filters.pip_filters import PIPFilter, PIPActionFilter


class PIPViewSet(BaseReviewViewSet):
    """
    ViewSet for Performance Improvement Plans.
    
    Actions:
    - GET /pips/ - List all PIPs
    - POST /pips/ - Create new PIP
    - GET /pips/{id}/ - Get PIP details
    - PUT /pips/{id}/ - Update PIP
    - DELETE /pips/{id}/ - Delete PIP
    - POST /pips/{id}/approve/ - Approve PIP
    - POST /pips/{id}/extend/ - Extend PIP deadline
    - POST /pips/{id}/complete/ - Complete PIP
    - GET /pips/{id}/progress/ - Get PIP progress
    - GET /pips/my/ - Get my PIPs
    - GET /pips/team/ - Get team PIPs (managers)
    - GET /pips/active/ - Get active PIPs
    - GET /pips/overdue/ - Get overdue PIPs
    - GET /pips/for-employee/{employee_id}/ - Get by employee
    - POST /pips/generate-from-rating/{rating_id}/ - Generate PIP from final rating
    - GET /pips/report/ - Get organization PIP report
    """
    
    queryset = PIP.objects.all()
    filterset_class = PIPFilter
    
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
            self.permission_classes = [CanCreatePIP]
        elif self.action in ['update', 'partial_update', 'destroy', 'extend', 'complete']:
            self.permission_classes = [CanManagePIP]
        elif self.action == 'approve':
            self.permission_classes = [CanApprovePIP]
        else:
            self.permission_classes = [CanViewPIP]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a PIP.
        """
        pip = self.get_object()
        
        if pip.status != 'draft':
            return Response(
                {'error': f'PIP cannot be approved (current status: {pip.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PIPApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        pip.status = 'active'
        pip.manager_signed_at = timezone.now()
        pip.save()
        
        result_serializer = self.get_serializer(pip)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        """
        Extend a PIP deadline.
        """
        pip = self.get_object()
        
        if pip.status != 'active':
            return Response(
                {'error': f'Only active PIPs can be extended (current status: {pip.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PIPExtendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        pip.extended_to_date = data['new_end_date']
        pip.extension_reason = data['reason']
        pip.save()
        
        result_serializer = self.get_serializer(pip)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Complete a PIP with outcome.
        """
        pip = self.get_object()
        
        if pip.status != 'active':
            return Response(
                {'error': f'Only active PIPs can be completed (current status: {pip.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        outcome = request.data.get('outcome')
        notes = request.data.get('notes', '')
        
        if outcome not in ['successful', 'failed']:
            return Response(
                {'error': 'outcome must be "successful" or "failed"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pip.status = 'completed'
        pip.outcome = outcome
        pip.outcome_notes = notes
        pip.completed_at = timezone.now()
        pip.save()
        
        result_serializer = self.get_serializer(pip)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Get detailed progress for a PIP.
        """
        pip = self.get_object()
        progress = PIPTracker.get_pip_progress(pip.id)
        return Response(progress)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Get PIPs for the current user.
        """
        employee = request.user
        
        pips = self.get_queryset().filter(employee=employee)
        serializer = self.get_serializer(pips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team(self, request):
        """
        Get PIPs for manager's team.
        """
        manager = request.user
        
        if manager.role not in ['manager', 'executive', 'admin', 'hr']:
            return Response(
                {'error': 'You do not have permission to view team PIPs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get direct reports
        direct_reports = manager.direct_reports.all()
        
        pips = self.get_queryset().filter(employee__in=direct_reports)
        serializer = self.get_serializer(pips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active PIPs.
        """
        pips = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(pips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        Get all overdue PIPs.
        """
        today = timezone.now().date()
        
        pips = self.get_queryset().filter(
            status='active',
            end_date__lt=today
        )
        
        serializer = self.get_serializer(pips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-employee/(?P<employee_id>[^/.]+)')
    def for_employee(self, request, employee_id=None):
        """
        Get PIPs for a specific employee.
        """
        from apps.accounts.models import User
        
        try:
            employee = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Employee not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if request.user.role not in ['admin', 'hr'] and request.user != employee.manager:
            return Response(
                {'error': 'You do not have permission to view these PIPs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pips = self.get_queryset().filter(employee=employee)
        serializer = self.get_serializer(pips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='generate-from-rating/(?P<rating_id>[^/.]+)')
    def generate_from_rating(self, request, rating_id=None):
        """
        Generate a PIP from a low final rating.
        """
        try:
            final_rating = FinalRating.objects.get(id=rating_id)
        except FinalRating.DoesNotExist:
            return Response(
                {'error': 'Final rating not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if request.user.role not in ['admin', 'hr', 'manager']:
            return Response(
                {'error': 'You do not have permission to generate PIPs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        custom_data = request.data.get('custom_data', None)
        owner = request.user if request.user.role in ['admin', 'hr'] else final_rating.employee.manager
        
        pip = PIPGenerator.generate_pip_from_rating(rating_id, owner, custom_data)
        
        if not pip:
            return Response(
                {'error': 'PIP could not be generated. Check if rating is below threshold or PIP already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(pip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def report(self, request):
        """
        Get organization-wide PIP report.
        """
        tenant = request.user.tenant
        
        report = PIPReportService.get_organization_pip_summary(tenant)
        return Response(report)
    
    @action(detail=True, methods=['get'])
    def full_report(self, request, pk=None):
        """
        Get detailed report for a specific PIP.
        """
        pip = self.get_object()
        report = PIPReportService.get_pip_details(pip.id)
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """
        Get PIP trends over time.
        """
        tenant = request.user.tenant
        months = int(request.query_params.get('months', 6))
        
        trends = PIPReportService.get_pip_trends(tenant, months)
        return Response(trends)


class PIPActionViewSet(BaseReviewViewSet):
    """
    ViewSet for PIP Actions.
    
    Actions:
    - GET /pip-actions/ - List all PIP actions
    - POST /pip-actions/ - Create new PIP action
    - GET /pip-actions/{id}/ - Get action details
    - PUT /pip-actions/{id}/ - Update action
    - DELETE /pip-actions/{id}/ - Delete action
    - POST /pip-actions/{id}/complete/ - Mark action as complete
    - POST /pip-actions/{id}/verify/ - Verify action evidence (manager)
    """
    
    queryset = PIPAction.objects.all()
    filterset_class = PIPActionFilter
    serializer_class = PIPActionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [CanManagePIP]
        elif self.action == 'verify':
            self.permission_classes = [CanManagePIP]
        else:
            self.permission_classes = [CanViewPIP]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a PIP action as complete.
        """
        action = self.get_object()
        
        if action.status == 'completed':
            return Response(
                {'error': 'Action is already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PIPActionCompleteSerializer(
            data=request.data,
            context={'action_id': action.id}
        )
        serializer.is_valid(raise_exception=True)
        
        action.status = 'completed'
        action.completed_at = timezone.now()
        
        if request.data.get('notes'):
            action.progress_notes = request.data['notes']
        
        if request.data.get('evidence'):
            action.evidence = request.data['evidence']
        
        action.save()
        
        result_serializer = self.get_serializer(action)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify evidence for a completed action (manager action).
        """
        action = self.get_object()
        
        if action.status != 'completed':
            return Response(
                {'error': 'Action must be completed before verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not action.requires_evidence:
            return Response(
                {'error': 'This action does not require evidence verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verified = request.data.get('verified', False)
        
        if verified:
            action.evidence_verified_by = request.user
            action.evidence_verified_at = timezone.now()
            action.save()
        
        result_serializer = self.get_serializer(action)
        return Response(result_serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-pip/(?P<pip_id>[^/.]+)')
    def for_pip(self, request, pip_id=None):
        """
        Get all actions for a specific PIP.
        """
        try:
            pip = PIP.objects.get(id=pip_id)
        except PIP.DoesNotExist:
            return Response(
                {'error': 'PIP not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        actions = self.get_queryset().filter(pip=pip)
        serializer = self.get_serializer(actions, many=True)
        return Response(serializer.data)


class PIPReviewViewSet(BaseReviewViewSet):
    """
    ViewSet for PIP Reviews (progress check-ins).
    
    Actions:
    - GET /pip-reviews/ - List all PIP reviews
    - POST /pip-reviews/ - Create new PIP review
    - GET /pip-reviews/{id}/ - Get review details
    - PUT /pip-reviews/{id}/ - Update review
    - DELETE /pip-reviews/{id}/ - Delete review
    - GET /pip-reviews/for-pip/{pip_id}/ - Get reviews for a PIP
    """
    
    queryset = PIPReview.objects.all()
    serializer_class = PIPReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [CanManagePIP]
        else:
            self.permission_classes = [CanViewPIP]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """
        Create a new PIP review.
        """
        serializer.save(
            reviewer=self.request.user,
            employee=self.request.data.get('employee_id')
        )
    
    @action(detail=False, methods=['get'], url_path='for-pip/(?P<pip_id>[^/.]+)')
    def for_pip(self, request, pip_id=None):
        """
        Get all reviews for a specific PIP.
        """
        try:
            pip = PIP.objects.get(id=pip_id)
        except PIP.DoesNotExist:
            return Response(
                {'error': 'PIP not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        reviews = self.get_queryset().filter(pip=pip)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
