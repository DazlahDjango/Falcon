from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.http import JsonResponse

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
                ).select_related('department', 'team', 'position').first()
                enforcer = HierarchyAccessEnforcer()
                context = {
                    'tenant_id': str(tenant_id),
                    'user_id': str(user_id),
                    'department_id': str(employment.department_id) if employment else None,
                    'team_id': str(employment.team_id) if employment else None,
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
        # DRF authenticates JWT on the view; Django's request.user is often still
        # AnonymousUser in process_request, which caused every write (POST/PATCH/…) to
        # return 401 here while GET was exempt. Authorization for structure writes is
        # enforced by DRF permission classes (e.g. CanEditDepartment).
        return None

class StructureRateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.path.startswith('/api/v1/structure/'):
            return None
        from django.core.cache import cache
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