from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from apps.reviews.models import Competency, CompetencyCategory, CompetencyRating
from ..serializers import (
    CompetencyCategorySerializer,
    CompetencySerializer,
    CompetencyListSerializer,
    CompetencyRatingSerializer,
    CompetencyRatingBulkSerializer,
)
from .base_views import BaseReviewViewSet, BaseReviewViewSet
from ..permissions import CanEditReview, IsAdminOrReadOnly
from ..filters import TenantFilter


class CompetencyCategoryViewSet(BaseReviewViewSet):
    """
    ViewSet for managing Competency Categories.
    
    Actions:
    - GET /competency-categories/ - List all categories
    - POST /competency-categories/ - Create new category
    - GET /competency-categories/{id}/ - Get category details
    - PUT /competency-categories/{id}/ - Update category
    - DELETE /competency-categories/{id}/ - Delete category
    """
    
    queryset = CompetencyCategory.objects.all()
    serializer_class = CompetencyCategorySerializer
    filterset_class = TenantFilter
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminOrReadOnly]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def competencies(self, request, pk=None):
        """
        Get all competencies in this category.
        """
        category = self.get_object()
        competencies = category.competencies.filter(is_active=True)
        serializer = CompetencyListSerializer(competencies, many=True)
        return Response(serializer.data)


class CompetencyViewSet(BaseReviewViewSet):
    """
    ViewSet for managing Competencies.
    
    Actions:
    - GET /competencies/ - List all competencies
    - POST /competencies/ - Create new competency
    - GET /competencies/{id}/ - Get competency details
    - PUT /competencies/{id}/ - Update competency
    - DELETE /competencies/{id}/ - Delete competency
    - GET /competencies/active/ - Get active competencies
    - GET /competencies/required/ - Get required competencies
    - GET /competencies/by-type/{type}/ - Get by competency type
    """
    
    queryset = Competency.objects.all()
    filterset_class = TenantFilter
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CompetencyListSerializer
        return CompetencySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminOrReadOnly]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active competencies.
        """
        competencies = self.get_queryset().filter(is_active=True)
        serializer = CompetencyListSerializer(competencies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def required(self, request):
        """
        Get all required competencies.
        """
        competencies = self.get_queryset().filter(is_required=True, is_active=True)
        serializer = CompetencyListSerializer(competencies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-type/(?P<comp_type>[^/.]+)')
    def by_type(self, request, comp_type=None):
        """
        Get competencies by type.
        """
        competencies = self.get_queryset().filter(
            competency_type=comp_type,
            is_active=True
        )
        serializer = CompetencyListSerializer(competencies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def usage_stats(self, request, pk=None):
        """
        Get usage statistics for a competency.
        """
        competency = self.get_object()
        
        rating_count = competency.ratings.count()
        avg_rating = competency.ratings.filter(
            raw_score__isnull=False
        ).aggregate(avg=models.Avg('raw_score'))['avg']
        
        return Response({
            'competency_id': str(competency.id),
            'competency_name': competency.name,
            'total_ratings': rating_count,
            'average_rating': float(avg_rating) if avg_rating else None
        })


class CompetencyRatingViewSet(BaseReviewViewSet):
    """
    ViewSet for Competency Ratings (read-only).
    
    Actions:
    - GET /competency-ratings/ - List all ratings
    - GET /competency-ratings/{id}/ - Get rating details
    - GET /competency-ratings/by-assessment/{assessment_id}/ - Get by self assessment
    - GET /competency-ratings/by-review/{review_id}/ - Get by supervisor review
    """
    
    queryset = CompetencyRating.objects.all()
    serializer_class = CompetencyRatingSerializer
    
    @action(detail=False, methods=['get'], url_path='by-assessment/(?P<assessment_id>[^/.]+)')
    def by_assessment(self, request, assessment_id=None):
        """
        Get competency ratings for a self assessment.
        """
        from apps.reviews.models import SelfAssessment
        from django.contrib.contenttypes.models import ContentType
        
        try:
            assessment = SelfAssessment.objects.get(id=assessment_id)
            content_type = ContentType.objects.get_for_model(SelfAssessment)
            
            ratings = CompetencyRating.objects.filter(
                content_type=content_type,
                object_id=str(assessment_id)
            ).select_related('competency')
            
            serializer = self.get_serializer(ratings, many=True)
            return Response(serializer.data)
        except SelfAssessment.DoesNotExist:
            return Response(
                {'error': 'Self assessment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='by-review/(?P<review_id>[^/.]+)')
    def by_review(self, request, review_id=None):
        """
        Get competency ratings for a supervisor review.
        """
        from apps.reviews.models import SupervisorReview
        from django.contrib.contenttypes.models import ContentType
        
        try:
            review = SupervisorReview.objects.get(id=review_id)
            content_type = ContentType.objects.get_for_model(SupervisorReview)
            
            ratings = CompetencyRating.objects.filter(
                content_type=content_type,
                object_id=str(review_id)
            ).select_related('competency')
            
            serializer = self.get_serializer(ratings, many=True)
            return Response(serializer.data)
        except SupervisorReview.DoesNotExist:
            return Response(
                {'error': 'Supervisor review not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create competency ratings for an assessment or review.
        """
        serializer = CompetencyRatingBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ratings_data = serializer.validated_data.get('ratings', [])
        parent_id = request.data.get('parent_id')
        parent_type = request.data.get('parent_type')
        
        if not parent_id or not parent_type:
            return Response(
                {'error': 'parent_id and parent_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine parent model
        if parent_type == 'self_assessment':
            from apps.reviews.models import SelfAssessment
            try:
                parent = SelfAssessment.objects.get(id=parent_id)
            except SelfAssessment.DoesNotExist:
                return Response({'error': 'Self assessment not found'}, status=status.HTTP_404_NOT_FOUND)
        elif parent_type == 'supervisor_review':
            from apps.reviews.models import SupervisorReview
            try:
                parent = SupervisorReview.objects.get(id=parent_id)
            except SupervisorReview.DoesNotExist:
                return Response({'error': 'Supervisor review not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {'error': 'parent_type must be self_assessment or supervisor_review'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.contrib.contenttypes.models import ContentType
        content_type = ContentType.objects.get_for_model(parent)
        
        # Delete existing ratings for this parent
        CompetencyRating.objects.filter(
            content_type=content_type,
            object_id=str(parent_id)
        ).delete()
        
        # Create new ratings
        created_ratings = []
        for rating_data in ratings_data:
            rating = CompetencyRating.objects.create(
                content_type=content_type,
                object_id=str(parent_id),
                competency_id=rating_data.get('competency'),
                raw_score=rating_data.get('raw_score'),
                comment=rating_data.get('comment', '')
            )
            created_ratings.append(rating)
        
        result_serializer = self.get_serializer(created_ratings, many=True)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
