# apps/reportplt/models/base.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(_('tenant_id'), db_index=True, editable=False, null=True, blank=True)
    created_at = models.DateTimeField(_('created_at'), default=timezone.now, editable=False)
    updated_at = models.DateTimeField(_('updated_at'), auto_now=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_created', editable=False)
    modified_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_modified', editable=False)
    is_deleted = models.BooleanField(_('is_deleted'), default=False)
    deleted_at = models.DateTimeField(_('deleted_at'), null=True, blank=True)
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def hard_delete(self):
        super().delete()
    
    def get_tenant(self):
        from apps.tenant.models import Organization
        try:
            return Organization.objects.get(id=self.tenant_id)
        except Organization.DoesNotExist:
            return None
    
    @property
    def tenant(self):
        return self.get_tenant()
    
    def __str__(self):
        return f"{self.__class__.__name__}({self.id})"