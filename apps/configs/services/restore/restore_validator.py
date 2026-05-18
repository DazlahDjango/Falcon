from django.apps import apps
from apps.configs.models import RegisteredApp, HealthCheck
from apps.configs.services.health.health_checker import HealthChecker
from apps.configs.constants import HealthStatus

class RestoreValidator:
    def __init__(self):
        self.health_checker = HealthChecker()
    def validate_restore(self, app_name):
        app_config = apps.get_app_config(app_name)
        try:
            health = self.health_checker.check_app(app_name)
            if health.status == HealthStatus.HEALTHY:
                return {'valid': True, 'message': 'App is healthy after restore'}
            else:
                return {'valid': False, 'message': f'App health check returned {health.status}', 'details': health.details}
        except Exception as e:
            return {'valid': False, 'message': f'Health check failed: {str(e)}'}
    def validate_all_restored(self, app_names=None):
        if app_names:
            apps_to_check = app_names
        else:
            apps_to_check = RegisteredApp.objects.filter(is_registered=True).values_list('name', flat=True)
        results = {}
        all_valid = True
        for app_name in apps_to_check:
            result = self.validate_restore(app_name)
            results[app_name] = result
            if not result['valid']:
                all_valid = False
        return {'valid': all_valid, 'results': results}