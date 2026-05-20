from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging
from apps.dashboard.models import FavoriteKPI, DashboardAlert, ExportSchedule
from apps.dashboard.api.v1.serializers import FavoriteKPISerializer, DashboardAlertSerializer, ExportScheduleSerializer
from apps.dashboard.api.v1.permissions import DashboardAlertPermission, DashboardExportPermission
from apps.dashboard.api.v1.throttles import DashboardExportThrottle
logger = logging.getLogger(__name__)

class FavoriteKPIViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteKPISerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        user_id = str(self.request.user.id)
        return FavoriteKPI.objects.filter(tenant_id=tenant_id, user_id=user_id)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Reorder favorites",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'favorite_ids': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING))
            }
        ),
        responses={200: openapi.Response('Favorites reordered')}
    )
    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        try:
            from apps.dashboard.managers import FavoriteKPIManager
            
            favorite_ids = request.data.get('favorite_ids', [])
            
            manager = FavoriteKPIManager()
            manager.reorder_favorites(
                str(request.user.id),
                getattr(request.user, 'tenant_id', None),
                favorite_ids
            )
            
            return Response({'message': 'Favorites reordered successfully'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error reordering favorites: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardAlertViewSet(viewsets.ModelViewSet):
    """
    Dashboard Alert ViewSet - CRUD for user alerts.
    """
    
    serializer_class = DashboardAlertSerializer
    permission_classes = [IsAuthenticated, DashboardAlertPermission]
    
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        user_id = str(self.request.user.id)
        
        if self.request.user.role in ['client_admin', 'super_admin']:
            return DashboardAlert.objects.filter(tenant_id=tenant_id)
        
        return DashboardAlert.objects.filter(tenant_id=tenant_id, user_id=user_id)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Suppress an alert",
        responses={200: DashboardAlertSerializer()}
    )
    @action(detail=True, methods=['post'], url_path='suppress')
    def suppress_alert(self, request, pk=None):
        try:
            from apps.dashboard.managers import DashboardAlertManager
            
            alert = self.get_object()
            duration = request.data.get('duration_minutes', 60)
            
            manager = DashboardAlertManager()
            suppressed = manager.suppress_alert(
                alert.id,
                str(request.user.id),
                getattr(request.user, 'tenant_id', None),
                duration
            )
            
            serializer = self.get_serializer(suppressed)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error suppressing alert: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExportScheduleViewSet(viewsets.ModelViewSet):
    """
    Export Schedule ViewSet - CRUD for scheduled exports.
    """
    
    serializer_class = ExportScheduleSerializer
    permission_classes = [IsAuthenticated, DashboardExportPermission]
    throttle_classes = [DashboardExportThrottle]
    
    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        user_id = str(self.request.user.id)
        
        if self.request.user.role == 'super_admin':
            return ExportSchedule.objects.filter(tenant_id=tenant_id)
        
        return ExportSchedule.objects.filter(tenant_id=tenant_id, user_id=user_id)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @swagger_auto_schema(
        operation_description="Trigger export immediately",
        responses={200: openapi.Response('Export triggered')}
    )
    @action(detail=True, methods=['post'], url_path='trigger')
    def trigger_export(self, request, pk=None):
        try:
            from apps.dashboard.tasks import process_due_exports
            
            export = self.get_object()
            export.next_run_at = timezone.now()
            export.save()
            
            process_due_exports.delay()
            
            return Response({'message': 'Export triggered successfully'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error triggering export: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
