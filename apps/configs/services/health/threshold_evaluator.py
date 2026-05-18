from django.utils import timezone
from apps.configs.models import HealthCheck, RegisteredApp
from apps.configs.constants import HealthStatus

class ThresholdEvaluator:
    def evaluate(self, app_name):
        from apps.configs.services.health.health_checker import HealthChecker
        checker = HealthChecker()
        health = checker.check_app(app_name)
        thresholds = self._get_thresholds(app_name)
        alerts = []
        if health.status == HealthStatus.UNHEALTHY:
            alerts.append({'type': 'critical', 'message': f"App {app_name} is unhealthy"})
        if health.consecutive_failures >= thresholds.get('consecutive_failures', 3):
            alerts.append({'type': 'warning', 'message': f"App {app_name} has {health.consecutive_failures} consecutive failures"})
        if health.response_time_ms and health.response_time_ms > thresholds.get('max_response_ms', 5000):
            alerts.append({'type': 'warning', 'message': f"App {app_name} response time {health.response_time_ms}ms exceeds threshold"})
        return {'healthy': health.status == HealthStatus.HEALTHY, 'alerts': alerts, 'health': health}
    def should_trigger_maintenance(self, app_name):
        evaluation = self.evaluate(app_name)
        if not evaluation['healthy']:
            unhealthy_count = HealthCheck.objects.filter(
                app__name=app_name,
                status__in=[HealthStatus.UNHEALTHY, HealthStatus.DEGRADED],
                created_at__gte=timezone.now() - timezone.timedelta(minutes=30)
            ).count()
            return unhealthy_count >= 3
        return False
    def _get_thresholds(self, app_name):
        app = RegisteredApp.objects.filter(name=app_name).first()
        if not app:
            return {'consecutive_failures': 3, 'max_response_ms': 5000}
        return app.metadata.get('thresholds', {'consecutive_failures': 3, 'max_response_ms': 5000})