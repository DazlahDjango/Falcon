from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from apps.reviews.models import RatingScale
from apps.reviews.api.v1.serializers import RatingScaleSerializer, RatingScaleListSerializer, RatingScaleDetailSerializer, RatingScaleCreateUpdateSerializer, ConvertScoreSerializer
from .base_views import BaseReviewViewSet
from ..permissions import IsAdminOnly
from apps.accounts.constants import UserRoles

class RatingScaleViewSet(BaseReviewViewSet):
    queryset = RatingScale.objects.all()
    def get_serializer_class(self):
        if self.action == 'list':
            return RatingScaleListSerializer
        elif self.action == 'retrieve':
            return RatingScaleDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RatingScaleCreateUpdateSerializer
        return RatingScaleSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'set_default', 'activate', 'deactivate']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id, created_by=self.request.user)
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        scale = self.get_object()
        RatingScale.objects.filter(tenant_id=scale.tenant_id).update(is_default=False)
        scale.is_default = True
        scale.save()
        return Response(self.get_serializer(scale).data)
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        scale = self.get_object()
        scale.is_active = True
        scale.save()
        return Response(self.get_serializer(scale).data)
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        scale = self.get_object()
        if scale.is_default:
            return Response({'error': 'Cannot deactivate default scale'}, status=status.HTTP_400_BAD_REQUEST)
        scale.is_active = False
        scale.save()
        return Response(self.get_serializer(scale).data)
    @action(detail=False, methods=['get'])
    def default(self, request):
        scale = RatingScale.objects.filter(tenant_id=request.user.tenant_id, is_default=True, is_active=True).first()
        if not scale:
            scale = RatingScale.objects.filter(tenant_id=request.user.tenant_id, is_active=True).first()
        if not scale:
            return Response({}, status=status.HTTP_200_OK)
        return Response(self.get_serializer(scale).data)
    @action(detail=False, methods=['post'])
    def convert(self, request):
        serializer = ConvertScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            scale = RatingScale.objects.get(id=data['rating_scale_id'])
            result = scale.convert_score(data['score'], data['from_type'], data['to_type'])
            return Response({'result': result, 'rating_scale': scale.name})
        except RatingScale.DoesNotExist:
            return Response({'error': 'Rating scale not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'])
    def active_scales(self, request):
        scales = self.get_queryset().filter(is_active=True)
        return Response(self.get_serializer(scales, many=True).data)