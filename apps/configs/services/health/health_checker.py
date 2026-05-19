import requests
import json
from django.utils import timezone
from django.core.cache import cache
from apps.configs.models import RegisteredApp, HealthCheck
from apps.configs.constants import HealthStatus

class HealthChecker:
    def check_app(self, app_name):
        app = RegisteredApp.objects.filter(name=app_name).first()
        if not app or not app.health_check_endpoint:
            return HealthCheck.objects.create(
                app=app,
                status=HealthStatus.UNKNOWN,
                message=f"No health endpoint configured for {app_name}"
            )
        try:
            response = requests.get(
                app.health_check_endpoint,
                timeout=10,
                headers={'X-Health-Check': 'true'}
            )
            response_time_ms = int(response.elapsed.total_seconds() * 1000)
            if response.status_code == 200:
                try:
                    data = response.json()
                    status = data.get('status', 'healthy')
                    if status in ['healthy', 'ok', 'pass']:
                        health_status = HealthStatus.HEALTHY
                    elif status in ['degraded', 'warn']:
                        health_status = HealthStatus.DEGRADED
                    else:
                        health_status = HealthStatus.UNHEALTHY
                except:
                    health_status = HealthStatus.HEALTHY
            elif response.status_code >= 500:
                health_status = HealthStatus.UNHEALTHY
            else:
                health_status = HealthStatus.DEGRADED
            health = HealthCheck.objects.create(
                app=app,
                status=health_status,
                status_code=response.status_code,
                response_time_ms=response_time_ms,
                message=f"HTTP {response.status_code}",
                details={'headers': dict(response.headers)}
            )
            if health_status != HealthStatus.HEALTHY:
                self._update_consecutive_failures(app, health)
            return health
        except requests.RequestException as e:
            health = HealthCheck.objects.create(
                app=app,
                status=HealthStatus.UNHEALTHY,
                message=str(e),
                consecutive_failures=self._get_consecutive_failures(app) + 1
            )
            return health
    def check_all_apps(self):
        results = []
        for app in RegisteredApp.objects.filter(is_registered=True):
            results.append(self.check_app(app.name))
        return results
    def _get_consecutive_failures(self, app):
        last_check = HealthCheck.objects.filter(app=app).order_by('-created_at').first()
        if last_check and last_check.status in [HealthStatus.UNHEALTHY, HealthStatus.DEGRADED]:
            return last_check.consecutive_failures
        return 0
    def _update_consecutive_failures(self, app, health):
        health.consecutive_failures = self._get_consecutive_failures(app) + 1
        health.save(update_fields=['consecutive_failures'])