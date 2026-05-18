from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import re

class ConfigAccessMiddleware(MiddlewareMixin):
    CONFIG_PATHS = ['/api/v1/config/', '/admin/config/']
    
    def process_request(self, request):
        for path in self.CONFIG_PATHS:
            if request.path.startswith(path):
                if not hasattr(request, 'user') or not request.user.is_authenticated:
                    return JsonResponse({'error': 'authentication_required', 'message': 'Authentication required for Config access'}, status=401)
                user_role = getattr(request.user, 'role', None)
                if user_role not in ['super_admin', 'client_admin']:
                    return JsonResponse({
                        'error': 'permission_denied',
                        'message': 'Config app access restricted to Super Admin and Client Admin only',
                        'required_roles': ['super_admin', 'client_admin']
                    }, status=403)
        return None