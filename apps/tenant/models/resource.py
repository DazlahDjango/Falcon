from django.db import models
from django.utils import timezone
from .base import BaseModel
from .organization import Organization
from ..managers import ResourceManager


class OrganizationResource(BaseModel):
    RESOURCE_TYPES = [
        ('USERS', 'Users'),
        ('STORAGE_MB', 'Storage (MB)'),
        ('API_CALLS_PER_DAY', 'API Calls Per Day'),
        ('DEPARTMENTS', 'Departments'),
        ('CONCURRENT_SESSIONS', 'Concurrent Sessions'),
        ('KPIS', 'KPIs'),
    ]

    # --- Core fields ---
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='resources'
    )
    resource_type = models.CharField(
        max_length=30, choices=RESOURCE_TYPES, db_index=True
    )
    limit_value = models.IntegerField()
    current_value = models.IntegerField(default=0)
    warning_threshold = models.IntegerField(default=80)
    last_reset_at = models.DateTimeField(null=True, blank=True)

    # --- Soft / hard limit config ---
    burst_allowed = models.BooleanField(
        default=False,
        help_text="Allow usage to exceed limit within the soft-burst buffer."
    )
    soft_limit_multiplier = models.FloatField(
        default=1.1,
        help_text="Usage may exceed limit up to this multiple before warnings. Default 10% over."
    )
    hard_limit_multiplier = models.FloatField(
        default=1.2,
        help_text="Usage is hard-blocked above this multiple of the limit."
    )

    # --- Alert timestamp tracking (mirrors billing.UsageRecord) ---
    alert_80_sent_at = models.DateTimeField(null=True, blank=True)
    alert_90_sent_at = models.DateTimeField(null=True, blank=True)
    alert_100_sent_at = models.DateTimeField(null=True, blank=True)

    # --- Billing sync flag ---
    is_synced_from_billing = models.BooleanField(
        default=False,
        help_text="True when limit_value was last resolved from the billing plan/override."
    )
    last_billing_sync_at = models.DateTimeField(null=True, blank=True)

    objects = ResourceManager()

    class Meta:
        db_table = 'organization_resources'
        ordering = ['resource_type']
        verbose_name = 'Organization Resource'
        verbose_name_plural = 'Organization Resources'
        unique_together = [['organization', 'resource_type']]
        indexes = [
            models.Index(fields=['organization', 'resource_type']),
            models.Index(fields=['organization', 'current_value']),
            models.Index(fields=['is_synced_from_billing']),
        ]

    def __str__(self):
        return (
            f"{self.organization.name} - "
            f"{self.get_resource_type_display()}: {self.current_value}/{self.limit_value}"
        )

    # ------------------------------------------------------------------ #
    # Core mutations                                                        #
    # ------------------------------------------------------------------ #

    def increment(self, amount=1):
        self.current_value += amount
        self.save(update_fields=['current_value', 'updated_at'])
        return self.current_value

    def decrement(self, amount=1):
        self.current_value = max(0, self.current_value - amount)
        self.save(update_fields=['current_value', 'updated_at'])
        return self.current_value

    def reset(self):
        self.current_value = 0
        self.last_reset_at = timezone.now()
        self.alert_80_sent_at = None
        self.alert_90_sent_at = None
        self.alert_100_sent_at = None
        self.save(update_fields=[
            'current_value', 'last_reset_at',
            'alert_80_sent_at', 'alert_90_sent_at', 'alert_100_sent_at',
            'updated_at',
        ])

    # ------------------------------------------------------------------ #
    # Status properties                                                     #
    # ------------------------------------------------------------------ #

    @property
    def percentage_used(self):
        if self.limit_value == 0:
            return 0.0
        return round((self.current_value / self.limit_value) * 100, 2)

    @property
    def is_exceeded(self):
        return self.current_value >= self.limit_value

    @property
    def is_warning_level(self):
        return self.percentage_used >= self.warning_threshold

    @property
    def is_soft_exceeded(self):
        """Usage is above limit but within the soft burst buffer."""
        return (
            self.current_value > self.limit_value
            and self.current_value <= self.limit_value * self.soft_limit_multiplier
        )

    @property
    def is_hard_exceeded(self):
        """Usage is above the hard limit ceiling — must block."""
        return self.current_value > self.limit_value * self.hard_limit_multiplier

    @property
    def effective_hard_limit(self):
        """Absolute hard ceiling after multiplier."""
        return int(self.limit_value * self.hard_limit_multiplier)

    @property
    def effective_soft_limit(self):
        """Soft warning ceiling after multiplier."""
        return int(self.limit_value * self.soft_limit_multiplier)

    def can_increment(self, amount=1):
        """
        Allow increment if:
          - Not past hard ceiling, or
          - burst_allowed=True and not past soft ceiling.
        """
        new_value = self.current_value + amount
        if new_value > self.effective_hard_limit:
            return False
        if new_value > self.limit_value and not self.burst_allowed:
            return False
        return True

    @property
    def remaining(self):
        return max(0, self.limit_value - self.current_value)

    @property
    def alert_level(self):
        """Returns integer 0, 80, 90, or 100 indicating highest alert threshold reached."""
        pct = self.percentage_used
        if pct >= 100:
            return 100
        if pct >= 90:
            return 90
        if pct >= 80:
            return 80
        return 0