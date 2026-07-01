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

    @classmethod
    def get_settings(cls):
        """Get the singleton settings instance."""
        obj, created = cls.objects.get_or_create(
            singleton_key=cls.SINGLETON_KEY,
            defaults={'settings': {}},
        )
        return obj

    @classmethod
    def get_setting(cls, key, default=None):
        """Get a specific setting by key."""
        settings_obj = cls.get_settings()
        return settings_obj.settings.get(key, default)

    @classmethod
    def set_setting(cls, key, value, updated_by=None):
        """Set a specific setting by key."""
        settings_obj = cls.get_settings()
        settings_obj.settings[key] = value
        if updated_by:
            settings_obj.updated_by = updated_by
        settings_obj.save(update_fields=['settings', 'updated_by', 'updated_at'])
        return settings_obj

    def save(self, *args, **kwargs):
        """Increment version on every save."""
        if self.pk:
            self.version += 1
        super().save(*args, **kwargs)