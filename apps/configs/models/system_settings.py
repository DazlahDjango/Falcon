from django.db import models
from .base import BaseConfigModel


class ConfigSystemSettings(BaseConfigModel):
    """
    Singleton persisted platform settings for the configs app (CIA: Integrity via audit + versioning).
    """
    SINGLETON_KEY = 'global'

    singleton_key = models.CharField(max_length=32, unique=True, default=SINGLETON_KEY, editable=False)
    settings = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'config_system_settings'
        verbose_name = 'Config System Settings'
        verbose_name_plural = 'Config System Settings'

    def __str__(self):
        return f'ConfigSystemSettings(v{self.version})'
