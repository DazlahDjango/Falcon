from django.db import models
from django.utils import timezone

class BaseQuerySet(models.QuerySet):
    def active(self):
        if hasattr(self.model, 'is_active'):
            return self.filter(is_active=True)
        return self
    
    def deleted(self):
        if hasattr(self.model, 'is_deleted'):
            return self.filter(is_deleted=True)
        return self.none()
    
    def not_deleted(self):
        if hasattr(self.model, 'is_deleted'):
            return self.filter(is_deleted=False)
        return self
    
    def recent(self, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(created_at__gte=cutoff)
    
    def get_or_none(self, **kwargs):
        try:
            return self.get(**kwargs)
        except self.model.DoesNotExist:
            return None
        
class BaseManager(models.Manager):
    def get_queryset(self):
        return BaseQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()
    
    def deleted(self):
        return self.get_queryset().deleted()
    
    def not_deleted(self):
        return self.get_queryset().not_deleted()
    
    def recent(self, days=30):
        return self.get_queryset().recent(days)
    
    def get_or_none(self, **kwargs):
        return self.get_queryset().get_or_none(**kwargs)
    
class TenantAwareQuerySet(BaseQuerySet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._current_tenant_id = None

    def tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)
    
    def for_current_tenant(self):
        if self._current_tenant_id:
            return self.filter(tenant_id=self._current_tenant_id)
        return self
    
    def set_current_tenant(self, tenant_id):
        self._current_tenant_id = tenant_id
        return self
    
    def bulk_creat_tenant_aware(self, objs, tenant_id=None, **kwargs):
        if tenant_id:
            for obj in objs:
                if hasattr(obj, 'tenant_id'):
                    obj.tenant_id = tenant_id
        return super().bulk_create(objs, **kwargs)
    
class TenantAwareManager(BaseManager):
    def get_queryset(self):
        qs = TenantAwareQuerySet(self.model, using=self._db)
        if hasattr(self.model, 'tenant_id'):
            from django.core.cache import cache
            current_tenant = cache.get('current_tenant_id')
            if current_tenant:
                qs = qs.filter(tenant_id=current_tenant)
        return qs
    
    def for_tenant(self, tenant_id):
        return self.get_queryset().tenant(tenant_id)
    
    def tenant_objects(self, tenant_id):
        return self.for_tenant(tenant_id)
    
class SoftDeleteManager(TenantAwareManager):
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.model, 'is_deleted'):
            return qs.filter(is_deleted=False)
        return qs
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        """Return only soft-deleted records."""
        if hasattr(self.model, 'is_deleted'):
            return super().get_queryset().filter(is_deleted=True)
        return self.none()