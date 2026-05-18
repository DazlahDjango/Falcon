from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import DisasterRecoveryPlan, DisasterRecoveryExecution
from apps.configs.api.v1.serializers import DisasterRecoveryPlanSerializer, DisasterRecoveryPlanDetailSerializer, DisasterRecoveryExecutionSerializer, DRExecuteSerializer
from apps.configs.api.v1.permissions import CanExecuteDR, CanRunDRDrill, CanFailover, CanFailback, IsConfigAccess, IsSuperAdmin
from apps.configs.api.v1.throttles import DRRateThrottle, DRBurstThrottle, ConfigReadThrottle
from apps.configs.api.v1.filters import DisasterRecoveryPlanFilter, DisasterRecoveryExecutionFilter
from apps.configs.services.disaster_recovery.dr_orchestrator import DisasterRecoveryOrchestrator
from apps.configs.services.disaster_recovery.dr_metrics import DisasterRecoveryMetrics
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class DisasterRecoveryPlanViewSet(viewsets.ModelViewSet):
    queryset = DisasterRecoveryPlan.objects.all().select_related('app')
    serializer_class = DisasterRecoveryPlanSerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigReadThrottle, DRRateThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DisasterRecoveryPlanFilter
    search_fields = ['name', 'app__name']
    ordering_fields = ['created_at', 'last_tested_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DisasterRecoveryPlanDetailSerializer
        return DisasterRecoveryPlanSerializer

    def perform_create(self, serializer):
        serializer.save(owned_by=self.request.user.id)

    @action(detail=True, methods=['post'], permission_classes=[CanExecuteDR], throttle_classes=[DRBurstThrottle])
    def execute(self, request, pk=None):
        plan = self.get_object()
        dr_orchestrator = DisasterRecoveryOrchestrator()
        execution = dr_orchestrator.execute_dr_plan(plan.id, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response({'execution_id': str(execution.id), 'status': execution.status}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['post'], permission_classes=[CanRunDRDrill])
    def drill(self, request, pk=None):
        plan = self.get_object()
        dr_orchestrator = DisasterRecoveryOrchestrator()
        execution = dr_orchestrator.run_dr_drill(plan.id, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response({'drill_id': str(execution.id), 'status': execution.status})

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        metrics = DisasterRecoveryMetrics()
        app_name = request.query_params.get('app_name')
        from apps.configs.models import RegisteredApp
        if app_name:
            app = RegisteredApp.objects.filter(name=app_name).first()
            app_id = app.id if app else None
        else:
            app_id = None
        data = {
            'rto_achievement_rate': metrics.get_rto_achievement_rate(app_id),
            'rpo_achievement_rate': metrics.get_rpo_achievement_rate(app_id),
            'drill_success_rate': metrics.get_drill_success_rate(app_id),
        }
        return Response(data)

class DisasterRecoveryExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DisasterRecoveryExecution.objects.all().select_related('dr_plan__app')
    serializer_class = DisasterRecoveryExecutionSerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = DisasterRecoveryExecutionFilter
    ordering_fields = ['triggered_at', 'completed_at']
    ordering = ['-triggered_at']

    @action(detail=True, methods=['post'], permission_classes=[CanFailover])
    def failover(self, request, pk=None):
        execution = self.get_object()
        app_name = execution.dr_plan.app.name
        dr_orchestrator = DisasterRecoveryOrchestrator()
        result = dr_orchestrator.perform_failover(app_name, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response(result)

    @action(detail=True, methods=['post'], permission_classes=[CanFailback])
    def failback(self, request, pk=None):
        execution = self.get_object()
        app_name = execution.dr_plan.app.name
        dr_orchestrator = DisasterRecoveryOrchestrator()
        result = dr_orchestrator.perform_failback(app_name, request.user.id, getattr(request.user, 'role', 'unknown'))
        return Response(result)