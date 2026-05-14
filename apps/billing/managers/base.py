# billing/managers/base.py
from django.db import models
from django.utils import timezone
from typing import Optional, List, Dict, Any
from apps.tenant.services import TenantFilterMixin


class BaseBillingManager(TenantFilterMixin, models.Manager):
    """
    Base manager for all billing models with tenant isolation and common queries.
    """
    
    def get_queryset(self):
        """Apply tenant filtering by default."""
        qs = super().get_queryset()
        return self.filter_by_tenant(qs)
    
    def active(self):
        """Get active records only."""
        return self.get_queryset().filter(is_active=True, is_deleted=False)
    
    def by_tenant(self, tenant_id):
        """Filter by a specific tenant."""
        return self.get_queryset().filter(tenant_id=tenant_id)
    
    def created_between(self, start_date, end_date):
        """Filter by creation date range."""
        return self.get_queryset().filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
    
    def recently_created(self, days=7):
        """Get records created in the last N days."""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff)