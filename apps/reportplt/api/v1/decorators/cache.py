# apps/reportplt/api/v1/decorators/cache.py
import hashlib
import json
import logging
from functools import wraps
from typing import Optional, Callable, Dict, Any
from django.core.cache import cache
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)

def cache_response(ttl: int = 3600, key_prefix: str = 'report', vary_on_user: bool = True, vary_on_tenant: bool = True):
    """
    Decorator to cache API responses.
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
        vary_on_user: Include user ID in cache key
        vary_on_tenant: Include tenant ID in cache key
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            cache_key = _build_cache_key(
                func.__name__,
                request,
                key_prefix,
                vary_on_user,
                vary_on_tenant,
                args,
                kwargs
            )
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                logger.debug(f"Cache hit: {cache_key}")
                response = JsonResponse(cached_response, status=200)
                response['X-Cache'] = 'HIT'
                return response
            response = func(self, request, *args, **kwargs)
            if response.status_code == 200:
                try:
                    if isinstance(response, JsonResponse):
                        data = response.data
                    elif isinstance(response, HttpResponse) and response.get('Content-Type', '').startswith('application/json'):
                        data = json.loads(response.content)
                    else:
                        data = None
                    if data is not None:
                        cache.set(cache_key, data, ttl)
                        response['X-Cache'] = 'MISS'
                        logger.debug(f"Cache set: {cache_key}")
                except Exception as e:
                    logger.warning(f"Failed to cache response: {str(e)}")
            return response
        return wrapper
    return decorator

def cache_report_data(ttl: int = 300, key_prefix: str = 'report_data'):
    """
    Decorator specifically for caching report data.
    Uses report ID and parameters as part of cache key.
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            report_id = kwargs.get('report_id') or getattr(request, 'report_id', None)
            if not report_id:
                return func(self, request, *args, **kwargs)
            params = request.GET.dict() or {}
            param_str = json.dumps(sorted(params.items()), sort_keys=True)
            cache_key = f"{key_prefix}:{report_id}:{hashlib.md5(param_str.encode()).hexdigest()}"
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return JsonResponse(cached_data, status=200)
            response = func(self, request, *args, **kwargs)
            if response.status_code == 200:
                try:
                    if isinstance(response, JsonResponse):
                        data = response.data
                        cache.set(cache_key, data, ttl)
                except Exception as e:
                    logger.warning(f"Failed to cache report data: {str(e)}")
            return response
        return wrapper
    return decorator

def invalidate_cache(key_pattern: Optional[str] = None, report_id: Optional[str] = None):
    """
    Decorator to invalidate cache after operation.
    
    Args:
        key_pattern: Pattern to match cache keys
        report_id: Specific report ID to invalidate
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            response = func(self, request, *args, **kwargs)
            try:
                if report_id:
                    _invalidate_report_cache(report_id)
                if key_pattern:
                    _invalidate_by_pattern(key_pattern)
                if not report_id and not key_pattern:
                    _invalidate_all_report_cache()
                logger.debug(f"Cache invalidated: report_id={report_id}, pattern={key_pattern}")
            except Exception as e:
                logger.warning(f"Failed to invalidate cache: {str(e)}")
            return response
        return wrapper
    return decorator

def _build_cache_key(func_name: str, request, key_prefix: str, vary_on_user: bool, vary_on_tenant: bool, args, kwargs) -> str:
    parts = [key_prefix, func_name]
    if vary_on_tenant:
        tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'report_context', {}).get('tenant_id')
        if tenant_id:
            parts.append(str(tenant_id))
    if vary_on_user and hasattr(request, 'user') and request.user.is_authenticated:
        parts.append(str(request.user.id))
    if request.GET:
        sorted_params = sorted(request.GET.items())
        parts.append(hashlib.md5(json.dumps(sorted_params).encode()).hexdigest())
    if args:
        parts.append(str(args))
    if kwargs:
        kwargs_str = json.dumps(kwargs, sort_keys=True)
        parts.append(hashlib.md5(kwargs_str.encode()).hexdigest())
    return ':'.join(parts)

def _invalidate_report_cache(report_id: str):
    from django.core.cache import cache
    keys_to_delete = []
    for key in cache._cache.keys() if hasattr(cache, '_cache') else []:
        if f'report_data:{report_id}' in key or f'report:{report_id}' in key:
            keys_to_delete.append(key)
    for key in keys_to_delete:
        cache.delete(key)

def _invalidate_by_pattern(pattern: str):
    from django.core.cache import cache
    keys_to_delete = []
    for key in cache._cache.keys() if hasattr(cache, '_cache') else []:
        if pattern in key:
            keys_to_delete.append(key)
    for key in keys_to_delete:
        cache.delete(key)

def _invalidate_all_report_cache():
    from django.core.cache import cache
    keys_to_delete = []
    for key in cache._cache.keys() if hasattr(cache, '_cache') else []:
        if key.startswith('report:') or key.startswith('report_data:') or key.startswith('dashboard:'):
            keys_to_delete.append(key)
    for key in keys_to_delete:
        cache.delete(key)