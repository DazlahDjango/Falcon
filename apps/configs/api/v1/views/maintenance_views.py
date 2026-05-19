from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import MaintenanceWindow, MaintenanceLog
from apps.configs.api.v1.serializers import MaintenanceWindowSerializer, MaintenanceWindowDetailSerializer, MaintenanceLogSerializer, MaintenanceActionSerializer
from apps.configs.api.v1.permissions import CanCreateMaintenance, CanStartMaintenance, CanStopMaintenance, CanCancelMaintenance, IsConfigAccess
from apps.configs.api.v1.throttles import MaintenanceRateThrottle, MaintenanceBurstThrottle, ConfigReadThrottle
from apps.configs.api.v1.filters import MaintenanceWindowFilter, MaintenanceLogFilter
from apps.configs.services.maintenance.maintenance_orchestrator import MaintenanceOrchestrator
from apps.configs.services.maintenance.maintenance_risk import MaintenanceRisk
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class MaintenanceWindowViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceWindow.objects.all().prefetch_related('affected_apps')
    serializer_class = MaintenanceWindowSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle, MaintenanceRateThrottle, MaintenanceBurstThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MaintenanceWindowFilter
    search_fields = ['title', 'reason']
    ordering_fields = ['scheduled_start', 'scheduled_end', 'created_at']
    ordering = ['-scheduled_start']

    def get_permissions(self):
        if self.action in ['create']:
            self.permission_classes = [CanCreateMaintenance]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [CanCancelMaintenance]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MaintenanceWindowDetailSerializer
        return MaintenanceWindowSerializer

    def perform_create(self, serializer):
        orchestrator = MaintenanceOrchestrator()
        window = orchestrator.schedule_maintenance(
            title=serializer.validated_data['title'],
            maintenance_type=serializer.validated_data['maintenance_type'],
            scheduled_start=serializer.validated_data['scheduled_start'],
            scheduled_end=serializer.validated_data['scheduled_end'],
            triggered_by=self.request.user.id,
            triggered_by_role=getattr(self.request.user, 'role', 'unknown'),
            reason=serializer.validated_data.get('reason', ''),
            affected_app_ids=serializer.validated_data.get('affected_apps', [])
        )
        serializer.instance = window

    @action(detail=True, methods=['post'], permission_classes=[CanStartMaintenance])
    def start(self, request, pk=None):
        window = self.get_object()
        orchestrator = MaintenanceOrchestrator()
        updated = orchestrator.start_maintenance(window.id, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response({'status': updated.status, 'actual_start': updated.actual_start})

    @action(detail=True, methods=['post'], permission_classes=[CanStopMaintenance])
    def stop(self, request, pk=None):
        window = self.get_object()
        orchestrator = MaintenanceOrchestrator()
        updated = orchestrator.stop_maintenance(window.id, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response({'status': updated.status, 'actual_end': updated.actual_end})

    @action(detail=True, methods=['delete'], permission_classes=[CanCancelMaintenance])
    def cancel(self, request, pk=None):
        window = self.get_object()
        if window.status not in ['scheduled']:
            return Response({'error': 'Only scheduled maintenance can be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        window.status = 'cancelled'
        window.save()
        AuditLogger().log_success(AuditAction.CANCEL_MAINTENANCE, request.user.id, getattr(request.user, 'role', 'unknown'), target_id=str(window.id))
        return Response({'status': 'cancelled'})

    @action(detail=False, methods=['post'], permission_classes=[IsConfigAccess])
    def risk_assessment(self, request):
        risk_service = MaintenanceRisk()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        windows = risk_service.assess_and_schedule(system_user_id)
        return Response({'windows_created': len(windows), 'windows': [str(w.id) for w in windows]})

class MaintenanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaintenanceLog.objects.all().select_related('maintenance_window')
    serializer_class = MaintenanceLogSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = MaintenanceLogFilter
    ordering_fields = ['performed_at']
    ordering = ['-performed_at']