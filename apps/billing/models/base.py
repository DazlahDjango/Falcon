import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class BaseBillingModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(
        _('tenant ID'),
        db_index=True,
        editable=False,
        help_text=_("The tenant this billing record belongs to")
    )
    created_at = models.DateTimeField(_('created at'), default=timezone.now, editable=False)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_deleted = models.BooleanField(_('is deleted'), default=False)
    deleted_at = models.DateTimeField(_('deleted at'), null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self):
        """Soft delete this record."""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

    @property
    def is_active_record(self):
        """Check if record is not deleted."""
        return not self.is_deleted