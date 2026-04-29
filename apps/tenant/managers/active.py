# apps/tenant/managers/active.py
"""
Active managers - automatically exclude soft-deleted records.
Use as default manager for models that should never show deleted records.
"""

from django.db import models
from .base import BaseManager


class ActiveManager(BaseManager):
    """
    Manager that automatically filters out soft-deleted records.
    
    Use this as the default manager:
        objects = ActiveManager()
    
    To see deleted records:
        Model.all_with_deleted.all()
    """
    
    def get_queryset(self):
        """Exclude soft-deleted records by default"""
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        """Include soft-deleted records (use when needed)"""
        return super().get_queryset()
    
    def deleted_only(self):
        """Return only soft-deleted records"""
        return super().get_queryset().filter(is_deleted=True)


class ActiveTenantManager(ActiveManager):
    """
    Manager that combines active filtering with tenant awareness.
    Automatically excludes deleted records and can filter by tenant.
    """
    
    def __init__(self, *args, **kwargs):
        self._tenant_id = None
        super().__init__(*args, **kwargs)
    
    def for_tenant(self, tenant_id):
        """Set tenant context"""
        self._tenant_id = tenant_id
        return self
    
    def get_queryset(self):
        qs = super().get_queryset()
        if self._tenant_id:
            return qs.filter(tenant_id=self._tenant_id)
        return qs