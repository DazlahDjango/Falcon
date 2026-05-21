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
        from apps.configs.services.settings import ConfigSettingsService
        evaluation = self.evaluate(app_name)
        if not evaluation['healthy']:
            thresholds = ConfigSettingsService.get_alert_thresholds()
            failure_limit = thresholds.get('health_check_consecutive_failures', 3)
            unhealthy_count = HealthCheck.objects.filter(
                app__name=app_name,
                status__in=[HealthStatus.UNHEALTHY, HealthStatus.DEGRADED],
                created_at__gte=timezone.now() - timezone.timedelta(minutes=30)
            ).count()
            return unhealthy_count >= failure_limit
        return False
    def _get_thresholds(self, app_name):
        from apps.configs.services.settings import ConfigSettingsService
        platform = ConfigSettingsService.get_alert_thresholds()
        app = RegisteredApp.objects.filter(name=app_name).first()
        app_thresholds = (app.metadata or {}).get('thresholds', {}) if app else {}
        return {
            'consecutive_failures': app_thresholds.get(
                'consecutive_failures', platform.get('health_check_consecutive_failures', 3),
            ),
            'max_response_ms': app_thresholds.get('max_response_ms', platform.get('max_response_ms', 5000)),
        }