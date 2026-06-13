from functools import wraps
from django.core.cache import cache
from django.utils import timezone
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)

def idempotent(key_prefix: str, ttl: int = 86400):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            idempotency_key = kwargs.pop('idempotency_key', None) or str(uuid4())
            cache_key = f"idempotent:{key_prefix}:{idempotency_key}"
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.info(f"Idempotent hit for {key_prefix}:{idempotency_key}")
                return cached_result
            result = func(*args, **kwargs, idempotency_key=idempotency_key)
            cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

def circuit_breaker(name: str, failure_threshold: int = 5, timeout_seconds: int = 60):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            state_key = f"circuit:{name}:state"
            failures_key = f"circuit:{name}:failures"
            opened_key = f"circuit:{name}:opened_at"
            state = cache.get(state_key, 'CLOSED')
            if state == 'OPEN':
                opened_at = cache.get(opened_key)
                if opened_at and (timezone.now() - opened_at).total_seconds() > timeout_seconds:
                    cache.set(state_key, 'HALF_OPEN')
                    logger.info(f"Circuit {name} transitioning from OPEN to HALF_OPEN")
                else:
                    raise Exception(f"Circuit {name} is OPEN - service unavailable")
            try:
                result = func(*args, **kwargs)
                if state == 'HALF_OPEN':
                    cache.set(state_key, 'CLOSED')
                    cache.delete(failures_key)
                    logger.info(f"Circuit {name} closed after successful HALF_OPEN call")
                return result
            except Exception as e:
                failures = cache.get(failures_key, 0) + 1
                cache.set(failures_key, failures)
                if failures >= failure_threshold:
                    cache.set(state_key, 'OPEN')
                    cache.set(opened_key, timezone.now())
                    logger.error(f"Circuit {name} opened after {failures} failures")
                raise e
        return wrapper
    return decorator

def tenant_isolation(model_class):
    def decorator(func):
        @wraps(func)
        def wrapper(tenant_id: str, *args, **kwargs):
            if not tenant_id:
                raise ValueError("tenant_id is required")
            return func(tenant_id, *args, **kwargs)
        return wrapper
    return decorator

def audit_log(action: str, resource_type: str):
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            from services.audit.logger import audit_logger
            tenant_id = kwargs.get('tenant_id') or (args[0] if args and hasattr(args[0], 'tenant_id') else None)
            resource_id = kwargs.get('resource_id') or (str(args[0].id) if args and hasattr(args[0], 'id') else None)
            before_state = None
            if args and hasattr(args[0], '__dict__'):
                before_state = {k: str(v) for k, v in args[0].__dict__.items() if not k.startswith('_')}
            result = func(*args, **kwargs)
            after_state = None
            if result and hasattr(result, '__dict__'):
                after_state = {k: str(v) for k, v in result.__dict__.items() if not k.startswith('_')}
            audit_logger.log(user=None, tenant_id=tenant_id, action=action, resource_type=resource_type, resource_id=resource_id or str(id(result)), before=before_state, after=after_state)
            return result
        return wrapper
    return decorator