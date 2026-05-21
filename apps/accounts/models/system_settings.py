from django.db import models
from .base import BaseModel


class AccountsSystemSettings(BaseModel):
    """Singleton platform-wide accounts security defaults."""

    SINGLETON_KEY = 'global'

    singleton_key = models.CharField(
        max_length=32, unique=True, default=SINGLETON_KEY, editable=False,
    )
    settings = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'accounts_system_settings'
        verbose_name = 'Accounts System Settings'
        verbose_name_plural = 'Accounts System Settings'

    def __str__(self):
        return f'AccountsSystemSettings(v{self.version})'
