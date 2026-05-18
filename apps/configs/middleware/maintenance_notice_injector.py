from django.utils.deprecation import MiddlewareMixin
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode

class MaintenanceNoticeInjectorMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        mode = MaintenanceMode()
        if mode.is_active():
            response['X-Maintenance-Mode'] = mode.get_type()
            response['X-Maintenance-Message'] = mode.get_message()
            if mode.get_type() == 'partial':
                response['X-Maintenance-Affected-Apps'] = ','.join(mode.get_affected_apps())
        return response