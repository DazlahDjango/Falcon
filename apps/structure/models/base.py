from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import Client
import uuid

class BaseStructureModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(_('tenant ID'), db_index=True, editable=False, help_text=_("The unique UUID of the Tenant this structure belongs to."))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.UUIDField(_('created by'), null=True, blank=True, editable=False)
    updated_by = models.UUIDField(_('updated by'), null=True, blank=True)
    is_deleted = models.BooleanField(_('deleted'), default=False, db_index=True)
    deleted_at = models.DateTimeField(_('deleted at'), null=True, blank=True)
    deleted_by = models.UUIDField(_('deleted by'), null=True, blank=True)
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['tenant_id', 'is_deleted']),
            models.Index(fields=['tenant_id', 'created_at']),
        ]
    def get_tenant(self):
        try:
            return Client.objects.get(id=self.tenant_id)
        except Client.DoesNotExist:
            return None