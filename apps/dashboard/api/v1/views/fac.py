from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from django.db.models import Q
import logging
from apps.dashboard.models import PeriodComparison, ExecutiveViewPreset
from apps.dashboard.api.v1.serializers import PeriodComparisonResultSerializer, PeriodComparisonSerializer, ExecutiveViewPresetSerializer
from apps.dashboard.api.v1.permissions import ExecutiveDashboardPermission
logger = logging.getLogger(__name__)

class PeriodComparisonViewSet(viewsets.ModelViewSet):
    serializer_class = PeriodComparisonSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        user_id = str(self.request.user.id)
        return PeriodComparison.objects.filter(
            tenant_id=tenant_id
        ).filter(
            Q(user_id=user_id) | Q(is_public=True)
        )
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Calculate comparison results",
        responses={200: PeriodComparisonResultSerializer()}
    )
    @action(detail=True, methods=['post'], url_path='calculate')
    def calculate(self, request, pk=None):
        try:
            from apps.dashboard.services import ExecutiveDashboardService
            
            comparison = self.get_object()
            service = ExecutiveDashboardService(
                request.user,
                getattr(request.user, 'tenant_id', None)
            )
            
            result = service.create_period_comparison(
                str(request.user.id),
                comparison.name,
                comparison.comparison_type,
                comparison.current_period,
                comparison.previous_period
            )
            
            serializer = PeriodComparisonResultSerializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error calculating comparison: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExecutiveViewPresetViewSet(viewsets.ModelViewSet):
    serializer_class = ExecutiveViewPresetSerializer
    permission_classes = [IsAuthenticated, ExecutiveDashboardPermission]
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        user_id = str(self.request.user.id)
        return ExecutiveViewPreset.objects.filter(tenant_id=tenant_id, user_id=user_id)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Set as default view",
        responses={200: ExecutiveViewPresetSerializer()}
    )
    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        try:
            from apps.dashboard.managers import ExecutiveViewPresetManager
            preset = self.get_object()
            manager = ExecutiveViewPresetManager()
            updated = manager.set_default_view(
                preset.id,
                str(request.user.id),
                getattr(request.user, 'tenant_id', None)
            )
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error setting default view: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)