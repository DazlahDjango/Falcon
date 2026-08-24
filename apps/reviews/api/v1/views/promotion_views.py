from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import models
from apps.reviews.models import PromotionRecommendation, FinalRating
from apps.reviews.services.promotion.promotion_service import PromotionService
from apps.reviews.api.v1.serializers import PromotionRecommendationSerializer, PromotionRecommendationListSerializer, PromotionApproveSerializer, PromotionRejectSerializer
from .base_views import BaseReviewViewSet
from apps.accounts.constants import UserRoles

from apps.reviews.api.v1.permissions.base_permissions import IsAuthenticated, IsAdminOnly, IsSupervisorOrAdmin

class PromotionRecommendationViewSet(BaseReviewViewSet):
    queryset = PromotionRecommendation.objects.all()
    def get_serializer_class(self):
        return PromotionRecommendationListSerializer if self.action == 'list' else PromotionRecommendationSerializer
    def get_permissions(self):
        if self.action in ['approve', 'reject', 'complete', 'hold']:
            self.permission_classes = [IsAdminOnly]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id, recommended_by=self.request.user)
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        promotion = self.get_object()
        if promotion.status != 'pending':
            return Response({'error': f'Cannot approve with status: {promotion.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PromotionApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        promotion.status = 'approved'
        promotion.approved_by = request.user
        promotion.approved_at = timezone.now()
        if data.get('notes'):
            promotion.status_notes = data['notes']
        if data.get('target_date'):
            promotion.target_promotion_date = data['target_date']
        promotion.save()
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_promotion_approved(promotion)
        return Response(self.get_serializer(promotion).data)
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        promotion = self.get_object()
        if promotion.status != 'pending':
            return Response({'error': f'Cannot reject with status: {promotion.status}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PromotionRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        promotion.status = 'rejected'
        promotion.approved_by = request.user
        promotion.approved_at = timezone.now()
        promotion.rejection_reason = serializer.validated_data['reason']
        promotion.save()
        from apps.reviews.services.notification.notification_service import NotificationService
        NotificationService.notify_promotion_rejected(promotion, promotion.rejection_reason)
        return Response(self.get_serializer(promotion).data)
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        promotion = self.get_object()
        if promotion.status != 'approved':
            return Response({'error': f'Cannot complete with status: {promotion.status}'}, status=status.HTTP_400_BAD_REQUEST)
        promotion.status = 'completed'
        promotion.actual_promotion_date = request.data.get('actual_date', timezone.now().date())
        if request.data.get('new_salary'):
            promotion.proposed_salary = request.data['new_salary']
        promotion.save()
        return Response(self.get_serializer(promotion).data)
    @action(detail=True, methods=['post'])
    def hold(self, request, pk=None):
        promotion = self.get_object()
        if promotion.status not in ['pending', 'approved']:
            return Response({'error': f'Cannot hold with status: {promotion.status}'}, status=status.HTTP_400_BAD_REQUEST)
        promotion.status = 'on_hold'
        promotion.status_notes = request.data.get('reason', '')
        promotion.save()
        return Response(self.get_serializer(promotion).data)
    @action(detail=False, methods=['get'])
    def pending(self, request):
        promotions = self.get_queryset().filter(status='pending')
        return Response(self.get_serializer(promotions, many=True).data)
    @action(detail=False, methods=['get'])
    def approved(self, request):
        promotions = self.get_queryset().filter(status='approved')
        return Response(self.get_serializer(promotions, many=True).data)
    @action(detail=False, methods=['get'])
    def completed(self, request):
        promotions = self.get_queryset().filter(status='completed')
        return Response(self.get_serializer(promotions, many=True).data)
    @action(detail=False, methods=['get'], url_path='for-employee/(?P<employee_id>[^/.]+)')
    def for_employee(self, request, employee_id=None):
        from apps.accounts.models import User
        try:
            employee = User.objects.get(id=employee_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and request.user != employee.manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            promotions = self.get_queryset().filter(employee=employee)
            return Response(self.get_serializer(promotions, many=True).data)
        except User.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get', 'post'])
    def stats(self, request):
        from apps.tenant.models import Organization
        try:
            tenant = Organization.objects.get(id=request.user.tenant_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)
            
        params = request.query_params if request.method == 'GET' else request.data
        year = params.get('year')
        stats = PromotionService.get_promotion_statistics(tenant, year=int(year) if year else None)
        return Response(stats)
    @action(detail=False, methods=['post'], url_path='generate-from-rating/(?P<rating_id>[^/.]+)')
    def generate_from_rating(self, request, rating_id=None):
        try:
            rating = FinalRating.objects.get(id=rating_id)
            if not rating.promotion_recommended:
                return Response({'error': 'Promotion not recommended for this rating'}, status=status.HTTP_400_BAD_REQUEST)
            promotion = PromotionService.create_from_final_rating(rating_id)
            return Response(self.get_serializer(promotion).data, status=status.HTTP_201_CREATED)
        except FinalRating.DoesNotExist:
            return Response({'error': 'Rating not found'}, status=status.HTTP_404_NOT_FOUND)