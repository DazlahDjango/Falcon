# apps/reviews/api/v1/views/supervisor_review_views.py
"""
Views for SupervisorReview model
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models

from apps.reviews.models import SupervisorReview, ReviewCycle, SelfAssessment
from apps.reviews.services.assessment.supervisor_review_service import SupervisorReviewService
from ..serializers import (
    SupervisorReviewSerializer,
    SupervisorReviewDetailSerializer,
    SupervisorReviewSubmitSerializer,
    SupervisorReviewApproveSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import CanConductSupervisorReview, CanViewReview, CanApproveReview
from ..filters.assessment_filters import SupervisorReviewFilter
from ..throttles.reviews_api_throttle import ReviewsAPIThrottle
from ..throttles.review_throttles import ReviewSubmissionThrottle


class SupervisorReviewViewSet(BaseReviewViewSet):
    throttle_classes = [ReviewsAPIThrottle, ReviewSubmissionThrottle]
    """
    ViewSet for Supervisor Reviews.
    
    Actions:
    - GET /supervisor-reviews/ - List supervisor reviews
    - POST /supervisor-reviews/ - Create/update review
    - GET /supervisor-reviews/{id}/ - Get review details
    - PUT /supervisor-reviews/{id}/ - Update review
    - DELETE /supervisor-reviews/{id}/ - Delete review
    - POST /supervisor-reviews/{id}/submit/ - Submit review
    - POST /supervisor-reviews/{id}/approve/ - Approve review (HR)
    - POST /supervisor-reviews/{id}/reject/ - Reject review (HR)
    - GET /supervisor-reviews/my-queue/ - Get manager's review queue
    - GET /supervisor-reviews/for-cycle/{cycle_id}/ - Get by cycle
    - GET /supervisor-reviews/for-employee/{employee_id}/ - Get by employee
    """
    
    queryset = SupervisorReview.objects.all()
    filterset_class = SupervisorReviewFilter
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SupervisorReviewDetailSerializer
        return SupervisorReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'submit']:
            self.permission_classes = [CanConductSupervisorReview]
        elif self.action in ['approve', 'reject']:
            self.permission_classes = [CanApproveReview]
        else:
            self.permission_classes = [CanViewReview]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Submit a supervisor review.
        """
        review = self.get_object()
        
        if review.status != 'draft':
            return Response(
                {'error': f'Review cannot be submitted (current status: {review.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check deadline
        from django.utils import timezone
        today = timezone.now().date()
        if today > review.review_cycle.supervisor_review_deadline:
            return Response(
                {'error': f'Supervisor review deadline has passed ({review.review_cycle.supervisor_review_deadline})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SupervisorReviewSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review.status = 'submitted'
        review.submitted_at = timezone.now()
        review.save()
        
        result_serializer = self.get_serializer(review)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a supervisor review (HR action).
        """
        review = self.get_object()
        
        if review.status != 'submitted':
            return Response(
                {'error': f'Only submitted reviews can be approved (current status: {review.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SupervisorReviewApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review.status = 'approved'
        review.reviewed_at = timezone.now()
        review.reviewed_by = request.user
        review.save()
        
        # Generate final rating
        from apps.reviews.services.assessment.final_rating_service import FinalRatingService
        FinalRatingService.create_or_update_from_review(review.id)
        
        result_serializer = self.get_serializer(review)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a supervisor review and request changes (HR action).
        """
        review = self.get_object()
        
        if review.status != 'submitted':
            return Response(
                {'error': f'Only submitted reviews can be rejected (current status: {review.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', '')
        if not reason:
            return Response(
                {'error': 'Reason for rejection is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        review.status = 'rejected'
        review.rejection_reason = reason
        review.reviewed_at = timezone.now()
        review.reviewed_by = request.user
        review.save()
        
        # Update self assessment to draft for revision
        if review.self_assessment:
            review.self_assessment.status = 'draft'
            review.self_assessment.save()
        
        result_serializer = self.get_serializer(review)
        return Response(result_serializer.data)
    
    @action(detail=False, methods=['get'], url_path='my-queue')
    def my_queue(self, request):
        """
        Get review queue for the current manager.
        """
        manager = request.user
        
        if manager.role not in ['manager', 'executive', 'admin', 'hr']:
            return Response(
                {'error': 'You do not have permission to view review queue'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get direct reports
        direct_reports = manager.direct_reports.all()
        
        # Get reviews that are ready for review
        reviews = self.get_queryset().filter(
            employee__in=direct_reports,
            status='submitted'
        ).select_related('employee', 'review_cycle', 'self_assessment')
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        """
        Get all supervisor reviews for a specific cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        reviews = self.get_queryset().filter(review_cycle=cycle)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-employee/(?P<employee_id>[^/.]+)')
    def for_employee(self, request, employee_id=None):
        """
        Get supervisor review for a specific employee and current/active cycle.
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
                {'error': 'You do not have permission to view this review'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Find active cycle
        from apps.reviews.services.cycle.cycle_service import CycleService
        cycle = CycleService.get_active_cycle_for_employee(employee)
        
        if not cycle:
            return Response(
                {'message': 'No active review cycle found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        review = self.get_queryset().filter(
            review_cycle=cycle,
            employee=employee
        ).first()
        
        if not review:
            return Response(
                {'message': 'No supervisor review found for this employee'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(review)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='compare-with-self')
    def compare_with_self(self, request, pk=None):
        """
        Get comparison between supervisor review and self assessment.
        """
        review = self.get_object()
        
        if not review.self_assessment:
            return Response(
                {'error': 'No self assessment available for comparison'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        from apps.reviews.services.aggregation.competency_aggregator import CompetencyAggregator
        comparison = CompetencyAggregator.get_rating_gap_analysis(review.self_assessment, review)
        
        return Response(comparison)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics for supervisor reviews.
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
        
        total_employees = cycle.get_participating_employees().count()
        completed = self.get_queryset().filter(
            review_cycle=cycle,
            status='approved'
        ).count()
        
        return Response({
            'total_employees': total_employees,
            'completed': completed,
            'pending': total_employees - completed,
            'percentage': round((completed / total_employees) * 100, 1) if total_employees > 0 else 0
        })
