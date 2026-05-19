from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import Schedule
from apps.configs.api.v1.serializers import ScheduleSerializer, ScheduleDetailSerializer
from apps.configs.api.v1.permissions import IsSuperAdmin
from apps.configs.api.v1.throttles import ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.api.v1.filters import ScheduleFilter
from apps.configs.services.scheduling.schedule_executor import ScheduleExecutor
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ScheduleFilter
    search_fields = ['name']
    ordering_fields = ['next_run_at', 'created_at']
    ordering = ['next_run_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ScheduleDetailSerializer
        return ScheduleSerializer

    def perform_create(self, serializer):
        from apps.configs.services.scheduling.cron_parser import CronParser
        CronParser().validate(serializer.validated_data['cron_expression'])
        serializer.save(created_by=self.request.user.id, created_by_role=getattr(self.request.user, 'role', 'unknown'))
        AuditLogger().log_success(AuditAction.SCHEDULE_CREATE, self.request.user.id, 'super_admin', target_id=str(serializer.instance.id))

    def perform_update(self, serializer):
        from apps.configs.services.scheduling.cron_parser import CronParser
        if 'cron_expression' in serializer.validated_data:
            CronParser().validate(serializer.validated_data['cron_expression'])
        serializer.save()
        AuditLogger().log_success(AuditAction.SCHEDULE_UPDATE, self.request.user.id, 'super_admin', target_id=str(serializer.instance.id))

    def perform_destroy(self, instance):
        AuditLogger().log_success(AuditAction.SCHEDULE_DELETE, self.request.user.id, 'super_admin', target_id=str(instance.id))
        instance.delete()

    @action(detail=False, methods=['post'])
    def execute_due(self, request):
        executor = ScheduleExecutor()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        results = executor.execute_due_schedules(system_user_id)
        return Response(results)

    @action(detail=False, methods=['post'])
    def evaluate_expressions(self, request):
        from apps.configs.services.scheduling.cron_parser import CronParser
        cron_expression = request.data.get('cron_expression')
        if not cron_expression:
            return Response({'error': 'cron_expression required'}, status=status.HTTP_400_BAD_REQUEST)
        parser = CronParser()
        try:
            parser.validate(cron_expression)
            next_runs = parser.get_multiple_runs(cron_expression, count=5)
            return Response({
                'valid': True,
                'cron_expression': cron_expression,
                'next_runs': [run.isoformat() for run in next_runs]
            })
        except Exception as e:
            return Response({'valid': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)