from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .organization import Organization
from ..managers.resource_snapshot import ResourceSnapshotManager


class ResourceUsageSnapshot(BaseModel):
    SNAPSHOT_TYPE_CHOICES = [
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    SOURCE_CHOICES = [
        ('auto', 'Automatic task'),
        ('manual', 'Manual action'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='resource_snapshots',
        verbose_name=_('organization')
    )
    resource_type = models.CharField(
        _('resource type'),
        max_length=30,
        db_index=True
    )
    snapshot_value = models.IntegerField(_('snapshot value'))
    limit_value = models.IntegerField(_('limit value'))
    percentage_used = models.DecimalField(
        _('percentage used'),
        max_digits=5,
        decimal_places=2,
        default=0
    )
    snapshot_type = models.CharField(
        _('snapshot type'),
        max_length=15,
        choices=SNAPSHOT_TYPE_CHOICES,
        default='daily'
    )
    period_label = models.CharField(
        _('period label'),
        max_length=50,
        db_index=True,
        help_text="Format: YYYY-MM-DD or YYYY-MM-DD HH:00 or YYYY-WW"
    )
    peak_value = models.IntegerField(_('peak value'), default=0)
    source = models.CharField(
        _('snapshot source'),
        max_length=10,
        choices=SOURCE_CHOICES,
        default='auto'
    )

    objects = ResourceSnapshotManager()

    class Meta:
        db_table = 'organization_resource_snapshots'
        ordering = ['-created_at']
        verbose_name = _('Resource Usage Snapshot')
        verbose_name_plural = _('Resource Usage Snapshots')
        unique_together = [['organization', 'resource_type', 'snapshot_type', 'period_label']]
        indexes = [
            models.Index(fields=['organization', 'resource_type', 'snapshot_type']),
            models.Index(fields=['period_label']),
        ]

    def __str__(self):
        return f"{self.organization.name} - {self.resource_type} snapshot for {self.period_label}: {self.snapshot_value}/{self.limit_value}"
