import uuid
from django.db import models
from django.utils import timezone


class StructureSystemSettings(models.Model):
    """Singleton platform-wide organisation structure defaults."""

    SINGLETON_KEY = 'global'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    singleton_key = models.CharField(
        max_length=32, unique=True, default=SINGLETON_KEY, editable=False,
    )
    settings = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='structure_system_settings_updates',
    )

    class Meta:
        db_table = 'structure_system_settings'
        verbose_name = 'Structure System Settings'
        verbose_name_plural = 'Structure System Settings'

    def __str__(self):
        return f'StructureSystemSettings(v{self.version})'
