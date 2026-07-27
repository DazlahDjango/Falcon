# apps/reviews/models/analytics_snapshot.py
"""
Analytics Snapshot Model - Cached analytics data for performance
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel


class AnalyticsSnapshot(ReviewBaseModel):
    """
    Cached analytics data for quick retrieval.
    Pre-calculates company, department, and manager metrics.
    """
    
    class SnapshotType(models.TextChoices):
        COMPANY = 'company', 'Company Level'
        DEPARTMENT = 'department', 'Department Level'
        MANAGER = 'manager', 'Manager Level'
        CYCLE = 'cycle', 'Cycle Level'
        
    class MetricPeriod(models.TextChoices):
        DAILY = 'daily', 'Daily'
        WEEKLY = 'weekly', 'Weekly'
        MONTHLY = 'monthly', 'Monthly'
        QUARTERLY = 'quarterly', 'Quarterly'
        YEARLY = 'yearly', 'Yearly'
    
    # Snapshot Identification
    # tenant (inherited from ReviewBaseModel)
    
    snapshot_type = models.CharField(
        max_length=20,
        choices=SnapshotType.choices,
        db_index=True
    )
    
    period = models.CharField(
        max_length=20,
        choices=MetricPeriod.choices,
        default=MetricPeriod.DAILY
    )
    
    # Target (for department/manager level)
    department = models.ForeignKey(
        'structure.Department',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='analytics_snapshots'
    )
    
    manager = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='analytics_snapshots'
    )
    
    review_cycle = models.ForeignKey(
        'ReviewCycle',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='analytics_snapshots'
    )
    
    # Snapshot Date
    snapshot_date = models.DateField(db_index=True)
    
    # Company/Department Metrics
    total_employees = models.IntegerField(default=0)
    total_reviews_completed = models.IntegerField(default=0)
    average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Distribution (JSON)
    rating_distribution = models.JSONField(
        default=dict,
        help_text="Distribution of ratings across levels"
    )
    
    # Trend Metrics
    previous_period_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    score_change = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    percentage_change = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Promotion/PIP Metrics
    promotions_count = models.IntegerField(default=0)
    pips_created = models.IntegerField(default=0)
    pips_completed = models.IntegerField(default=0)
    pips_failed = models.IntegerField(default=0)
    
    # Competency Gaps (JSON)
    top_competencies = models.JSONField(default=list)
    bottom_competencies = models.JSONField(default=list)
    
    # Manager Metrics (for manager-level snapshots)
    team_size = models.IntegerField(default=0)
    team_average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    rating_inflation_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="How much manager deviates from company average (+/-)"
    )
    
    # Metadata
    calculation_duration_ms = models.IntegerField(
        default=0,
        help_text="How long calculation took in milliseconds"
    )
    
    is_stale = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'reviews_analytics_snapshots'
        ordering = ['-snapshot_date']
        indexes = [
            models.Index(fields=['tenant_id', 'snapshot_type', 'snapshot_date']),
            models.Index(fields=['tenant_id', 'department', 'snapshot_date']),
            models.Index(fields=['tenant_id', 'manager', 'snapshot_date']),
            models.Index(fields=['snapshot_date', 'is_stale']),
        ]
        unique_together = [
            ['tenant_id', 'snapshot_type', 'department', 'manager', 'review_cycle', 'snapshot_date']
        ]
    
    def __str__(self):
        type_label = self.get_snapshot_type_display()
        if self.department:
            return f"{type_label} - {self.department.name} - {self.snapshot_date}"
        if self.manager:
            return f"{type_label} - {self.manager.email} - {self.snapshot_date}"
        return f"{type_label} - {self.snapshot_date}"