from django.db import models
import uuid

class BaseConfigModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.UUIDField(null=True, blank=True, help_text="User ID who created this record")
    updated_by = models.UUIDField(null=True, blank=True, help_text="User ID who last updated this record")
    
    class Meta:
        abstract = True