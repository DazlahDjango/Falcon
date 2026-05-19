# apps/reviews/api/v1/views/calibration_views.py
"""
Views for CalibrationSession, CalibrationRating, and CalibrationComment models
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models

from apps.reviews.models import CalibrationSession, CalibrationRating, CalibrationComment
from apps.reviews.services.calibration.calibration_service import CalibrationService
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService
from ..serializers import (
    CalibrationSessionSerializer,
    CalibrationSessionListSerializer,
    CalibrationSessionDetailSerializer,
    CalibrationSessionCreateSerializer,
    CalibrationSessionStartSerializer,
    CalibrationSessionCompleteSerializer,
    CalibrationRatingSerializer,
    CalibrationRatingCreateSerializer,
    CalibrationCommentSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import (
    CanViewCalibrationSession,
    CanParticipateInCalibration,
    CanFacilitateCalibration,
    CanAdjustRating,
)
from ..filters.calibration_filters import CalibrationSessionFilter


class CalibrationSessionViewSet(BaseReviewViewSet):
    """
    ViewSet for Calibration Sessions.
    
    Actions:
    - GET /calibration-sessions/ - List sessions
    - POST /calibration-sessions/ - Create new session
    - GET /calibration-sessions/{id}/ - Get session details
    - PUT /calibration-sessions/{id}/ - Update session
    - DELETE /calibration-sessions/{id}/ - Delete session
    - POST /calibration-sessions/{id}/start/ - Start session
    - POST /calibration-sessions/{id}/complete/ - Complete session
    - POST /calibration-sessions/{id}/adjust-rating/ - Adjust a rating
    - POST /calibration-sessions/{id}/add-comment/ - Add comment
    - GET /calibration-sessions/{id}/report/ - Get session report
    - GET /calibration-sessions/my/ - Get my upcoming sessions
    """
    
    queryset = CalibrationSession.objects.all()
    filterset_class = CalibrationSessionFilter
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CalibrationSessionListSerializer
        elif self.action == 'retrieve':
            return CalibrationSessionDetailSerializer
        elif self.action == 'create':
            return CalibrationSessionCreateSerializer
        return CalibrationSessionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [CanFacilitateCalibration]
        elif self.action in ['start', 'complete', 'adjust_rating']:
            self.permission_classes = [CanFacilitateCalibration]
        else:
            self.permission_classes = [CanViewCalibrationSession]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """
        Start a calibration session.
        """
        session = self.get_object()
        
        if session.status != 'active':
            return Response(
                {'error': f'Cannot start session with status: {session.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CalibrationSessionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session.actual_start_time = timezone.now()
        session.status = 'in_progress'
        session.save()
        
        result_serializer = self.get_serializer(session)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Complete a calibration session.
        """
        session = self.get_object()
        
        if session.status != 'in_progress':
            return Response(
                {'error': f'Cannot complete session with status: {session.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CalibrationSessionCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        session.actual_end_time = timezone.now()
        session.outcome = 'completed'
        session.status = 'completed'
        
        if data.get('decisions'):
            session.decisions = data['decisions']
        if data.get('notes'):
            session.notes = data['notes']
        
        session.save()
        
        result_serializer = self.get_serializer(session)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'], url_path='adjust-rating')
    def adjust_rating(self, request, pk=None):
        """
        Adjust a rating during calibration.
        """
        session = self.get_object()
        
        if session.status != 'in_progress':
            return Response(
                {'error': 'Rating adjustments can only be made during an in-progress session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CalibrationRatingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        final_rating_id = data.get('final_rating')
        before_score = data['before_score']
        after_score = data['after_score']
        reason = data['adjustment_reason']
        
        # Check permission
        if request.user.role not in ['admin', 'hr'] and session.facilitator != request.user:
            return Response(
                {'error': 'Only the facilitator or HR can adjust ratings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        calibration_rating = CalibrationService.add_rating_adjustment(
            session_id=session.id,
            final_rating_id=final_rating_id,
            adjusted_by=request.user,
            before_score=before_score,
            after_score=after_score,
            reason=reason
        )
        
        result_serializer = CalibrationRatingSerializer(calibration_rating)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='add-comment')
    def add_comment(self, request, pk=None):
        """
        Add a comment to the calibration session.
        """
        session = self.get_object()
        
        # Check if user is participant or facilitator
        if not session.participants.filter(id=request.user.id).exists() and session.facilitator != request.user:
            return Response(
                {'error': 'You are not authorized to comment on this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment_text = request.data.get('comment')
        if not comment_text:
            return Response(
                {'error': 'Comment text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = CalibrationComment.objects.create(
            calibration_session=session,
            author=request.user,
            comment=comment_text,
            parent_comment_id=request.data.get('parent_comment_id')
        )
        
        serializer = CalibrationCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """
        Get detailed report for the calibration session.
        """
        session = self.get_object()
        report = CalibrationReportService.get_session_report(session.id)
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Get upcoming calibration sessions for the current user.
        """
        today = timezone.now()
        
        # Sessions where user is a participant or facilitator
        sessions = self.get_queryset().filter(
            models.Q(participants=request.user) |
            models.Q(facilitator=request.user)
        ).filter(
            scheduled_date__gte=today,
            status__in=['active', 'in_progress']
        ).distinct()
        
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        """
        Get all calibration sessions for a specific cycle.
        """
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            return Response(
                {'error': 'Review cycle not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        sessions = self.get_queryset().filter(review_cycle=cycle)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def outlier_report(self, request):
        """
        Get outlier report for a cycle (ratings needing calibration).
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
        
        report = CalibrationReportService.get_outlier_report(cycle)
        return Response(report)


class CalibrationRatingViewSet(BaseReviewViewSet):
    """
    ViewSet for Calibration Ratings (read-only).
    
    Actions:
    - GET /calibration-ratings/ - List all calibration ratings
    - GET /calibration-ratings/{id}/ - Get rating details
    - GET /calibration-ratings/for-session/{session_id}/ - Get by session
    """
    
    queryset = CalibrationRating.objects.all()
    serializer_class = CalibrationRatingSerializer
    
    @action(detail=False, methods=['get'], url_path='for-session/(?P<session_id>[^/.]+)')
    def for_session(self, request, session_id=None):
        """
        Get all calibration ratings for a specific session.
        """
        try:
            session = CalibrationSession.objects.get(id=session_id)
        except CalibrationSession.DoesNotExist:
            return Response(
                {'error': 'Calibration session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        ratings = self.get_queryset().filter(calibration_session=session)
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)
