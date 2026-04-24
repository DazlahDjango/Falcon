
"""
Resource usage tracking for tenants.
Tracks limits and current usage for users, storage, API calls, etc.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .base import BaseModel


class ResourceType(models.TextChoices):
    USERS = 'users', 'Users'
    STORAGE_MB = 'storage_mb', 'Storage (MB)'
    API_CALLS_PER_DAY = 'api_calls_per_day', 'API Calls Per Day'
    KPIS = 'kpis', 'KPIs'
    DEPARTMENTS = 'departments', 'Departments'
    CONCURRENT_SESSIONS = 'concurrent_sessions', 'Concurrent Sessions'


class TenantResource(BaseModel):
    """
    Tracks resource usage and limits per tenant.
    """

    tenant = models.ForeignKey(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='resources',
        help_text="Tenant this resource belongs to"
    )

    resource_type = models.CharField(
        max_length=30,
        choices=ResourceType.choices,
        db_index=True,
        help_text="Type of resource being tracked"
    )

    limit_value = models.IntegerField(
        help_text="Maximum allowed for this resource"
    )

    current_value = models.IntegerField(
        default=0,
        help_text="Current usage of this resource"
    )

    warning_threshold = models.IntegerField(
        default=80,
        help_text="Percentage at which to send warning (e.g., 80 = 80%)"
    )

    last_reset_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this counter was last reset (for daily limits)"
    )

    class Meta:
        db_table = 'tenant_resources'
        unique_together = [['tenant', 'resource_type']]
        indexes = [
            models.Index(fields=['tenant', 'resource_type']),
            models.Index(fields=['tenant', 'current_value']),
        ]

    def __str__(self):
        return f"{self.tenant.name} - {self.resource_type}: {self.current_value}/{self.limit_value}"

    @property
    def percentage_used(self):
        """Calculate percentage of limit used"""
        if self.limit_value == 0:
            return 0
        return (self.current_value / self.limit_value) * 100

    @property
    def is_exceeded(self):
        """Check if limit has been exceeded"""
        return self.current_value >= self.limit_value

    @property
    def is_warning_level(self):
        """Check if usage is at warning level"""
        return self.percentage_used >= self.warning_threshold

    def increment(self, amount=1):
        """Increase current usage"""
        self.current_value += amount
        self.save(update_fields=['current_value'])
        return self.current_value

    def decrement(self, amount=1):
        """Decrease current usage"""
        self.current_value = max(0, self.current_value - amount)
        self.save(update_fields=['current_value'])
        return self.current_value

    def reset(self):
        """Reset current value to zero"""
        self.current_value = 0
        self.last_reset_at = timezone.now()
        self.save(update_fields=['current_value', 'last_reset_at'])

    def can_increment(self, amount=1):
        """Check if incrementing would exceed limit"""
        return (self.current_value + amount) <= self.limit_value
