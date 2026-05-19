from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from apps.configs.models import HealthCheck, HealthCheckHistory
from apps.configs.api.v1.serializers import HealthCheckSerializer, HealthCheckHistorySerializer
from apps.configs.api.v1.permissions import IsConfigAccess
from apps.configs.api.v1.throttles import ConfigReadThrottle
from apps.configs.api.v1.filters import HealthCheckFilter, HealthCheckHistoryFilter
from apps.configs.services.health.health_checker import HealthChecker
from apps.configs.services.health.metric_collector import MetricCollector
from apps.configs.services.health.threshold_evaluator import ThresholdEvaluator
from apps.configs.services.health.conditional_trigger import ConditionalTrigger

class HealthCheckViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HealthCheck.objects.all().select_related('app')
    serializer_class = HealthCheckSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = HealthCheckFilter
    ordering_fields = ['created_at', 'response_time_ms']
    ordering = ['-created_at']

    @action(detail=False, methods=['post'])
    def check_all(self, request):
        checker = HealthChecker()
        results = checker.check_all_apps()
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        app_name = request.query_params.get('app_name')
        if app_name:
            from apps.configs.models import RegisteredApp
            app = RegisteredApp.objects.filter(name=app_name).first()
            if app:
                latest = HealthCheck.objects.filter(app=app).order_by('-created_at').first()
                serializer = self.get_serializer(latest)
                return Response(serializer.data)
        latest_all = []
        from django.db.models import Max
        apps = HealthCheck.objects.values('app').annotate(latest=Max('created_at'))
        for item in apps:
            health = HealthCheck.objects.filter(app_id=item['app'], created_at=item['latest']).first()
            if health:
                latest_all.append(self.get_serializer(health).data)
        return Response(latest_all)

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        collector = MetricCollector()
        system_metrics = collector.collect_system_metrics()
        db_metrics = collector.collect_database_metrics()
        return Response({'system': system_metrics, 'database': db_metrics})

    @action(detail=False, methods=['post'])
    def evaluate_thresholds(self, request):
        evaluator = ThresholdEvaluator()
        app_name = request.data.get('app_name')
        if app_name:
            result = evaluator.evaluate(app_name)
            return Response(result)
        return Response({'error': 'app_name required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def conditional_trigger(self, request):
        trigger = ConditionalTrigger()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        windows = trigger.check_and_trigger(system_user_id)
        return Response({'windows_triggered': len(windows), 'window_ids': [str(w.id) for w in windows]})

class HealthCheckHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HealthCheckHistory.objects.all().select_related('app')
    serializer_class = HealthCheckHistorySerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = HealthCheckHistoryFilter
    ordering_fields = ['changed_at']
    ordering = ['-changed_at']