from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


class StructureContextMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not hasattr(request, 'user') or not request.user or not request.user.is_authenticated:
            return None
        
        from .services.security.hierarchy_access import HierarchyAccessEnforcer
        from .models.employment import Employment
        
        tenant_id = getattr(request.user, 'tenant_id', None)
        user_id = getattr(request.user, 'id', None)
        
        if tenant_id and user_id:
            cache_key = f"structure:context:{tenant_id}:{user_id}"
            context = cache.get(cache_key)
            
            if not context:
                employment = Employment.objects.filter(
                    user_id=user_id,
                    tenant_id=tenant_id,
                    is_current=True,
                    is_deleted=False,
                    is_active=True
                ).select_related('position').first()
                
                enforcer = HierarchyAccessEnforcer()
                
                pos = employment.position if employment else None
                context = {
                    'tenant_id': str(tenant_id),
                    'user_id': str(user_id),
                    'division_id': str(getattr(employment, 'division_id', getattr(pos, 'division_id', None))),
                    'department_id': str(getattr(employment, 'department_id', getattr(pos, 'department_id', None))),
                    'section_id': str(getattr(employment, 'section_id', getattr(pos, 'section_id', None))),
                    'unit_id': str(getattr(employment, 'unit_id', getattr(pos, 'unit_id', None))),
                    'position_id': str(employment.position_id) if employment else None,
                    'is_manager': employment.is_manager if employment else False,
                    'is_executive': employment.is_executive if employment else False,
                    'access_level': enforcer.get_access_level(user_id, user_id, tenant_id)
                }
                cache.set(cache_key, context, 300)
            
            request.structure_context = context
        
        return None


class StructureCacheMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.path.startswith('/api/v1/structure/'):
            if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                response['X-Cache-Invalidate'] = 'structure'
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            else:
                response['Cache-Control'] = 'private, max-age=60'
                response['Vary'] = 'Accept, Authorization'
        return response


class StructureAccessEnforcerMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/api/v1/structure/'):
            return None
        if request.method == 'GET':
            return None
        return None


class StructureRateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/api/v1/structure/'):
            return None
        
        from django.core.cache import cache
        
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            if request.user.is_superuser or getattr(request.user, 'role', None) == 'super_admin':
                return None
        
        if not hasattr(request, 'user') or not request.user or not request.user.is_authenticated:
            identifier = request.META.get('REMOTE_ADDR', 'unknown')
        else:
            identifier = f"user_{request.user.id}"
        
        method = request.method
        path = request.path
        
        if method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            key = f"ratelimit:structure:write:{identifier}"
            limit = 100
            window = 60
        else:
            key = f"ratelimit:structure:read:{identifier}"
            limit = 500
            window = 60
        
        current = cache.get(key, 0)
        if current >= limit:
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'retry_after': window,
                'limit': limit
            }, status=429)
        
        cache.set(key, current + 1, window)
        return None