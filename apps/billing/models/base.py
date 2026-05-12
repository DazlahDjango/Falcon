from django.db import models
import uuid
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class BillingBaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.UUIDField(_('created by'), null=True, blank=True, editable=False)
    updated_by = models.UUIDField(_('updated by'), null=True, blank=True, editable=False)
    is_deleted = models.BooleanField(_('is deleted'), default=False, db_index=True)
    deleted_at = models.DateTimeField(_('deleted at'), null=True, blank=True)
    deleted_by = models.UUIDField(_('deleted by'), null=True, blank=True)
    class Meta:
        abstract = True
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['id']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_deleted']),
        ]
    def soft_delete(self, user_id):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user_id
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
    def hard_delete(self):
        super().delete()