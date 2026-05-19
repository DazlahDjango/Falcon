from django.db import models
from django.utils import timezone

class BaseBillingManager(models.Manager):
    def get_queryset(self):
        """Return only non-deleted records by default."""
        return super().get_queryset().filter(is_deleted=False)
    
    def all_including_deleted(self):
        """Return all records including soft-deleted ones."""
        return super().get_queryset()
    
    def deleted_only(self):
        """Return only soft-deleted records."""
        return super().get_queryset().filter(is_deleted=True)
    
    def get_by_id(self, record_id):
        """Get record by ID, raising exception if not found."""
        return self.get_queryset().get(id=record_id)
    
    def exists_by_id(self, record_id):
        """Check if record exists by ID."""
        return self.get_queryset().filter(id=record_id).exists()
    
    def get_or_none(self, **kwargs):
        """Get record or return None."""
        try:
            return self.get_queryset().get(**kwargs)
        except self.model.DoesNotExist:
            return None


class SoftDeleteManager(BaseBillingManager):
    def hard_delete(self):
        """Permanently delete all records in queryset."""
        return super().get_queryset().delete()
    
    def hard_delete_by_id(self, record_id):
        """Permanently delete a record by ID."""
        return super().get_queryset().filter(id=record_id).delete()
    
    def restore(self):
        """Restore soft-deleted records."""
        return super().get_queryset().filter(is_deleted=True).update(is_deleted=False, deleted_at=None)


class TenantAwareManager(BaseBillingManager):    
    def __init__(self, tenant_id=None, *args, **kwargs):
        self._tenant_id = tenant_id
        super().__init__(*args, **kwargs)
    
    def get_queryset(self):
        qs = super().get_queryset()
        if self._tenant_id:
            qs = qs.filter(tenant_id=self._tenant_id)
        return qs
    
    def for_tenant(self, tenant_id):
        return self.__class__(tenant_id=tenant_id)
    
    def get_by_tenant_and_id(self, tenant_id, record_id):
        """Get record by tenant and ID - ensures tenant isolation."""
        return self.get_queryset().filter(tenant_id=tenant_id, id=record_id).first()
    
    def tenant_exists(self, tenant_id, **kwargs):
        """Check if any record exists for tenant with optional filters."""
        return self.get_queryset().filter(tenant_id=tenant_id, **kwargs).exists()