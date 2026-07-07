import uuid
from django.db import models
from django.utils import timezone


class OrganizationSettings(models.Model):
    SINGLETON_KEY = 'global'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    singleton_key = models.CharField(max_length=32, unique=True, default=SINGLETON_KEY, editable=False)
    settings = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='org_settings_updates')

    class Meta:
        db_table = 'organization_settings'
        verbose_name = 'Organization Settings'
        verbose_name_plural = 'Organization Settings'

    def __str__(self):
        return f'OrganizationSettings(v{self.version})'