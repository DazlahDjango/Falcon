# apps/configs/middleware/config_access_middleware.py
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

class ConfigAccessMiddleware(MiddlewareMixin):
    CONFIG_PATHS = ['/api/v1/config/', '/admin/config/']
    
    def process_request(self, request):
        for path in self.CONFIG_PATHS:
            if request.path.startswith(path):
                # For API endpoints, SKIP authentication check in middleware
                # DRF's JWTAuthentication will handle it in the view
                if request.path.startswith('/api/v1/config/'):
                    # Don't check auth here - let DRF handle it
                    return None
                
                # For admin paths, check session authentication
                if not hasattr(request, 'user') or not request.user.is_authenticated:
                    return JsonResponse({
                        'error': 'authentication_required', 
                        'message': 'Authentication required for Config access'
                    }, status=401)
                
                user_role = getattr(request.user, 'role', None)
                if user_role not in ['super_admin', 'client_admin']:
                    return JsonResponse({
                        'error': 'permission_denied',
                        'message': 'Config app access restricted to Super Admin and Client Admin only',
                        'required_roles': ['super_admin', 'client_admin']
                    }, status=403)
        return None