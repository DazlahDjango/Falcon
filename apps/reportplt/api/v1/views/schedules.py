# apps/reportplt/api/v1/views/schedules.py
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportSchedule
from apps.reportplt.api.v1.serializers import (
    ScheduleListSerializer, ScheduleDetailSerializer,
    ScheduleCreateSerializer, ScheduleUpdateSerializer,
    ScheduleActionSerializer
)
from apps.reportplt.api.v1.permissions import (
    ScheduleViewPermission, ScheduleCreatePermission,
    ScheduleEditPermission, ScheduleDeletePermission
)
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.scheduler.schedule_manager import ScheduleManager
from apps.reportplt.services.scheduler.scheduler_runner import SchedulerRunner
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class ScheduleViewSet(BaseModelViewSet):
    queryset = ReportSchedule.objects.all()
    search_fields = ['name']
    ordering_fields = ['name', 'next_run_at', 'created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            if self.request.user.role not in ['client_admin', 'hr_admin']:
                queryset = queryset.filter(owner=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ScheduleListSerializer
        elif self.action == 'create':
            return ScheduleCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ScheduleUpdateSerializer
        elif self.action == 'retrieve':
            return ScheduleDetailSerializer
        elif self.action == 'trigger_action':
            return ScheduleActionSerializer
        return ScheduleDetailSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ScheduleViewPermission]
        elif self.action == 'retrieve':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ScheduleViewPermission]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ScheduleCreatePermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ScheduleEditPermission]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ScheduleDeletePermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='action')
    @audit_log(action=AuditAction.EDIT)
    def trigger_action(self, request, pk=None):
        schedule = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        manager = ScheduleManager(request.user)
        if action == 'pause':
            manager.pause_schedule(str(schedule.id))
        elif action == 'resume':
            manager.resume_schedule(str(schedule.id))
        elif action == 'activate':
            manager.activate_schedule(str(schedule.id))
        elif action == 'deactivate':
            manager.deactivate_schedule(str(schedule.id))
        elif action == 'run_now':
            runner = SchedulerRunner()
            runner.run_schedule(str(schedule.id))
        return Response({'status': 'success', 'action': action})

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        schedule = self.get_object()
        executions = schedule.executions.all().order_by('-created_at')[:50]
        from apps.reportplt.api.v1.serializers import ExecutionListSerializer
        serializer = ExecutionListSerializer(executions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='upcoming')
    def upcoming_runs(self, request, pk=None):
        schedule = self.get_object()
        manager = ScheduleManager(request.user)
        runs = manager.get_upcoming_runs(str(schedule.id), 5)
        return Response([r.isoformat() for r in runs])

    @action(detail=False, methods=['get'], url_path='due')
    def due_schedules(self, request):
        manager = ScheduleManager(request.user)
        schedules = manager.get_due_schedules()
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue_schedules(self, request):
        manager = ScheduleManager(request.user)
        schedules = manager.get_overdue_schedules()
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='frequencies')
    def frequencies(self, request):
        from apps.reportplt.constants import ScheduleFrequency
        return Response([{'value': f[0], 'label': f[1]} for f in ScheduleFrequency.CHOICES])