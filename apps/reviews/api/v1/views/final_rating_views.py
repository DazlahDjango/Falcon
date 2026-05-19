# apps/reviews/api/v1/views/final_rating_views.py
"""
Views for FinalRating model
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.utils import timezone

from apps.reviews.models import FinalRating, ReviewCycle
from apps.reviews.services.assessment.final_rating_service import FinalRatingService
from apps.reviews.services.rating.rating_converter import RatingConverter
from ..serializers import (
    FinalRatingSerializer,
    FinalRatingListSerializer,
    FinalRatingDetailSerializer,
    FinalRatingApproveSerializer,
    FinalRatingLockSerializer,
    FinalRatingCalibrateSerializer,
    FinalRatingExportSerializer,
    RatingDistributionSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import CanViewFinalRating, CanApproveReview
from ..filters.assessment_filters import FinalRatingFilter


class FinalRatingViewSet(BaseReviewViewSet):
    """
    ViewSet for Final Ratings.
    
    Actions:
    - GET /final-ratings/ - List final ratings
    - GET /final-ratings/{id}/ - Get rating details
    - POST /final-ratings/{id}/approve/ - Approve rating (HR)
    - POST /final-ratings/{id}/lock/ - Lock rating (final)
    - POST /final-ratings/{id}/calibrate/ - Calibrate rating
    - GET /final-ratings/my/ - Get my final rating
    - GET /final-ratings/for-cycle/{cycle_id}/ - Get by cycle
    - GET /final-ratings/team/ - Get team ratings (managers)
    - GET /final-ratings/distribution/ - Get rating distribution
    - POST /final-ratings/export/ - Export ratings
    """
    
    queryset = FinalRating.objects.all()
    filterset_class = FinalRatingFilter
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FinalRatingListSerializer
        elif self.action == 'retrieve':
            return FinalRatingDetailSerializer
        return FinalRatingSerializer
    
    def get_permissions(self):
        if self.action in ['approve', 'lock', 'calibrate']:
            self.permission_classes = [CanApproveReview]
        else:
            self.permission_classes = [CanViewFinalRating]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a final rating (HR action).
        """
        final_rating = self.get_object()
        
        if final_rating.status not in ['calibrated', 'pending']:
            return Response(
                {'error': f'Rating cannot be approved (current status: {final_rating.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FinalRatingApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        final_rating.status = 'approved'
        final_rating.approved_by = request.user
        final_rating.approved_at = timezone.now()
        
        if request.data.get('notes'):
            final_rating.notes = request.data['notes']
        
        final_rating.save()
        
        result_serializer = self.get_serializer(final_rating)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        """
        Lock a final rating (makes it final and unchangeable).
        """
        final_rating = self.get_object()
        
        if final_rating.status != 'approved':
            return Response(
                {'error': f'Only approved ratings can be locked (current status: {final_rating.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FinalRatingLockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        final_rating.status = 'locked'
        final_rating.save()
        
        # Trigger actions (PIP creation, promotion processing)
        from apps.reviews.signals import final_rating_post_save
        final_rating_post_save(FinalRating, final_rating)
        
        result_serializer = self.get_serializer(final_rating)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def calibrate(self, request, pk=None):
        """
        Calibrate a final rating (adjust score).
        """
        final_rating = self.get_object()
        
        if final_rating.status not in ['pending', 'calibrated']:
            return Response(
                {'error': f'Rating cannot be calibrated (current status: {final_rating.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FinalRatingCalibrateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        old_score = final_rating.final_score
        
        final_rating.final_score = data['adjusted_score']
        final_rating.calibration_adjustment = data['adjusted_score'] - old_score if old_score else 0
        final_rating.calibration_adjustment_reason = data['reason']
        final_rating.status = 'calibrated'
        final_rating.save()
        
        result_serializer = self.get_serializer(final_rating)
        return Response(result_serializer.data)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Get the current user's final rating for the active/completed cycle.
        """
        employee = request.user
        
        # Find the most recent completed or locked cycle
        cycle = ReviewCycle.objects.filter(
            tenant=employee.tenant,
            status__in=['completed', 'archived']
        ).order_by('-end_date').first()
        
        if not cycle:
            # Check active cycle
            cycle = ReviewCycle.objects.filter(
                tenant=employee.tenant,
                status='active'
            ).order_by('-end_date').first()
        
        if not cycle:
            return Response(
                {'message': 'No review cycle found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        final_rating = self.get_queryset().filter(
            review_cycle=cycle,
            employee=employee
        ).first()
        
        if not final_rating:
            return Response(
                {'message': 'No final rating found for the latest cycle'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = FinalRatingDetailSerializer(final_rating)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        """
        Get all final ratings for a specific cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        ratings = self.get_queryset().filter(review_cycle=cycle)
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team(self, request):
        """
        Get final ratings for manager's team.
        """
        supervisor = request.user
        
        if supervisor.role not in ['supervisor', 'executive', 'super_admin', 'client_admin', 'dashboard_champion']:
            return Response(
                {'error': 'You do not have permission to view team ratings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get direct reports
        direct_reports = supervisor.direct_reports.all()
        
        ratings = self.get_queryset().filter(
            employee__in=direct_reports
        ).select_related('employee', 'review_cycle', 'rating_scale')
        
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def distribution(self, request):
        """
        Get rating distribution for a cycle.
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
        
        ratings = self.get_queryset().filter(
            review_cycle=cycle,
            final_rating_label__isnull=False
        )
        
        # Calculate distribution
        distribution = {}
        total = ratings.count()
        
        for rating in ratings:
            label = rating.final_rating_label
            if label not in distribution:
                distribution[label] = {
                    'count': 0,
                    'percentage': 0,
                    'color': rating.final_rating_color
                }
            distribution[label]['count'] += 1
        
        # Calculate percentages
        for label in distribution:
            distribution[label]['percentage'] = round(
                (distribution[label]['count'] / total) * 100, 1
            ) if total > 0 else 0
        
        # Convert to list format
        distribution_list = [
            {
                'rating_label': label,
                'count': data['count'],
                'percentage': data['percentage'],
                'color': data['color']
            }
            for label, data in distribution.items()
        ]
        
        serializer = RatingDistributionSerializer(distribution_list, many=True)
        
        return Response({
            'cycle_id': str(cycle.id),
            'cycle_name': cycle.name,
            'total_ratings': total,
            'distribution': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def export(self, request):
        """
        Export final ratings to CSV/Excel/PDF.
        """
        serializer = FinalRatingExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        cycle_id = data['cycle_id']
        format_type = data['format']
        include_details = data.get('include_details', False)
        
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        ratings = self.get_queryset().filter(review_cycle=cycle)
        
        # Build export data
        export_data = []
        for rating in ratings:
            row = {
                'Employee': rating.employee.get_full_name(),
                'Employee Email': rating.employee.email,
                'Department': rating.employee.department.name if rating.employee.department else None,
                'Final Score': float(rating.final_score) if rating.final_score else None,
                'Final Rating': rating.final_rating_label,
                'Promotion Recommended': 'Yes' if rating.promotion_recommended else 'No',
                'PIP Recommended': 'Yes' if rating.pip_recommended else 'No',
                'Status': rating.get_status_display(),
                'Approved By': rating.approved_by.email if rating.approved_by else None,
                'Approved At': rating.approved_at.isoformat() if rating.approved_at else None,
            }
            
            if include_details:
                row.update({
                    'KPI Score': float(rating.kpi_score) if rating.kpi_score else None,
                    'Competency Score': float(rating.competency_score) if rating.competency_score else None,
                    'Raw Total': float(rating.raw_total_score) if rating.raw_total_score else None,
                    'Coefficient': float(rating.coefficient_applied) if rating.coefficient_applied else None,
                    'Calibration Adjustment': float(rating.calibration_adjustment) if rating.calibration_adjustment else None,
                })
            
            export_data.append(row)
        
        # Return data (actual file generation would be implemented here)
        return Response({
            'cycle_name': cycle.name,
            'total_ratings': len(export_data),
            'data': export_data,
            'format': format_type,
            'message': f'Export data prepared for {format_type} format'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics for final ratings in a cycle.
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
        
        stats = FinalRatingService.get_cycle_statistics(cycle)
        return Response(stats)
