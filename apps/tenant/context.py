"""
apps/tenant/context.py
======================
Per-request, per-thread tenant state.

WHY THREAD-LOCAL INSTEAD OF CACHE
-----------------------------------
A shared cache key (e.g. cache.set('tenant:current', id)) is global across
all concurrent workers. Under load, Worker A's request can overwrite Worker B's
tenant, causing cross-tenant data bleed — a critical CIA Triad (Confidentiality)
violation. Thread-locals are scoped to exactly one OS/green thread and are
automatically isolated between concurrent requests.

USAGE
------
Set at middleware entry:   set_current_tenant_id(tenant_id)
Read anywhere in request:  get_current_tenant_id()
Clear at middleware exit:  clear_current_tenant_id()

The context is automatically cleaned up on response so there is no risk of
stale state leaking into the next request on the same thread.
"""
import threading
import logging

logger = logging.getLogger(__name__)

_thread_local = threading.local()


def set_current_tenant_id(tenant_id: str | None) -> None:
    """
    Store the current request's tenant_id in the thread-local.
    Called once per request by TenantContextMiddleware.
    """
    _thread_local.tenant_id = str(tenant_id) if tenant_id else None
    logger.debug(f"[TenantContext] Tenant set: {_thread_local.tenant_id}")


def get_current_tenant_id() -> str | None:
    """
    Return the tenant_id for the current thread/request.
    Returns None if no tenant context has been set (e.g. shell, management commands).
    """
    return getattr(_thread_local, 'tenant_id', None)


def clear_current_tenant_id() -> None:
    """
    Remove the tenant_id from the thread-local.
    Called by TenantContextMiddleware.process_response to ensure clean state.
    """
    _thread_local.tenant_id = None
    logger.debug("[TenantContext] Tenant context cleared")
