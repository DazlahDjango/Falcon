
"""
Connection pool management for tenant database connections.
Tracks and manages database connections per tenant.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .tenant import Client


class ConnectionStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    IDLE = 'idle', 'Idle'
    CLOSED = 'closed', 'Closed'
    ERROR = 'error', 'Error'


class ConnectionPool(BaseModel):
    """
    Tracks database connection pool for tenants.
    Useful for managing connections in multi-tenant setups.
    """

    connection_id = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Unique identifier for this connection"
    )

    tenant = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='connections',
        help_text="Tenant this connection belongs to"
    )

    status = models.CharField(
        max_length=20,
        choices=ConnectionStatus.choices,
        default=ConnectionStatus.IDLE,
        db_index=True,
        help_text="Current connection status"
    )

    database_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Database name (if separate database)"
    )

    schema_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Schema name (if separate schema)"
    )

    connected_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this connection was established"
    )

    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this connection was last used"
    )

    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this connection was closed"
    )

    error_message = models.TextField(
        blank=True,
        help_text="Error message if connection failed"
    )

    class Meta:
        db_table = 'tenant_connections'
        ordering = ['-last_used_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['connection_id']),
            models.Index(fields=['status', 'last_used_at']),
        ]

    def __str__(self):
        return f"Connection {self.connection_id} - {self.tenant.name} ({self.status})"

    @property
    def is_active(self):
        return self.status == ConnectionStatus.ACTIVE

    @property
    def is_idle(self):
        return self.status == ConnectionStatus.IDLE

    @property
    def idle_duration_seconds(self):
        if self.last_used_at and self.status == ConnectionStatus.IDLE:
            return (timezone.now() - self.last_used_at).total_seconds()
        return None

    def mark_active(self):
        self.status = ConnectionStatus.ACTIVE
        self.connected_at = timezone.now()
        self.last_used_at = timezone.now()
        self.save(update_fields=['status', 'connected_at', 'last_used_at'])

    def mark_idle(self):
        self.status = ConnectionStatus.IDLE
        self.last_used_at = timezone.now()
        self.save(update_fields=['status', 'last_used_at'])

    def mark_closed(self):
        self.status = ConnectionStatus.CLOSED
        self.closed_at = timezone.now()
        self.save(update_fields=['status', 'closed_at'])

    def mark_error(self, error_message):
        self.status = ConnectionStatus.ERROR
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message'])

    def use(self):
        """Mark connection as used (update last_used_at)"""
        self.last_used_at = timezone.now()
        if self.status == ConnectionStatus.IDLE:
            self.status = ConnectionStatus.ACTIVE
        self.save(update_fields=['last_used_at', 'status'])
