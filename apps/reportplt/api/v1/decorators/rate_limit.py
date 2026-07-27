# apps/reportplt/api/v1/decorators/rate_limit.py
import hashlib
import logging
from functools import wraps
from typing import Optional, Callable, Union
from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.exceptions import Throttled
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

logger = logging.getLogger(__name__)

def rate_limit(rate: str = '10/min', key_prefix: str = 'rate_limit', scope: str = 'default'):
    """
    Decorator for rate limiting API endpoints.
    
    Args:
        rate: Rate limit string (e.g., '10/min', '100/hour', '1000/day')
        key_prefix: Prefix for cache key
        scope: Rate limit scope for DRF throttles
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            cache_key = _build_rate_limit_key(key_prefix, request, scope)
            limit, period = _parse_rate(rate)
            count = cache.get(cache_key, 0)
            if count >= limit:
                reset_time = cache.get(f"{cache_key}_reset")
                if reset_time:
                    wait = (reset_time - timezone.now()).total_seconds()
                    raise Throttled(wait=wait)
                else:
                    raise Throttled()
            response = func(self, request, *args, **kwargs)
            try:
                new_count = cache.incr(cache_key) if cache.get(cache_key) else 1
                if new_count == 1:
                    cache.set(cache_key, 1, period)
                    cache.set(f"{cache_key}_reset", timezone.now() + timezone.timedelta(seconds=period), period)
                response['X-RateLimit-Limit'] = str(limit)
                response['X-RateLimit-Remaining'] = str(limit - new_count)
                response['X-RateLimit-Reset'] = str(int((cache.get(f"{cache_key}_reset") - timezone.now()).total_seconds()))
            except Exception as e:
                logger.warning(f"Rate limit tracking failed: {str(e)}")
            return response
        return wrapper
    return decorator

def burst_rate_limit(rate: str = '5/sec', burst_rate: str = '100/min', key_prefix: str = 'burst_limit'):
    """
    Decorator for burst rate limiting.
    Allows short bursts but limits overall rate.
    
    Args:
        rate: Sustained rate limit
        burst_rate: Burst rate limit
        key_prefix: Prefix for cache key
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            burst_limit, burst_period = _parse_rate(burst_rate)
            sustained_limit, sustained_period = _parse_rate(rate)
            burst_key = _build_rate_limit_key(f"{key_prefix}_burst", request)
            sustained_key = _build_rate_limit_key(f"{key_prefix}_sustained", request)
            burst_count = cache.get(burst_key, 0)
            sustained_count = cache.get(sustained_key, 0)
            if burst_count >= burst_limit:
                reset_time = cache.get(f"{burst_key}_reset")
                wait = (reset_time - timezone.now()).total_seconds() if reset_time else 60
                raise Throttled(wait=wait)
            if sustained_count >= sustained_limit:
                raise Throttled(wait=sustained_period)
            response = func(self, request, *args, **kwargs)
            try:
                burst_new = cache.incr(burst_key) if cache.get(burst_key) else 1
                if burst_new == 1:
                    cache.set(burst_key, 1, burst_period)
                    cache.set(f"{burst_key}_reset", timezone.now() + timezone.timedelta(seconds=burst_period), burst_period)
                sustained_new = cache.incr(sustained_key) if cache.get(sustained_key) else 1
                if sustained_new == 1:
                    cache.set(sustained_key, 1, sustained_period)
            except Exception as e:
                logger.warning(f"Burst rate limit tracking failed: {str(e)}")
            return response
        return wrapper
    return decorator

def user_rate_limit(rate: str = '100/day', user_specific: bool = True):
    """
    Decorator for user-specific rate limiting.
    
    Args:
        rate: Rate limit string
        user_specific: Whether to rate limit per user
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            key_prefix = 'user_rate_limit'
            if user_specific and hasattr(request, 'user') and request.user.is_authenticated:
                key_prefix = f"user_rate_limit_{request.user.id}"
            return rate_limit(rate, key_prefix)(func)(self, request, *args, **kwargs)
        return wrapper
    return decorator

def _parse_rate(rate: str) -> tuple:
    """
    Parse rate string into (limit, period_seconds).
    Examples: '10/min', '100/hour', '1000/day'
    """
    try:
        num, unit = rate.split('/')
        limit = int(num)
        unit_map = {
            's': 1,
            'sec': 1,
            'second': 1,
            'm': 60,
            'min': 60,
            'minute': 60,
            'h': 3600,
            'hour': 3600,
            'd': 86400,
            'day': 86400,
        }
        period = unit_map.get(unit.lower(), 60)
        return limit, period
    except (ValueError, AttributeError):
        return 10, 60

def _build_rate_limit_key(key_prefix: str, request, scope: str = 'default') -> str:
    parts = [key_prefix, scope]
    if hasattr(request, 'user') and request.user.is_authenticated:
        parts.append(str(request.user.id))
    client_ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
    if client_ip:
        parts.append(client_ip.split(',')[0].strip())
    endpoint = request.path
    if endpoint:
        parts.append(hashlib.md5(endpoint.encode()).hexdigest()[:8])
    return ':'.join(parts)