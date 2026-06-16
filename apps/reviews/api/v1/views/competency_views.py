from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from apps.reviews.models import Competency, CompetencyCategory, CompetencyRating
from apps.reviews.api.v1.serializers import CompetencyCategorySerializer, CompetencySerializer, CompetencyListSerializer, CompetencyRatingSerializer, CompetencyRatingBulkSerializer
from .base_views import BaseReviewViewSet, BaseReadOnlyReviewViewSet
from apps.accounts.constants import UserRoles
from ..permissions import IsAdminOnly

class CompetencyCategoryViewSet(BaseReviewViewSet):
    queryset = CompetencyCategory.objects.all()
    serializer_class = CompetencyCategorySerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'activate', 'deactivate']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        category = self.get_object()
        category.is_active = True
        category.save()
        return Response(self.get_serializer(category).data)
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        category = self.get_object()
        category.is_active = False
        category.save()
        return Response(self.get_serializer(category).data)
    @action(detail=True, methods=['get'])
    def competencies(self, request, pk=None):
        category = self.get_object()
        competencies = category.competencies.filter(is_active=True)
        return Response(CompetencyListSerializer(competencies, many=True).data)

class CompetencyViewSet(BaseReviewViewSet):
    queryset = Competency.objects.all()
    def get_serializer_class(self):
        return CompetencyListSerializer if self.action == 'list' else CompetencySerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'activate', 'deactivate']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        competency = self.get_object()
        competency.is_active = True
        competency.save()
        return Response(self.get_serializer(competency).data)
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        competency = self.get_object()
        competency.is_active = False
        competency.save()
        return Response(self.get_serializer(competency).data)
    @action(detail=False, methods=['get'])
    def active(self, request):
        competencies = self.get_queryset().filter(is_active=True)
        return Response(CompetencyListSerializer(competencies, many=True).data)
    @action(detail=False, methods=['get'])
    def required(self, request):
        competencies = self.get_queryset().filter(is_required=True, is_active=True)
        return Response(CompetencyListSerializer(competencies, many=True).data)
    @action(detail=False, methods=['get'], url_path='by-type/(?P<comp_type>[^/.]+)')
    def by_type(self, request, comp_type=None):
        competencies = self.get_queryset().filter(competency_type=comp_type, is_active=True)
        return Response(CompetencyListSerializer(competencies, many=True).data)
    @action(detail=True, methods=['get'])
    def usage_stats(self, request, pk=None):
        competency = self.get_object()
        rating_count = competency.ratings.count()
        avg_rating = competency.ratings.filter(raw_score__isnull=False).aggregate(avg=models.Avg('raw_score'))['avg']
        return Response({'competency_id': str(competency.id), 'competency_name': competency.name, 'total_ratings': rating_count, 'average_rating': float(avg_rating) if avg_rating else None})

class CompetencyRatingViewSet(BaseReadOnlyReviewViewSet):
    queryset = CompetencyRating.objects.all()
    serializer_class = CompetencyRatingSerializer
    @action(detail=False, methods=['get'], url_path='by-assessment/(?P<assessment_id>[^/.]+)')
    def by_assessment(self, request, assessment_id=None):
        from django.contrib.contenttypes.models import ContentType
        from apps.reviews.models import SelfAssessment
        try:
            assessment = SelfAssessment.objects.get(id=assessment_id)
            ct = ContentType.objects.get_for_model(SelfAssessment)
            ratings = self.get_queryset().filter(content_type=ct, object_id=str(assessment_id))
            return Response(self.get_serializer(ratings, many=True).data)
        except SelfAssessment.DoesNotExist:
            return Response({'error': 'Self assessment not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['get'], url_path='by-review/(?P<review_id>[^/.]+)')
    def by_review(self, request, review_id=None):
        from django.contrib.contenttypes.models import ContentType
        from apps.reviews.models import SupervisorReview
        try:
            review = SupervisorReview.objects.get(id=review_id)
            ct = ContentType.objects.get_for_model(SupervisorReview)
            ratings = self.get_queryset().filter(content_type=ct, object_id=str(review_id))
            return Response(self.get_serializer(ratings, many=True).data)
        except SupervisorReview.DoesNotExist:
            return Response({'error': 'Supervisor review not found'}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        serializer = CompetencyRatingBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parent_id = request.data.get('parent_id')
        parent_type = request.data.get('parent_type')
        if not parent_id or not parent_type:
            return Response({'error': 'parent_id and parent_type required'}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.contenttypes.models import ContentType
        if parent_type == 'self_assessment':
            from apps.reviews.models import SelfAssessment
            parent = SelfAssessment.objects.get(id=parent_id)
        elif parent_type == 'supervisor_review':
            from apps.reviews.models import SupervisorReview
            parent = SupervisorReview.objects.get(id=parent_id)
        else:
            return Response({'error': 'parent_type must be self_assessment or supervisor_review'}, status=status.HTTP_400_BAD_REQUEST)
        ct = ContentType.objects.get_for_model(parent)
        CompetencyRating.objects.filter(content_type=ct, object_id=str(parent_id)).delete()
        created = []
        for rating_data in serializer.validated_data.get('ratings', []):
            rating = CompetencyRating.objects.create(content_type=ct, object_id=str(parent_id), competency_id=rating_data.get('competency'), raw_score=rating_data.get('raw_score'), comment=rating_data.get('comment', ''))
            created.append(rating)
        return Response(self.get_serializer(created, many=True).data, status=status.HTTP_201_CREATED)