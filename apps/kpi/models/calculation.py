from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .base import BaseKPIModel
from .definition import KPI

class Score(BaseKPIModel):
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='scores')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='kpi_scores')
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    score = models.DecimalField(max_digits=10, decimal_places=2)
    actual_value = models.DecimalField(max_digits=20, decimal_places=2)
    target_value = models.DecimalField(max_digits=20, decimal_places=2)
    formula_used = models.CharField(max_length=50)
    calculated_at = models.DateTimeField(auto_now_add=True)
    calculated_by = models.CharField(max_length=255, default='system')
    class Meta:
        db_table = 'kpi_scores'
        unique_together = [['tenant_id', 'kpi', 'user', 'year', 'month']]
        indexes = [
            models.Index(fields=['user', 'year', 'month', 'score']),
            models.Index(fields=['kpi', 'score']),
        ]
    
    def __str__(self):
        return f"{self.kpi.name} - {self.user.email}: {self.score}% ({self.year}-{self.month})"
    
class AggregatedScore(BaseKPIModel):
    AGGREGATION_LEVEL = [
        ('TEAM', 'Team'),
        ('DEPARTMENT', 'Department'),
        ('ORGANIZATION', 'Organization'),
    ]
    level = models.CharField(max_length=20, choices=AGGREGATION_LEVEL)
    entity_id = models.UUIDField(help_text='ID of team, dept, org')
    entity_name = models.CharField(max_length=255)
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    aggregated_score = models.DecimalField(max_digits=10, decimal_places=2, help_text='weighted score average')
    member_count = models.PositiveIntegerField()
    kpi_count = models.PositiveIntegerField()
    calculation_method = models.CharField(max_length=50, default='weighted_average')
    class Meta:
        db_table = 'kpi_aggregated_scores'
        unique_together = [['tenant_id', 'level', 'entity_id', 'year', 'month']]
        indexes = [
            models.Index(fields=['level', 'entity_id', 'year', 'month']),
            models.Index(fields=['aggregated_score']),
        ]
    
    def __str__(self):
        return f"{self.level}: {self.entity_name} - {self.aggregated_score}% ({self.year}-{self.month})"
    
class TrafficLight(BaseKPIModel):
    STATUS_CHOICES = [
        ('GREEN', 'On Track'),
        ('YELLOW', 'At Risk'),
        ('RED', 'Off Track'),
    ]
    score = models.ForeignKey(Score, on_delete=models.CASCADE, related_name='traffic_lights')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    score_value = models.DecimalField(max_digits=10, decimal_places=2)
    green_threshold = models.DecimalField(max_digits=5, decimal_places=2, default=90)
    yellow_threshold = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    consecutive_red_count = models.PositiveSmallIntegerField(default=0)
    calculated_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'kpi_traffic_lights'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['score', 'status']),
        ]
    def __str__(self):
        return f"{self.score.kpi.name} - {self.get_status_display()}"
    
    @property
    def emoji(self):
        return {'GREEN': '🟢', 'YELLOW': '🟡', 'RED': '🔴'}.get(self.status, '⚪')
    
class Trend(BaseKPIModel):
    TREND_DIRECTION = [
        ('IMPROVING', 'Improving'),
        ('DECLINING', 'Declining'),
        ('STABLE', 'Stable'),
        ('VOLATILE', 'Volatile'),
    ]
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='trends')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='kpi_trends')
    direction = models.CharField(max_length=10, choices=TREND_DIRECTION)
    slope = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    last_3_months_avg = models.DecimalField(max_digits=10, decimal_places=2)
    last_6_months_avg = models.DecimalField(max_digits=10, decimal_places=2)
    year_over_year_change = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    analysis_period_end = models.DateField()
    calculated_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'kpi_trends'
        unique_together = [['tenant_id', 'kpi', 'user', 'analysis_period_end']]
    
    def __str__(self):
        return f"{self.kpi.name} - {self.direction} ({self.analysis_period_end})"
    
class CalculationLog(BaseKPIModel):
    CALCULATION_TYPE = [
        ('SCORE', 'Score Calculation'),
        ('AGGREGATE', 'Aggregation'),
        ('TRAFFIC_LIGHT', 'Traffic Light'),
        ('TREND', 'Trend Analysis'),
        ('CASCADE', 'Cascade Calculation'),
    ]
    calculation_type = models.CharField(max_length=20, choices=CALCULATION_TYPE)
    kpi = models.ForeignKey('KPI', on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    period_year = models.PositiveSmallIntegerField(null=True, blank=True)
    period_month = models.PositiveSmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('SUCCESS', 'Success'), ('FAILED', 'Failed'), ('PARTIAL', 'Partial')])
    duration_ms = models.PositiveIntegerField(help_text="Calculation duration in milliseconds")
    records_affected = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    traceback = models.TextField(blank=True)
    triggered_by = models.CharField(max_length=255, default='system')
    triggered_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'kpi_calculation_logs'
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['calculation_type', 'status', '-triggered_at']),
            models.Index(fields=['kpi', 'period_year', 'period_month']),
        ]
    
    def __str__(self):
        return f"{self.calculation_type} - {self.status} at {self.triggered_at}"
