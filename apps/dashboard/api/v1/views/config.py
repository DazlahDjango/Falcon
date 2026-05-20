from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
import logging
from apps.dashboard.models import DashboardConfig, WidgetConfig
from apps.dashboard.api.v1.serializers import (
    DashboardConfigSerializer, WidgetConfigSerializer, BulkWidgetUpdateSerializer,
    DashboardCloneSerializer
)
from apps.dashboard.api.v1.permissions import DashboardConfigPermission
from apps.dashboard.api.v1.throttles import DashboardWidgetConfigThrottle

logger = logging.getLogger(__name__)


class DashboardConfigViewSet(viewsets.ModelViewSet):
    serializer_class = DashboardConfigSerializer
    permission_classes = [IsAuthenticated, DashboardConfigPermission]
    throttle_classes = [DashboardWidgetConfigThrottle]
    
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        user_id = str(self.request.user.id)
        
        if self.request.user.role == 'super_admin':
            return DashboardConfig.objects.filter(tenant_id=tenant_id)
        
        return DashboardConfig.objects.filter(tenant_id=tenant_id, user_id=user_id)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Get user's dashboard configurations",
        responses={200: DashboardConfigSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Get default dashboard configuration",
        responses={200: DashboardConfigSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='default/(?P<dashboard_type>[^/.]+)')
    def get_default(self, request, dashboard_type=None):
        try:
            from apps.dashboard.managers import DashboardConfigManager
            
            manager = DashboardConfigManager()
            config = manager.get_default_for_user(
                str(request.user.id),
                getattr(request.user, 'tenant_id', None),
                dashboard_type
            )
            
            serializer = self.get_serializer(config)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching default dashboard: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Clone dashboard configuration",
        request_body=DashboardCloneSerializer,
        responses={201: DashboardConfigSerializer()}
    )
    @action(detail=True, methods=['post'], url_path='clone')
    def clone_dashboard(self, request, pk=None):
        try:
            from apps.dashboard.managers import DashboardConfigManager
            
            serializer = DashboardCloneSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            manager = DashboardConfigManager()
            new_config = manager.clone_dashboard(
                serializer.validated_data['source_dashboard_id'],
                str(request.user.id),
                getattr(request.user, 'tenant_id', None),
                serializer.validated_data['new_name']
            )
            
            response_serializer = self.get_serializer(new_config)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error cloning dashboard: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Set default dashboard",
        responses={200: DashboardConfigSerializer()}
    )
    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        try:
            from apps.dashboard.managers import DashboardConfigManager
            
            config = self.get_object()
            
            manager = DashboardConfigManager()
            manager.set_default_dashboard(
                config.id,
                str(request.user.id),
                getattr(request.user, 'tenant_id', None)
            )
            
            serializer = self.get_serializer(config)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error setting default dashboard: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WidgetConfigViewSet(viewsets.ModelViewSet):
    serializer_class = WidgetConfigSerializer
    permission_classes = [IsAuthenticated, DashboardConfigPermission]
    throttle_classes = [DashboardWidgetConfigThrottle]
    
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        return WidgetConfig.objects.filter(tenant_id=tenant_id)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Get widgets for a dashboard",
        responses={200: WidgetConfigSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='by-dashboard/(?P<dashboard_id>[^/.]+)')
    def get_by_dashboard(self, request, dashboard_id=None):
        try:
            from apps.dashboard.managers import WidgetConfigManager
            
            manager = WidgetConfigManager()
            widgets = manager.get_widgets_for_dashboard(
                dashboard_id,
                getattr(request.user, 'tenant_id', None)
            )
            
            serializer = self.get_serializer(widgets, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching widgets: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Bulk update widget positions",
        request_body=BulkWidgetUpdateSerializer(many=True),
        responses={200: WidgetConfigSerializer(many=True)}
    )
    @action(detail=False, methods=['post'], url_path='bulk-position')
    def bulk_update_positions(self, request):
        try:
            from apps.dashboard.managers import WidgetConfigManager
            
            serializer = BulkWidgetUpdateSerializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            
            dashboard_id = request.data[0].get('dashboard_id') if request.data else None
            if not dashboard_id:
                return Response({'error': 'dashboard_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
            manager = WidgetConfigManager()
            widgets = manager.reposition_widgets(
                dashboard_id,
                getattr(request.user, 'tenant_id', None),
                serializer.validated_data
            )
            
            response_serializer = self.get_serializer(widgets, many=True)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating widget positions: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
