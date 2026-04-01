"""
Utilities for tenant management
Provides thread-local storage for the current tenant
"""

import threading
from contextlib import contextmanager

# ============================================================
# THREAD-LOCAL STORAGE
# ============================================================
# Each request runs in its own thread.
# _current_tenant stores data that is unique to each thread.
# This prevents cross-request data mixing.
# ============================================================

_current_tenant = threading.local()


# ============================================================
# SET CURRENT TENANT
# ============================================================
def set_current_tenant(organisation):
    """
    Store the current organisation in thread-local storage.

    Called by middleware after identifying which tenant is making the request.

    Args:
        organisation: Organisation instance for the current request

    Example:
        # In middleware
        organisation = get_organisation_from_host(request.get_host())
        set_current_tenant(organisation)
    """
    _current_tenant.organisation = organisation


# ============================================================
# GET CURRENT TENANT
# ============================================================
def get_current_tenant():
    """
    Retrieve the current organisation from thread-local storage.

    Used by model managers to automatically filter queries by tenant.

    Returns:
        Organisation instance or None if not set

    Example:
        # In a model manager
        current_tenant = get_current_tenant()
        if current_tenant:
            return self.filter(organisation=current_tenant)
        return self.all()
    """
    return getattr(_current_tenant, 'organisation', None)


# ============================================================
# CLEAR CURRENT TENANT
# ============================================================
def clear_current_tenant():
    """
    Remove the current organisation from thread-local storage.

    Called by middleware after the response is sent.
    This prevents tenant data from leaking into the next request.

    Important: Threads are reused between requests, so we must clear!
    """
    if hasattr(_current_tenant, 'organisation'):
        del _current_tenant.organisation


# ============================================================
# TENANT MANAGER MIXIN
# ============================================================
class TenantManagerMixin:
    """
    Mixin for Django model managers to automatically filter by current tenant.

    Add this to any manager that needs tenant isolation.

    Example:
        class OrganisationManager(TenantManagerMixin, models.Manager):
            pass

        class Organisation(models.Model):
            objects = OrganisationManager()
    """

    def get_queryset(self):
        """
        Override get_queryset to automatically filter by current tenant.

        Returns:
            QuerySet filtered by current tenant (if available)
        """
        queryset = super().get_queryset()
        current_tenant = get_current_tenant()

        # Only filter if:
        # 1. We have a current tenant
        # 2. The model has an 'organisation' field (for tenant isolation)
        if current_tenant and hasattr(self.model, 'organisation'):
            return queryset.filter(organisation=current_tenant)

        return queryset


# ============================================================
# CONTEXT MANAGER (for testing and scripts)
# ============================================================
@contextmanager
def tenant_context(organisation):
    """
    Context manager for temporarily setting a tenant.

    Useful for testing or scripts where you need to run code as a specific tenant.

    Example:
        with tenant_context(my_organisation):
            # All queries here are automatically filtered to my_organisation
            departments = Department.objects.all()

    Args:
        organisation: Organisation to use as current tenant
    """
    previous_tenant = get_current_tenant()
    set_current_tenant(organisation)
    try:
        yield
    finally:
        if previous_tenant:
            set_current_tenant(previous_tenant)
        else:
            clear_current_tenant()