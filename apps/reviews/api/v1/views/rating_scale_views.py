# apps/reviews/api/v1/views/rating_scale_views.py
"""
Views for RatingScale model
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from apps.reviews.models import RatingScale
from ..serializers import (
    RatingScaleSerializer,
    RatingScaleListSerializer,
    RatingScaleDetailSerializer,
    RatingScaleCreateUpdateSerializer,
    ConvertScoreSerializer,
)
from .base_views import BaseReviewViewSet
from ..permissions import CanEditReview, IsAdminOrReadOnly
from ..filters import TenantFilter


class RatingScaleViewSet(BaseReviewViewSet):
    """
    ViewSet for managing Rating Scales.
    
    Allows tenants to define their own rating systems.
    
    Actions:
    - GET /rating-scales/ - List all rating scales
    - POST /rating-scales/ - Create new rating scale
    - GET /rating-scales/{id}/ - Get rating scale details
    - PUT /rating-scales/{id}/ - Update rating scale
    - DELETE /rating-scales/{id}/ - Delete rating scale
    - POST /rating-scales/{id}/set-default/ - Set as default
    - POST /rating-scales/convert-score/ - Convert score using a scale
    """
    
    queryset = RatingScale.objects.all()
    filterset_class = TenantFilter
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RatingScaleListSerializer
        elif self.action == 'retrieve':
            return RatingScaleDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RatingScaleCreateUpdateSerializer
        return RatingScaleSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """
        Set a rating scale as the default for the tenant.
        """
        rating_scale = self.get_object()
        
        # Remove default from all other scales
        RatingScale.objects.filter(tenant=rating_scale.tenant).update(is_default=False)
        
        # Set this as default
        rating_scale.is_default = True
        rating_scale.save()
        
        serializer = self.get_serializer(rating_scale)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def convert_score(self, request):
        """
        Convert a score using a rating scale.
        """
        serializer = ConvertScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        rating_scale_id = data.get('rating_scale_id')
        score = data['score']
        from_type = data['from_type']
        to_type = data['to_type']
        
        try:
            rating_scale = RatingScale.objects.get(id=rating_scale_id)
        except RatingScale.DoesNotExist:
            return Response(
                {'error': 'Rating scale not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        result = rating_scale.convert_score(score, from_type, to_type)
        
        return Response({
            'original_score': score,
            'from_type': from_type,
            'to_type': to_type,
            'result': result,
            'rating_scale': rating_scale.name
        })
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """
        Get the default rating scale for the tenant.
        """
        if not hasattr(request.user, 'tenant'):
            return Response({'error': 'No tenant found'}, status=status.HTTP_400_BAD_REQUEST)
        
        rating_scale = RatingScale.objects.filter(
            tenant=request.user.tenant,
            is_default=True,
            is_active=True
        ).first()
        
        if not rating_scale:
            return Response({'error': 'No default rating scale found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(rating_scale)
        return Response(serializer.data)
