from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import ReviewCycle, SelfAssessment, SupervisorReview, FinalRating
from apps.reviews.services.cycle.cycle_service import CycleService
from apps.reviews.api.v1.serializers import ReviewCycleSerializer, ReviewCycleListSerializer, ReviewCycleDetailSerializer, ReviewCycleCreateUpdateSerializer, CycleProgressSerializer, CycleActivateSerializer, CycleDateRangeSerializer
from .base_views import BaseReviewViewSet
from apps.accounts.constants import UserRoles
from apps.reviews.api.v1.permissions import IsAdminOnly



from rest_framework import filters as rest_filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.reviews.api.v1.filters.cycle_filters import CycleFilter

class ReviewCycleViewSet(BaseReviewViewSet):
    queryset = ReviewCycle.objects.all()
    filter_backends = [DjangoFilterBackend, rest_filters.SearchFilter, rest_filters.OrderingFilter]
    filterset_class = CycleFilter
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'end_date', 'name', 'created_at', 'status']
    ordering = ['-start_date']
    def get_serializer_class(self):
        if self.action == 'list':
            return ReviewCycleListSerializer
        elif self.action == 'retrieve':
            return ReviewCycleDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReviewCycleCreateUpdateSerializer
        return ReviewCycleSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'activate', 'freeze', 'complete', 'force_complete', 'archive', 'unarchive', 'extend', 'send_reminders']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        cycle = self.get_object()
        if cycle.status != 'draft':
            return Response({'error': f'Cannot activate cycle with status: {cycle.status}'}, status=status.HTTP_400_BAD_REQUEST)
        if cycle.start_date > timezone.now().date():
            return Response({'error': f'Cannot activate before start date: {cycle.start_date}'}, status=status.HTTP_400_BAD_REQUEST)
        cycle.status = 'submitted'
        cycle.save()
        CycleService.create_self_assessments_for_cycle(cycle)
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['post'])
    def freeze(self, request, pk=None):
        cycle = self.get_object()
        if cycle.status != 'submitted':
            return Response({'error': f'Cannot freeze cycle with status: {cycle.status}'}, status=status.HTTP_400_BAD_REQUEST)
        cycle.status = 'draft'
        cycle.save()
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        cycle = self.get_object()
        if cycle.status not in ['submitted', 'approved']:
            return Response({'error': f'Cannot complete cycle with status: {cycle.status}'}, status=status.HTTP_400_BAD_REQUEST)
        cycle.status = 'completed'
        cycle.save()
        CycleService.process_cycle_completion(cycle)
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['post'])
    def force_complete(self, request, pk=None):
        cycle = self.get_object()
        from apps.reviews.services.assessment.final_rating_service import FinalRatingService
        reviews = SupervisorReview.objects.filter(review_cycle=cycle)
        for review in reviews:
            if review.status not in ['approved', 'completed']:
                review.status = 'approved'
                review.save()
            FinalRatingService.create_or_update_from_review(review.id)
        cycle.status = 'completed'
        cycle.save()
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        cycle = self.get_object()
        if cycle.status not in ['completed', 'approved']:
            return Response({'error': f'Cannot archive cycle with status: {cycle.status}'}, status=status.HTTP_400_BAD_REQUEST)
        cycle.status = 'archived'
        cycle.save()
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        cycle = self.get_object()
        if cycle.status != 'archived':
            return Response({'error': f'Cannot unarchive cycle with status: {cycle.status}'}, status=status.HTTP_400_BAD_REQUEST)
        cycle.status = 'completed'
        cycle.save()
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        cycle = self.get_object()
        new_end_date = request.data.get('new_end_date')
        if not new_end_date:
            return Response({'error': 'new_end_date required'}, status=status.HTTP_400_BAD_REQUEST)
        cycle.end_date = new_end_date
        cycle.save()
        return Response(self.get_serializer(cycle).data)
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        cycle = self.get_object()
        progress = CycleService.get_cycle_progress(cycle.id)
        return Response(progress)
    @action(detail=False, methods=['get'])
    def active(self, request):
        cycle = self.get_queryset().filter(start_date__lte=timezone.now().date(), end_date__gte=timezone.now().date(), status='submitted').first()
        if not cycle:
            return Response({'message': 'No active review cycle found'}, status=status.HTTP_200_OK)
        return Response(self.get_serializer(cycle).data)
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        cycles = self.get_queryset().filter(start_date__gt=timezone.now().date(), status__in=['draft', 'submitted']).order_by('start_date')[:5]
        return Response(self.get_serializer(cycles, many=True).data)
    @action(detail=False, methods=['get'])
    def completed(self, request):
        cycles = self.get_queryset().filter(status='completed').order_by('-end_date')
        return Response(self.get_serializer(cycles, many=True).data)
    @action(detail=False, methods=['get'])
    def archived(self, request):
        cycles = self.get_queryset().filter(status='archived').order_by('-end_date')
        return Response(self.get_serializer(cycles, many=True).data)
    @action(detail=False, methods=['get'], url_path='my_cycles')
    def my_cycles(self, request):
        cycles = self.get_queryset().order_by('-start_date')
        return Response(self.get_serializer(cycles, many=True).data)
    @action(detail=False, methods=['get'], url_path='by-year/(?P<year>[0-9]+)')
    def by_year(self, request, year=None):
        cycles = self.get_queryset().filter(start_date__year=year).order_by('-start_date')
        return Response(self.get_serializer(cycles, many=True).data)
    @action(detail=False, methods=['post'])
    def date_range(self, request):
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
        return Response(self.get_serializer(queryset, many=True).data)
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        cycle = self.get_object()
        from apps.accounts.models import User
        employees = User.objects.filter(tenant_id=cycle.tenant_id, is_active=True)
        if not cycle.include_all_departments:
            employees = employees.filter(department_id__in=cycle.included_departments.values_list('id', flat=True))
        return Response({'total': employees.count(), 'employees': [{'id': str(e.id), 'name': e.get_full_name(), 'email': e.email} for e in employees[:500]]})
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        cycle = self.get_object()
        self_assessments = SelfAssessment.objects.filter(review_cycle=cycle)
        supervisor_reviews = SupervisorReview.objects.filter(review_cycle=cycle)
        final_ratings = FinalRating.objects.filter(review_cycle=cycle)
        return Response({
            'cycle_id': str(cycle.id),
            'cycle_name': cycle.name,
            'self_assessment': {'total': self_assessments.count(), 'submitted': self_assessments.filter(status='submitted').count(), 'draft': self_assessments.filter(status='draft').count()},
            'supervisor_review': {'total': supervisor_reviews.count(), 'approved': supervisor_reviews.filter(status='approved').count(), 'submitted': supervisor_reviews.filter(status='submitted').count(), 'draft': supervisor_reviews.filter(status='draft').count()},
            'final_rating': {'total': final_ratings.count(), 'locked': final_ratings.filter(status='locked').count(), 'approved': final_ratings.filter(status='approved').count(), 'calibrated': final_ratings.filter(status='calibrated').count(), 'pending': final_ratings.filter(status='pending').count()}
        })
    @action(detail=True, methods=['post'])
    def send_reminders(self, request, pk=None):
        cycle = self.get_object()
        from apps.reviews.tasks import _send_self_assessment_reminders, _send_supervisor_review_reminders
        self_result = _send_self_assessment_reminders(cycle.id)
        super_result = _send_supervisor_review_reminders(cycle.id)
        total_sent = self_result.get('reminders_sent', 0) + super_result.get('reminders_sent', 0)
        return Response({'message': f'Successfully sent {total_sent} reminders.', 'sent_count': total_sent})