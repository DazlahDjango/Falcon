from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .base import BaseKPIModel


class CascadeMap(BaseKPIModel):
    organization_target = models.ForeignKey('AnnualTarget', on_delete=models.CASCADE, related_name='cascade_maps')
    department_target = models.ForeignKey('AnnualTarget', on_delete=models.CASCADE, null=True, blank=True, related_name='department_cascades')
    individual_target = models.ForeignKey('AnnualTarget', on_delete=models.CASCADE, null=True, blank=True, related_name='individual_cascades')
    cascade_rule = models.ForeignKey('CascadeRule', on_delete=models.PROTECT)
    contribution_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="% of org target this represents")
    class Meta:
        db_table = 'kpi_cascade_maps'
        indexes = [
            models.Index(fields=['organization_target']),
            models.Index(fields=['department_target']),
            models.Index(fields=['individual_target']),
        ]
    
    def __str__(self):
        if self.department_target:
            return f"{self.organization_target.kpi.name}: Org → Dept"
        return f"{self.organization_target.kpi.name}: Org → Individual"
    
class CascadeRule(BaseKPIModel):
    """Rules for how targets cascade down the hierarchy"""
    RULE_TYPE = [
        ('EQUAL_SPLIT', 'Equal Split'),
        ('WEIGHTED', 'Weighted by Headcount'),
        ('WEIGHTED_BY_BUDGET', 'Weighted by Budget'),
        ('CUSTOM', 'Custom'),
    ]
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=30, choices=RULE_TYPE)
    description = models.TextField(blank=True)
    configuration = models.JSONField(default=dict, help_text="Rule-specific configuration")
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = 'kpi_cascade_rules'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class CascadeHistory(BaseKPIModel):
    ACTION_CHOICES = [
        ('CASCADE', 'Cascaded'),
        ('UPDATE', 'Updated'),
        ('ROLLBACK', 'Rolled Back'),
        ('REVIEW', 'Reviewed'),
    ]
    cascade_map = models.ForeignKey('CascadeMap', on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    source_target_value = models.DecimalField(max_digits=20, decimal_places=2)
    resulting_targets = models.JSONField(help_text="JSON of resulting targets")
    performed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_cascade_history'
        ordering = ['-performed_at']
    
    def __str__(self):
        return f"Cascade {self.action} at {self.performed_at}"