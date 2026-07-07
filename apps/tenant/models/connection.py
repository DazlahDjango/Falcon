from django.db import models
from django.utils import timezone
from .base import BaseModel
from .organization import Organization
from ..managers import ConnectionManager


class OrganizationConnection(BaseModel):
    CONNECTION_STATUS = [
        ('ACTIVE', 'Active'),
        ('IDLE', 'Idle'),
        ('CLOSED', 'Closed'),
        ('ERROR', 'Error'),
    ]
    connection_id = models.CharField(max_length=255, unique=True, db_index=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='connections')
    status = models.CharField(max_length=20, choices=CONNECTION_STATUS, default='IDLE', db_index=True)
    database_name = models.CharField(max_length=100, blank=True)
    schema_name = models.CharField(max_length=100, blank=True)
    connected_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    objects = ConnectionManager()

    class Meta:
        db_table = 'organization_connections'
        ordering = ['-last_used_at']
        verbose_name = 'Organization Connection'
        verbose_name_plural = 'Organization Connections'
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['connection_id']),
            models.Index(fields=['status', 'last_used_at']),
        ]

    def __str__(self):
        return f"{self.connection_id} - {self.organization.name} ({self.get_status_display()})"

    @property
    def is_active(self):
        return self.status == 'ACTIVE'

    @property
    def idle_duration_seconds(self):
        if not self.last_used_at:
            return None
        return (timezone.now() - self.last_used_at).total_seconds()

    @property
    def connected_duration_seconds(self):
        if not self.connected_at:
            return None
        end_time = self.closed_at or timezone.now()
        return (end_time - self.connected_at).total_seconds()

    def mark_active(self):
        self.status = 'ACTIVE'
        self.connected_at = timezone.now()
        self.last_used_at = timezone.now()
        self.save(update_fields=['status', 'connected_at', 'last_used_at'])

    def mark_idle(self):
        self.status = 'IDLE'
        self.last_used_at = timezone.now()
        self.save(update_fields=['status', 'last_used_at'])

    def mark_closed(self):
        self.status = 'CLOSED'
        self.closed_at = timezone.now()
        self.save(update_fields=['status', 'closed_at'])

    def mark_error(self, error_message):
        self.status = 'ERROR'
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message'])

    def use(self):
        self.last_used_at = timezone.now()
        if self.status == 'IDLE':
            self.status = 'ACTIVE'
        self.save(update_fields=['last_used_at', 'status'])