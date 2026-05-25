"""Immutable audit trail for Reviews create/update/delete (CIA Integrity)."""

import uuid
from django.db import models
from django.utils import timezone


class ReviewAuditLog(models.Model):
    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_CHOICES = [
        (ACTION_CREATE, 'Create'),
        (ACTION_UPDATE, 'Update'),
        (ACTION_DELETE, 'Delete'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id = models.UUIDField(db_index=True, null=True, blank=True)
    model_name = models.CharField(max_length=128, db_index=True)
    object_id = models.CharField(max_length=36, db_index=True)
    action = models.CharField(max_length=16, choices=ACTION_CHOICES)
    actor_id = models.UUIDField(null=True, blank=True, db_index=True)
    changes = models.JSONField(default=dict, blank=True)
    checksum_before = models.CharField(max_length=64, blank=True)
    checksum_after = models.CharField(max_length=64, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False, db_index=True)

    class Meta:
        db_table = 'reviews_audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant_id', 'model_name', 'created_at']),
            models.Index(fields=['object_id', 'action']),
        ]

    def __str__(self):
        return f'{self.model_name}:{self.object_id} {self.action}'
