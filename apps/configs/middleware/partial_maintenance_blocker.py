from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode
import re

class PartialMaintenanceBlockerMiddleware(MiddlewareMixin):
    APP_PATH_MAPPING = {
        'accounts': ['/api/v1/accounts/', '/api/v1/auth/', '/admin/accounts/'],
        'kpi': ['/api/v1/kpi/', '/admin/kpi/'],
        'billing': ['/api/v1/billing/', '/admin/billing/'],
        'reviews': ['/api/v1/reviews/', '/admin/reviews/'],
        'tenant': ['/api/v1/tenant/', '/api/v1/tenants/', '/admin/tenant/', '/admin/tenants/'],
        'structure': ['/api/v1/structure/', '/admin/structure/'],
        'dashboard': ['/api/v1/dashboard/', '/admin/dashboard/'],
    }
    
    def process_request(self, request):
        mode = MaintenanceMode()
        if mode.is_active() and mode.get_type() == 'partial':
            affected_apps = mode.get_affected_apps()
            for app_name in affected_apps:
                for path_pattern in self.APP_PATH_MAPPING.get(app_name, []):
                    if request.path.startswith(path_pattern):
                        return JsonResponse({
                            'error': 'partial_maintenance',
                            'message': f"{app_name} app is under maintenance. {mode.get_message()}",
                            'maintenance_type': 'partial',
                            'affected_app': app_name
                        }, status=503)
        return None