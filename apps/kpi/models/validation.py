from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .base import BaseKPIModel

class ValidationRecord(BaseKPIModel):
    STATUS_CHOICES = [
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ESCALATED', 'Escalated'),
    ]
    actual = models.ForeignKey('MonthlyActual', on_delete=models.CASCADE, related_name='validations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    validated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='validations')
    validated_at = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_validation_records'
        ordering = ['-validated_at']
        indexes = [
            models.Index(fields=['actual', 'status']),
            models.Index(fields=['validated_by', '-validated_at']),
        ]
    
    def __str__(self):
        return f"{self.actual.kpi.name} - {self.status} by {self.validated_by}"
    
class ValidationComment(BaseKPIModel):
    validation = models.ForeignKey(ValidationRecord, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    commented_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    commented_at = models.DateTimeField(auto_now_add=True)
    is_private = models.BooleanField(default=False, help_text="Visible only to supervisors")
    class Meta:
        db_table = 'kpi_validation_comments'
        ordering = ['commented_at']

    def __str__(self):
        return f"Comment on {self.validation.actual.kpi.name} by {self.commented_by}"
    
class RejectionReason(BaseKPIModel):
    REASON_CATEGORIES = [
        ('DATA_QUALITY', 'Data Quality'),
        ('MISSING_EVIDENCE', 'Missing Evidence'),
        ('CALCULATION_ERROR', 'Calculation Error'),
        ('TIMING', 'Timing Issue'),
        ('OTHER', 'Other'),
    ]
    category = models.CharField(max_length=20, choices=REASON_CATEGORIES)
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    class Meta:
        db_table = 'kpi_rejection_reasons'
        ordering = ['display_order', 'reason']
        unique_together = [['tenant_id', 'category', 'reason']]
    
    def __str__(self):
        return f"{self.get_category_display()}: {self.reason}"
    
class Escalation(BaseKPIModel):
    ESCALATION_STATUS = [
        ('PENDING', 'Pending'),
        ('REVIEWING', 'Under Review'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    actual = models.ForeignKey('MonthlyActual', on_delete=models.CASCADE, related_name='escalations')
    escalated_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='escalations_initiated')
    escalated_to = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='escalations_received')
    escalated_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=ESCALATION_STATUS, default='PENDING')
    resolution = models.TextField(blank=True)
    resolved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='escalations_resolved')
    resolved_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = 'kpi_escalations'
        ordering = ['-escalated_at']
        indexes = [
            models.Index(fields=['escalated_to', 'status']),
        ]
    
    def __str__(self):
        return f"Escalation for {self.actual.kpi.name} to {self.escalated_to}"
    
    def resolve(self, resolver, resolution):
        self.status = 'RESOLVED'
        self.resolution = resolution
        self.resolved_by = resolver
        self.resolved_at = timezone.now()
        self.save()