from django.db import models
from django.utils import timezone

class BaseStructureManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    def all_with_deleted(self):
        return super().get_queryset()
    def filtered_by_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id)
    def filter_deleted(self):
        return super().get_queryset().filter(is_deleted=True)
    def delete_by_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id, is_deleted=False).update(is_deleted=True, deleted_at=timezone.now())

class BaseStructureManagerAllAccess(BaseStructureManager):
    def get_queryset(self):
        return super(BaseStructureManager, self).get_queryset()