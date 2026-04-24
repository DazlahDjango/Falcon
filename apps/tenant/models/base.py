import uuid
from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    """
    Base model for all Tenant app models.
    Every model in tenant app should inherit from this.
    """

    # ========================================================================
    # PRIMARY KEY
    # ========================================================================
    id = models.UUIDField('accounts.User', primary_key=True, default=uuid.uuid4,
                          editable=False, help_text="Unique identifier (UUID)")

    # ========================================================================
    # TENANT ISOLATION (Multi-tenancy core)
    # ========================================================================
    tenant_id = models.UUIDField('accounts.User', db_index=True, editable=False,
                                 help_text="Tenant this record belongs to - for data isolation")

    # ========================================================================
    # TIMESTAMPS (When it happened)
    # ========================================================================
    created_at = models.DateTimeField(
        'accounts.User', auto_now_add=True, help_text="When this record was created")
    updated_at = models.DateTimeField(
        'accounts.User', auto_now=True, help_text="When this record was last updated")

    # ========================================================================
    # AUDIT TRAIL (Who did it)
    # ========================================================================
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True,
                                   blank=True, related_name='+', help_text="User who created this record")
    updated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True,
                                   blank=True, related_name='+', help_text="User who last updated this record")

    # ========================================================================
    # SOFT DELETE (Hide instead of remove)
    # ========================================================================
    is_deleted = models.BooleanField('accounts.User', default=False, db_index=True,
                                     help_text="Soft delete flag - True means hidden but not removed")
    deleted_at = models.DateTimeField(
        'accounts.User', null=True, blank=True, help_text="When this record was soft deleted")
    deleted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True,
                                   blank=True, related_name='+', help_text="User who deleted this record")

    class Meta:
        abstract = True  # No database table for this class
        ordering = ['-created_at']  # Newest records first by default

        # Database indexes for faster queries
        indexes = [
            # Filter by tenant
            models.Index(fields=['tenant_id']),
            models.Index(fields=['tenant_id', 'created_at']
                         ),        # Tenant + time range
            # Active records in tenant
            models.Index(fields=['tenant_id', 'is_deleted']),
            # Recent records first
            models.Index(fields=['-created_at']),
            # Find deleted records
            models.Index(fields=['is_deleted']),
        ]

    # ========================================================================
    # SOFT DELETE METHODS
    # ========================================================================

    def soft_delete(self, user=None):
        """Mark record as deleted without removing from database"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])

    def restore(self):
        """Restore a soft-deleted record"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])

    def hard_delete(self):
        """Permanently delete from database (irreversible)"""
        super().delete()

    # ========================================================================
    # SAVE METHOD (Auto audit)
    # ========================================================================

    def save(self, *args, **kwargs):
        """Auto-set created_by for new records and updated_by for updates"""
        user = kwargs.pop('user', None)

        if not self.pk:  # New record being created
            if user:
                self.created_by = user
        else:  # Existing record being updated
            if user:
                self.updated_by = user

        super().save(*args, **kwargs)
