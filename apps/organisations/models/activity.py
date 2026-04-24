"""
Activity Log model for organisation audit trails
"""

from django.db import models
from apps.tenant.models import BaseModel


class OrganisationActivity(BaseModel):
    """
    Audit log for organisation-level actions
    """
    organisation = models.ForeignKey(
        'Organisation',
        on_delete=models.CASCADE,
        related_name='activities'
    )

    # Who performed the action
    user_id = models.CharField(
        max_length=100, null=True, blank=True, help_text="User ID who performed the action")
    user_email = models.EmailField(
        blank=True, help_text="Email of user who performed the action")

    # What action was performed
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('activated', 'Activated'),
        ('suspended', 'Suspended'),
        ('subscription_changed', 'Subscription Changed'),
        ('domain_added', 'Domain Added'),
        ('domain_verified', 'Domain Verified'),
        ('settings_changed', 'Settings Changed'),
        ('branding_updated', 'Branding Updated'),
        ('user_added', 'User Added'),
        ('user_removed', 'User Removed'),
        ('kpi_created', 'KPI Created'),
        ('kpi_updated', 'KPI Updated'),
        ('report_generated', 'Report Generated'),
    ]
    action = models.CharField(
        max_length=50, choices=ACTION_CHOICES, db_index=True)

    # What was affected
    model_name = models.CharField(
        max_length=100, blank=True, help_text="Model name affected")
    object_id = models.CharField(
        max_length=100, null=True, blank=True, help_text="Object ID affected")
    object_repr = models.CharField(
        max_length=200, blank=True, help_text="String representation of the object")

    # Details
    changes = models.JSONField(default=dict, help_text="Detailed changes made")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organisation', '-created_at']),
            models.Index(fields=['organisation', 'action']),
            models.Index(fields=['organisation', 'user_id']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = "Organisation Activity"
        verbose_name_plural = "Organisation Activities"

    def __str__(self):
        return f"{self.organisation.name} - {self.action} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
