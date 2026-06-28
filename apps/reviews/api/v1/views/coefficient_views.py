from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.reviews.models import Coefficient
from apps.reviews.api.v1.serializers import CoefficientSerializer, CoefficientListSerializer, CoefficientApplySerializer
from .base_views import BaseReviewViewSet
from apps.reviews.api.v1.permissions import IsAdminOnly

class CoefficientViewSet(BaseReviewViewSet):
    queryset = Coefficient.objects.all()
    def get_serializer_class(self):
        return CoefficientListSerializer if self.action == 'list' else CoefficientSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'activate', 'deactivate']:
            self.permission_classes = [IsAdminOnly]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id, created_by=self.request.user)
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        coeff = self.get_object()
        coeff.is_active = True
        coeff.save()
        return Response(self.get_serializer(coeff).data)
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        coeff = self.get_object()
        coeff.is_active = False
        coeff.save()
        return Response(self.get_serializer(coeff).data)
    @action(detail=False, methods=['get'])
    def active(self, request):
        coeffs = self.get_queryset().filter(is_active=True)
        return Response(self.get_serializer(coeffs, many=True).data)
    @action(detail=False, methods=['get'], url_path='by-department/(?P<dept_id>[^/.]+)')
    def by_department(self, request, dept_id=None):
        coeffs = self.get_queryset().filter(department_id=dept_id, is_active=True)
        return Response(self.get_serializer(coeffs, many=True).data)
    @action(detail=False, methods=['get'], url_path='by-position/(?P<position_id>[^/.]+)')
    def by_position(self, request, position_id=None):
        coeffs = self.get_queryset().filter(position_id=position_id, is_active=True)
        return Response(self.get_serializer(coeffs, many=True).data)
    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        coeffs = self.get_queryset().filter(user_id=user_id, is_active=True)
        return Response(self.get_serializer(coeffs, many=True).data)
    @action(detail=False, methods=['post'])
    def apply(self, request):
        serializer = CoefficientApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        from apps.reviews.services.rating.coefficient_applicator import CoefficientApplicator
        adjusted = CoefficientApplicator.apply_coefficient(data['score'], data['coefficient_value'])
        return Response({'original_score': data['score'], 'coefficient': data['coefficient_value'], 'adjusted_score': adjusted})