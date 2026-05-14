# apps/reviews/api/v1/views/cycle_views.py
"""
Views for ReviewCycle model
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from apps.reviews.models import ReviewCycle
from apps.reviews.services.cycle.cycle_service import CycleService
from ..serializers import (
    ReviewCycleSerializer,
    ReviewCycleListSerializer,
    ReviewCycleDetailSerializer,
    ReviewCycleCreateUpdateSerializer,
    CycleProgressSerializer,
    CycleActivateSerializer,
    CycleDateRangeSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import CanEditReview, IsAdminOrReadOnly
from ..filters.cycle_filters import CycleFilter


class ReviewCycleViewSet(BaseReviewViewSet):
    """
    ViewSet for managing Review Cycles.
    
    Actions:
    - GET /cycles/ - List all review cycles
    - POST /cycles/ - Create new review cycle
    - GET /cycles/{id}/ - Get cycle details
    - PUT /cycles/{id}/ - Update cycle
    - DELETE /cycles/{id}/ - Delete cycle
    - POST /cycles/{id}/activate/ - Activate a cycle
    - POST /cycles/{id}/close/ - Close a cycle
    - POST /cycles/{id}/archive/ - Archive a cycle
    - GET /cycles/{id}/progress/ - Get cycle progress
    - GET /cycles/active/ - Get current active cycle
    - GET /cycles/upcoming/ - Get upcoming cycles
    """
    
    queryset = ReviewCycle.objects.all()
    filterset_class = CycleFilter
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReviewCycleListSerializer
        elif self.action == 'retrieve':
            return ReviewCycleDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReviewCycleCreateUpdateSerializer
        return ReviewCycleSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a review cycle.
        """
        cycle = self.get_object()
        serializer = CycleActivateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            activated_cycle = CycleService.activate_cycle(cycle.id)
            result_serializer = self.get_serializer(activated_cycle)
            return Response(result_serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """
        Close a review cycle.
        """
        cycle = self.get_object()
        
        try:
            closed_cycle = CycleService.close_cycle(cycle.id)
            result_serializer = self.get_serializer(closed_cycle)
            return Response(result_serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        Archive a review cycle.
        """
        cycle = self.get_object()
        
        try:
            archived_cycle = CycleService.archive_cycle(cycle.id)
            result_serializer = self.get_serializer(archived_cycle)
            return Response(result_serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Get progress statistics for a review cycle.
        """
        cycle = self.get_object()
        progress = CycleService.get_cycle_progress(cycle.id)
        serializer = CycleProgressSerializer(progress)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get the current active review cycle.
        """
        today = timezone.now().date()
        
        cycle = self.get_queryset().filter(
            start_date__lte=today,
            end_date__gte=today,
            status='active'
        ).first()
        
        if not cycle:
            return Response(
                {'message': 'No active review cycle found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(cycle)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming review cycles.
        """
        today = timezone.now().date()
        
        cycles = self.get_queryset().filter(
            start_date__gt=today,
            status__in=['draft', 'active']
        ).order_by('start_date')[:5]
        
        serializer = self.get_serializer(cycles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_cycles(self, request):
        """
        Get cycles the current user is participating in.
        """
        employee = request.user
        
        # Find cycles where employee is a participant
        cycles = self.get_queryset().filter(
            start_date__lte=timezone.now().date()
        )
        
        # Filter by employee's department if not all departments
        if hasattr(employee, 'department') and employee.department:
            cycles = cycles.filter(
                models.Q(include_all_departments=True) |
                models.Q(included_departments=employee.department)
            )
        
        serializer = self.get_serializer(cycles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def date_range_filter(self, request):
        """
        Filter cycles by date range.
        """
        serializer = CycleDateRangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        queryset = self.get_queryset()
        
        if data.get('date_from'):
            queryset = queryset.filter(start_date__gte=data['date_from'])
        
        if data.get('date_to'):
            queryset = queryset.filter(end_date__lte=data['date_to'])
        
        if data.get('cycle_type'):
            queryset = queryset.filter(cycle_type=data['cycle_type'])
        
        if data.get('status'):
            queryset = queryset.filter(status=data['status'])
        
        result_serializer = self.get_serializer(queryset, many=True)
        return Response(result_serializer.data)