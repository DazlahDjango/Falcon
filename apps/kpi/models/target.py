from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .base import BaseKPIModel
from .definition import KPI

class AnnualTarget(BaseKPIModel):
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='annual_targets')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='annual_targets')
    year = models.PositiveSmallIntegerField()
    target_value = models.DecimalField(max_digits=20, decimal_places=2)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_targets')
    notes = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_annual_targets'
        unique_together = [['tenant_id', 'kpi', 'user', 'year']]
        indexes = [
            models.Index(fields=['user', 'year']),
            models.Index(fields=['kpi', 'year']),
        ]

    def __str__(self):
        return f"{self.kpi.name} - {self.user.email}: {self.target_value} ({self.year})"
    
    def clean(self):
        if self.target_value < 0:
            raise ValidationError("Target value cannot be negative")

class MonthlyPhasing(BaseKPIModel):
    annual_target = models.ForeignKey(AnnualTarget, on_delete=models.CASCADE, related_name='monthly_phasing')
    month = models.PositiveSmallIntegerField(help_text='1-12')
    target_value = models.DecimalField(max_digits=20, decimal_places=2)
    is_locked = models.BooleanField(default=False, help_text='Locked after cycle start')
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='locked_phasing')
    class Meta:
        db_table = 'kpi_monthly_phasing'
        unique_together = [['tenant_id', 'annual_target', 'month']]
        ordering = ['annual_target', 'month']
    
    def __str__(self):
        return f"{self.annual_target.kpi.name} - Month {self.month}: {self.target_value}"
    
    def clean(self):
        if self.month < 1 or self.month > 12:
            raise ValidationError("Month must be between 1 and 12")
        if self.is_locked and self.target_value < 0:
            raise ValidationError("Locked target values cannot be negative")
        
    def lock(self, user=None):
        if not self.is_locked:
            self.is_locked = True
            self.locked_at = timezone.now()
            self.locked_by = user
            self.save()

class PhasingLock(BaseKPIModel):
    tenant = models.ForeignKey('core.Client', on_delete=models.CASCADE, related_name='phasing_locks')
    performance_cycle = models.CharField(max_length=50, help_text="e.g., FY2025")
    locked_at = models.DateTimeField(auto_now_add=True)
    locked_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_phasing_locks'
        unique_together = [['tenant_id', 'performance_cycle']]
    
    def __str__(self):
        return f"Phasing locked for {self.performance_cycle} at {self.locked_at}"
    
class TargetHistory(BaseKPIModel):
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('PHASE', 'Phased'),
        ('LOCK', 'Locked'),
        ('ADJUST', 'Adjusted'),
    ]
    annual_target = models.ForeignKey(AnnualTarget, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    new_value = models.DecimalField(max_digits=20, decimal_places=2)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'kpi_target_history'
        ordering = ['-performed_at']
    
    def __str__(self):
        return f"{self.annual_target.kpi.name} - {self.action} at {self.performed_at}"