import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class UUIDModel(models.Model):
    """UUID is our primary key"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class Meta:
        abstract = True

class TimestampModel(models.Model):
    created_at = models.DateTimeField(_("created_at"), default=timezone.now, editable=False)
    updated_at = models.DateTimeField(_("updated_at"), auto_now=True)

    class Meta:
        abstract = True
    
    def get_age_display(self):
        delta = timezone.now() - self.created_at
        days = delta.days
        if days < 1:
            hours = delta.seconds // 3600
            return f"{hours} hours ago" if hours else "just now"
        elif days < 30:
            return f"{days} days ago"
        elif days < 365:
            months = days // 30
            return f"{months} months ago"
        else:
            years = days // 365
            return f"{years} years ago"
        
class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(_("is_deleted"), default=False)
    deleted_at = models.DateTimeField(_("deleted_at"), null=True, blank=True)
    class Meta:
        abstract = True
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def hard_delete(self):
        """Parmanently delete"""
        super().delete()

class TenantAwareModel(models.Model):
    tenant_id = models.UUIDField(_('tenant_id'), db_index=True, editable=False, default=None, null=True)
    class Meta:
        abstract = True
    
    def get_tenant(self):
        from apps.tenant.models import Client
        try:
            return Client.objects.get(id=self.tenant_id)
        except Client.DoesNotExist:
            return None

class AuditModel(models.Model):
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_created', editable=False, verbose_name=_('created_by'))
    modified_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_modified', editable=False, verbose_name=_('modified_by'))
    class Meta:
        abstract = True
    
    def set_creator(self, user):
        self.created_by = user

    def set_modifier(self, user):
        self.modified_by = user

class BaseModel(UUIDModel, TimestampModel, SoftDeleteModel, TenantAwareModel, AuditModel):
    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.__class__.__name__}({self.id})"