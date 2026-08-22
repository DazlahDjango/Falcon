from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import FinalRating, ReviewCycle, PIP, PromotionRecommendation
from apps.reviews.services.assessment.final_rating_service import FinalRatingService
from apps.reviews.services.pip.pip_generator import PIPGenerator
from apps.reviews.services.promotion.promotion_service import PromotionService
from apps.reviews.api.v1.serializers import FinalRatingSerializer, FinalRatingListSerializer, FinalRatingDetailSerializer, FinalRatingApproveSerializer, FinalRatingLockSerializer, FinalRatingCalibrateSerializer, FinalRatingExportSerializer, RatingDistributionSerializer
from .base_views import BaseReviewViewSet
from apps.accounts.constants import UserRoles
from apps.reviews.api.v1.permissions.base_permissions import IsAuthenticated, IsAdminOnly, IsSupervisorOrAdmin

class FinalRatingViewSet(BaseReviewViewSet):
    queryset = FinalRating.objects.all()
    def get_serializer_class(self):
        if self.action == 'list':
            return FinalRatingListSerializer
        elif self.action == 'retrieve':
            return FinalRatingDetailSerializer
        return FinalRatingSerializer
    def get_permissions(self):
        if self.action in ['approve', 'lock', 'calibrate', 'recalibrate', 'force_lock']:
            self.permission_classes = [IsAdminOnly]
        elif self.action == 'generate_pip':
            self.permission_classes = [IsSupervisorOrAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        rating = self.get_object()
        if rating.status not in ['calibrated', 'pending']:
            return Response({'error': f'Cannot approve with status: {rating.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = FinalRatingApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating.status = 'approved'
        rating.approved_by = request.user
        rating.approved_at = timezone.now()
        if request.data.get('notes'):
            rating.notes = request.data['notes']
        rating.save()
        return Response(self.get_serializer(rating).data)
    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        rating = self.get_object()
        if rating.status != 'approved':
            return Response({'error': f'Cannot lock with status: {rating.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = FinalRatingLockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating.status = 'locked'
        rating.save()
        if rating.final_score and rating.final_score < 60:
            PIPGenerator.generate_pip_from_rating(rating.id)
        if rating.promotion_recommended:
            PromotionService.create_from_final_rating(rating.id)
        return Response(self.get_serializer(rating).data)
    @action(detail=True, methods=['post'])
    def force_lock(self, request, pk=None):
        rating = self.get_object()
        rating.status = 'locked'
        rating.save()
        return Response(self.get_serializer(rating).data)
    @action(detail=True, methods=['post'])
    def calibrate(self, request, pk=None):
        rating = self.get_object()
        if rating.status not in ['pending', 'calibrated']:
            return Response({'error': f'Cannot calibrate with status: {rating.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = FinalRatingCalibrateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_score = rating.final_score
        rating.final_score = serializer.validated_data['adjusted_score']
        rating.calibration_adjustment = rating.final_score - old_score if old_score else 0
        rating.calibration_adjustment_reason = serializer.validated_data['reason']
        rating.status = 'calibrated'
        rating.save()
        return Response(self.get_serializer(rating).data)
    @action(detail=True, methods=['post'])
    def recalibrate(self, request, pk=None):
        rating = self.get_object()
        rating.calibration_adjustment = None
        rating.calibration_adjustment_reason = ''
        rating.status = 'pending'
        rating.save()
        return Response(self.get_serializer(rating).data)
    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        rating = self.get_object()
        rating = FinalRatingService.recalculate_kpi_component(rating.id)
        rating.status = 'pending'
        rating.save()
        return Response(self.get_serializer(rating).data)
    @action(detail=True, methods=['post'])
    def generate_pip(self, request, pk=None):
        rating = self.get_object()
        if rating.final_score and rating.final_score >= 60:
            return Response({'error': 'Score is above 60%, PIP not needed'}, status=status.HTTP_400_BAD_REQUEST)
        pip = PIPGenerator.generate_pip_from_rating(rating.id)
        if not pip:
            return Response({'error': 'PIP could not be generated'}, status=status.HTTP_400_BAD_REQUEST)
        from apps.reviews.api.v1.serializers import PIPSerializer
        return Response(PIPSerializer(pip).data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['post'])
    def generate_promotion(self, request, pk=None):
        rating = self.get_object()
        if not rating.promotion_recommended:
            return Response({'error': 'Promotion not recommended for this rating'}, status=status.HTTP_400_BAD_REQUEST)
        promotion = PromotionService.create_from_final_rating(rating.id)
        from apps.reviews.api.v1.serializers import PromotionRecommendationSerializer
        return Response(PromotionRecommendationSerializer(promotion).data, status=status.HTTP_201_CREATED)
    @action(detail=False, methods=['get'])
    def my(self, request):
        cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status__in=['completed', 'archived']).order_by('-end_date').first()
        if not cycle:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='submitted').order_by('-end_date').first()
        if not cycle:
            return Response({'message': 'No review cycle found'}, status=status.HTTP_200_OK)
        rating = self.get_queryset().filter(review_cycle=cycle, employee=request.user).first()
        return Response(FinalRatingDetailSerializer(rating).data if rating else {'message': 'No final rating found'})
    @action(detail=False, methods=['get'], url_path='for-cycle/(?P<cycle_id>[^/.]+)')
    def for_cycle(self, request, cycle_id=None):
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            ratings = self.get_queryset().filter(review_cycle=cycle)
            return Response(self.get_serializer(ratings, many=True).data)
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'])
    def team(self, request):
        if request.user.role not in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        direct_reports = request.user.direct_reports.all()
        ratings = self.get_queryset().filter(employee__in=direct_reports).select_related('employee', 'review_cycle')
        return Response(self.get_serializer(ratings, many=True).data)
    @action(detail=False, methods=['get'])
    def distribution(self, request):
        cycle_id = request.query_params.get('cycle_id')
        if not cycle_id:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='completed').order_by('-end_date').first()
            if not cycle:
                cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='active').order_by('-end_date').first()
            if not cycle:
                cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id).order_by('-end_date').first()
            if not cycle:
                return Response({'cycle_id': None, 'cycle_name': None, 'total_ratings': 0, 'distribution': []})
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        ratings = self.get_queryset().filter(review_cycle=cycle, final_rating_label__isnull=False)
        dist = {}
        for r in ratings:
            label = r.final_rating_label
            if label not in dist:
                dist[label] = {'count': 0, 'percentage': 0, 'color': r.final_rating_color}
            dist[label]['count'] += 1
        total = len(ratings)
        for label in dist:
            dist[label]['percentage'] = round((dist[label]['count'] / total) * 100, 1) if total > 0 else 0
        dist_list = [{'rating_label': k, 'count': v['count'], 'percentage': v['percentage'], 'color': v['color']} for k, v in dist.items()]
        return Response({'cycle_id': str(cycle.id), 'cycle_name': cycle.name, 'total_ratings': total, 'distribution': RatingDistributionSerializer(dist_list, many=True).data})
    @action(detail=False, methods=['get'])
    def stats(self, request):
        cycle_id = request.query_params.get('cycle_id')
        if not cycle_id:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='completed').order_by('-end_date').first()
            if not cycle:
                cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='active').order_by('-end_date').first()
            if not cycle:
                cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id).order_by('-end_date').first()
            if not cycle:
                return Response({'total_employees': 0, 'average_score': None, 'min_score': None, 'max_score': None, 'total_ratings': 0})
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        stats = FinalRatingService.get_cycle_statistics(cycle)
        return Response(stats)
    @action(detail=False, methods=['post'])
    def export(self, request):
        serializer = FinalRatingExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            cycle = ReviewCycle.objects.get(id=data['cycle_id'])
            ratings = self.get_queryset().filter(review_cycle=cycle)
            export_data = []
            for r in ratings:
                row = {'Employee': r.employee.get_full_name(), 'Email': r.employee.email, 'Department': r.employee.department.name if r.employee.department else None, 'Final Score': float(r.final_score) if r.final_score else None, 'Rating': r.final_rating_label, 'Promotion': 'Yes' if r.promotion_recommended else 'No', 'PIP': 'Yes' if r.pip_recommended else 'No', 'Status': r.get_status_display()}
                if data.get('include_details'):
                    row.update({'KPI Score': float(r.kpi_score) if r.kpi_score else None, 'Competency Score': float(r.competency_score) if r.competency_score else None, 'Calibration Adjustment': float(r.calibration_adjustment) if r.calibration_adjustment else None})
                export_data.append(row)
            return Response({'cycle_name': cycle.name, 'total': len(export_data), 'data': export_data, 'format': data['format']})
        except ReviewCycle.DoesNotExist:
            return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)