# apps/tenant/managers/base.py
"""
Base managers for Tenant app.
Provides common query methods that all other managers inherit from.
"""

from django.db import models
from django.utils import timezone


class BaseManager(models.Manager):
    """
    Base manager with common query methods.
    All other managers should inherit from this.
    """

    def get_queryset(self):
        """Return all records including soft-deleted ones"""
        return super().get_queryset()

    def active(self):
        """Return only active (not soft-deleted) records"""
        return self.get_queryset().filter(is_deleted=False)

    def deleted(self):
        """Return only soft-deleted records"""
        return self.get_queryset().filter(is_deleted=True)

    def recent(self, days=30):
        """Return records created in the last X days"""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff)

    def by_tenant(self, tenant_id):
        """Filter records by tenant_id"""
        return self.get_queryset().filter(tenant_id=tenant_id)


class TenantAwareManager(BaseManager):
    """
    Manager that can be scoped to a specific tenant.
    Useful for tenant-specific queries.
    """

    def __init__(self, *args, **kwargs):
        self._tenant_id = None
        super().__init__(*args, **kwargs)

    def for_tenant(self, tenant_id):
        """Set tenant context for this manager instance"""
        self._tenant_id = tenant_id
        return self

    def get_queryset(self):
        qs = super().get_queryset()
        if self._tenant_id:
            return qs.filter(tenant_id=self._tenant_id)
        return qs
