from django.db import models
from django.utils import timezone
import uuid


class BaseDashboardModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(db_index=True, editable=False, help_text="Tenant this data belongs to")
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['tenant_id', 'created_at']),
        ]