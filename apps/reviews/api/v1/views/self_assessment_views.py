# apps/reviews/api/v1/views/self_assessment_views.py
"""
Views for SelfAssessment model
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models

from apps.reviews.models import SelfAssessment, ReviewCycle
from apps.reviews.services.assessment.self_assessment_service import SelfAssessmentService
from apps.reviews.services.cycle.cycle_service import CycleService
from ..serializers import (
    SelfAssessmentSerializer,
    SelfAssessmentDetailSerializer,
    SelfAssessmentSubmitSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import CanSubmitSelfAssessment, CanViewReview, CanEditReview
from ..filters.assessment_filters import SelfAssessmentFilter


class SelfAssessmentViewSet(BaseReviewViewSet):
    """
    ViewSet for Self Assessments.
    
    Actions:
    - GET /self-assessments/ - List self assessments
    - POST /self-assessments/ - Create/update self assessment
    - GET /self-assessments/{id}/ - Get assessment details
    - PUT /self-assessments/{id}/ - Update assessment
    - DELETE /self-assessments/{id}/ - Delete assessment
    - POST /self-assessments/{id}/submit/ - Submit assessment
    - GET /self-assessments/my/ - Get my current assessment
    - GET /self-assessments/for-cycle/{cycle_id}/ - Get by cycle
    - GET /self-assessments/team/ - Get team assessments (managers)
    - GET /self-assessments/pending/ - Get pending assessments
    """
    
    queryset = SelfAssessment.objects.all()
    filterset_class = SelfAssessmentFilter
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SelfAssessmentDetailSerializer
        return SelfAssessmentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            self.permission_classes = [CanEditReview]
        elif self.action == 'submit':
            self.permission_classes = [CanSubmitSelfAssessment]
        else:
            self.permission_classes = [CanViewReview]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Submit a self assessment.
        """
        assessment = self.get_object()
        
        # Check if already submitted
        if assessment.status == 'submitted':
            cycle = assessment.review_cycle
            if not cycle.allow_self_assessment_edit:
                return Response(
                    {'error': 'Self assessment already submitted and cannot be edited'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check deadline
        from django.utils import timezone
        today = timezone.now().date()
        if today > assessment.review_cycle.self_assessment_deadline:
            return Response(
                {'error': f'Self assessment deadline has passed ({assessment.review_cycle.self_assessment_deadline})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SelfAssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        assessment.status = 'submitted'
        assessment.submitted_at = timezone.now()
        assessment.save()
        
        # Calculate average rating
        from apps.reviews.services.rating.score_calculator import ScoreCalculator
        assessment.avg_competency_rating = ScoreCalculator.calculate_avg_competency_score(assessment)
        assessment.save()
        
        # Notify supervisor
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_supervisor_review_ready(assessment)
        
        result_serializer = self.get_serializer(assessment)
        return Response(result_serializer.data)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Get the current user's self assessment for the active cycle.
        """
        employee = request.user
        
        # Find active cycle
        cycle = CycleService.get_active_cycle_for_employee(employee)
        
        if not cycle:
            return Response(
                {'message': 'No active review cycle found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        assessment, created = SelfAssessment.objects.get_or_create(
            review_cycle=cycle,
            employee=employee,
            defaults={'status': 'draft'}
        )
        
        serializer = SelfAssessmentDetailSerializer(assessment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        """
        Get all self assessments for a specific cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        assessments = self.get_queryset().filter(review_cycle=cycle)
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team(self, request):
        """
        Get self assessments for manager's team.
        """
        manager = request.user
        
        # Check if user is a manager
        if manager.role not in ['manager', 'executive', 'admin', 'hr']:
            return Response(
                {'error': 'You do not have permission to view team assessments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get direct reports
        direct_reports = manager.direct_reports.all()
        
        assessments = self.get_queryset().filter(
            employee__in=direct_reports
        ).select_related('employee', 'review_cycle')
        
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get pending self assessments (not yet submitted).
        """
        if request.user.role in ['manager', 'executive', 'admin', 'hr']:
            # Managers see their team's pending
            direct_reports = request.user.direct_reports.all()
            assessments = self.get_queryset().filter(
                employee__in=direct_reports,
                status='draft'
            )
        else:
            # Employees see their own pending
            assessments = self.get_queryset().filter(
                employee=request.user,
                status='draft'
            )
        
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics for self assessments.
        """
        cycle_id = request.query_params.get('cycle_id')
        
        if not cycle_id:
            return Response(
                {'error': 'cycle_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        stats = SelfAssessmentService.get_progress_stats(cycle)
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        """
        Save self assessment as draft (without submitting).
        """
        assessment = self.get_object()
        
        # Update fields from request
        updatable_fields = [
            'overall_comment', 'strengths', 'areas_for_improvement',
            'career_aspirations', 'challenges_faced', 'achievements',
            'training_completed', 'training_requested',
            'goals_achieved', 'goals_for_next_period'
        ]
        
        for field in updatable_fields:
            if field in request.data:
                setattr(assessment, field, request.data[field])
        
        assessment.save()
        
        serializer = self.get_serializer(assessment)
        return Response(serializer.data)