import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
User = get_user_model()

class TenantScopedQuerySet(models.QuerySet):
    def for_tenant(self, tenant_id=None):
        if not tenant_id:
            try:
                from apps.tenant.context import get_current_tenant_id
                tenant_id = get_current_tenant_id()
            except ImportError:
                tenant_id = None
        if tenant_id and hasattr(self.model, 'tenant_id'):
            return self.filter(tenant_id=tenant_id)
        return self

    def alive(self):
        if hasattr(self.model, 'is_deleted'):
            return self.filter(is_deleted=False)
        return self


class TenantScopedManager(models.Manager):
    def get_queryset(self):
        qs = TenantScopedQuerySet(self.model, using=self._db)
        if hasattr(self.model, 'is_deleted'):
            qs = qs.filter(is_deleted=False)
        try:
            from apps.tenant.context import get_current_tenant_id
            tid = get_current_tenant_id()
            if tid and hasattr(self.model, 'tenant_id'):
                qs = qs.filter(tenant_id=tid)
        except ImportError:
            pass
        return qs

    def all_with_deleted(self):
        qs = TenantScopedQuerySet(self.model, using=self._db)
        try:
            from apps.tenant.context import get_current_tenant_id
            tid = get_current_tenant_id()
            if tid and hasattr(self.model, 'tenant_id'):
                qs = qs.filter(tenant_id=tid)
        except ImportError:
            pass
        return qs


class BaseKPIModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(db_index=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+', editable=False)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+', editable=False)

    objects = TenantScopedManager()

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['tenant_id', 'created_at']),
        ]


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    class Meta:
        abstract = True

    def soft_delete(self, user=None):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])

    def hard_delete(self):
        super().delete()