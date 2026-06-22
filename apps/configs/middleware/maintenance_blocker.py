from django.http import JsonResponse, HttpResponse
from django.template.loader import render_to_string
from django.utils.deprecation import MiddlewareMixin
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode

class MaintenanceBlockerMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if user.is_superuser or getattr(user, 'role', None) == 'super_admin':
                return None

        mode = MaintenanceMode()
        if mode.is_active() and mode.get_type() == 'full':
            if request.path.startswith('/api/') or request.path.startswith('/admin/'):
                return JsonResponse({
                    'error': 'maintenance_mode',
                    'message': mode.get_message(),
                    'maintenance_type': 'full',
                    'estimated_completion': None
                }, status=503)
            elif not request.path.startswith('/static/') and not request.path.startswith('/media/'):
                return HttpResponse(render_to_string('config/maintenance.html', {
                    'message': mode.get_message(),
                    'maintenance_type': 'full'
                }), status=503)
        return None