from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import CalibrationSession, CalibrationRating, CalibrationComment, ReviewCycle
from apps.reviews.services.calibration.calibration_service import CalibrationService
from apps.reviews.services.calibration.outlier_detector import OutlierDetector
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService
from apps.reviews.api.v1.serializers import CalibrationSessionSerializer, CalibrationSessionListSerializer, CalibrationSessionDetailSerializer, CalibrationSessionCreateSerializer, CalibrationSessionStartSerializer, CalibrationSessionCompleteSerializer, CalibrationRatingSerializer, CalibrationRatingCreateSerializer, CalibrationCommentSerializer
from .base_views import BaseReadOnlyReviewViewSet, BaseReviewViewSet
from apps.accounts.constants import UserRoles
from apps.reviews.api.v1.permissions import CanFacilitateCalibration

class CalibrationSessionViewSet(BaseReviewViewSet):
    queryset = CalibrationSession.objects.all()
    def get_serializer_class(self):
        if self.action == 'list':
            return CalibrationSessionListSerializer
        elif self.action == 'retrieve':
            return CalibrationSessionDetailSerializer
        elif self.action == 'create':
            return CalibrationSessionCreateSerializer
        return CalibrationSessionSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'start', 'complete', 'add_rating', 'cancel']:
            self.permission_classes = [lambda: self.request.user.role in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        session = self.get_object()
        if session.status != 'draft':
            return Response({'error': f'Cannot start with status: {session.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CalibrationSessionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session.actual_start_time = timezone.now()
        session.status = 'under_review'
        session.save()
        return Response(self.get_serializer(session).data)
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.status != 'under_review':
            return Response({'error': f'Cannot complete with status: {session.status}'}, status=status.HTTP_400_BAD_REQUEST)
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
        return Response(self.get_serializer(session).data)
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        session = self.get_object()
        if session.status not in ['draft', 'under_review']:
            return Response({'error': f'Cannot cancel with status: {session.status}'}, status=status.HTTP_400_BAD_REQUEST)
        session.outcome = 'cancelled'
        session.status = 'cancelled'
        session.save()
        return Response(self.get_serializer(session).data)
    @action(detail=True, methods=['post'], url_path='add-rating')
    def add_rating(self, request, pk=None):
        session = self.get_object()
        if session.status != 'under_review':
            return Response({'error': 'Session must be in progress'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CalibrationRatingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        rating = CalibrationRating.objects.create(calibration_session=session, final_rating_id=data['final_rating'], adjusted_by=request.user, before_score=data['before_score'], after_score=data['after_score'], adjustment_reason=data['adjustment_reason'])
        rating.final_rating.final_score = data['after_score']
        rating.final_rating.calibration_adjustment = data['after_score'] - data['before_score']
        rating.final_rating.calibration_adjustment_reason = data['adjustment_reason']
        rating.final_rating.status = 'calibrated'
        rating.final_rating.save()
        return Response(CalibrationRatingSerializer(rating).data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['post'], url_path='add-comment')
    def add_comment(self, request, pk=None):
        session = self.get_object()
        comment_text = request.data.get('comment')
        if not comment_text:
            return Response({'error': 'Comment required'}, status=status.HTTP_400_BAD_REQUEST)
        comment = CalibrationComment.objects.create(calibration_session=session, author=request.user, comment=comment_text, parent_comment_id=request.data.get('parent_comment_id'))
        return Response(CalibrationCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        session = self.get_object()
        report = CalibrationReportService.get_session_report(session.id)
        return Response(report)
    @action(detail=False, methods=['get'])
    def my(self, request):
        sessions = self.get_queryset().filter(models.Q(participants=request.user) | models.Q(facilitator=request.user), scheduled_date__gte=timezone.now(), status='draft').distinct()
        return Response(self.get_serializer(sessions, many=True).data)
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            sessions = self.get_queryset().filter(review_cycle=cycle)
            return Response(self.get_serializer(sessions, many=True).data)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'])
    def outliers(self, request):
        cycle_id = request.query_params.get('cycle_id')
        if cycle_id:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status__in=['submitted', 'completed', 'archived']).order_by('-end_date').first()
            if not cycle:
                return Response({'cycle_id': None, 'cycle_name': None, 'outliers': [], 'count': 0}, status=status.HTTP_200_OK)
        outliers = OutlierDetector.find_outliers(cycle)
        return Response({'cycle_id': str(cycle.id), 'cycle_name': cycle.name, 'outliers': outliers, 'count': len(outliers)})
    @action(detail=False, methods=['get'])
    def calibration_recommendations(self, request):
        cycle_id = request.query_params.get('cycle_id')
        if cycle_id:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status__in=['submitted', 'completed', 'archived']).order_by('-end_date').first()
            if not cycle:
                return Response({'cycle_id': None, 'cycle_name': None, 'recommendations': []}, status=status.HTTP_200_OK)
        recommendations = OutlierDetector.get_calibration_recommendations(cycle)
        return Response({'cycle_id': str(cycle.id), 'cycle_name': cycle.name, 'recommendations': recommendations})

class CalibrationRatingViewSet(BaseReadOnlyReviewViewSet):
    queryset = CalibrationRating.objects.all()
    serializer_class = CalibrationRatingSerializer
    @action(detail=False, methods=['get'], url_path='for-session/(?P<session_id>[^/.]+)')
    def for_session(self, request, session_id=None):
        try:
            session = CalibrationSession.objects.get(id=session_id)
            ratings = self.get_queryset().filter(calibration_session=session)
            return Response(self.get_serializer(ratings, many=True).data)
        except CalibrationSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class CalibrationCommentViewSet(BaseReviewViewSet):
    queryset = CalibrationComment.objects.all()
    serializer_class = CalibrationCommentSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [CanFacilitateCalibration]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    @action(detail=False, methods=['get'], url_path='for-session/(?P<session_id>[^/.]+)')
    def for_session(self, request, session_id=None):
        try:
            session = CalibrationSession.objects.get(id=session_id)
            comments = self.get_queryset().filter(calibration_session=session, parent_comment__isnull=True)
            return Response(self.get_serializer(comments, many=True).data)
        except CalibrationSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)