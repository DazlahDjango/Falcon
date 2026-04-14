from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .base import BaseKPIModel
from .definition import KPI
from .validation import ValidationRecord


class MonthlyActual(BaseKPIModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Validation'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ADJUSTED', 'Adjusted'),
    ]
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='actuals')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='actuals')
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    actual_value = models.DecimalField(max_digits=20, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    submitted_at = models.DateTimeField(auto_now_add=True)
    submitted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='submitted_actuals')
    notes = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_monthly_actuals'
        unique_together = [['tenant_id', 'kpi', 'user', 'year', 'month']]
        indexes = [
            models.Index(fields=['user', 'status', 'year', 'month']),
            models.Index(fields=['kpi', 'status']),
        ]
    
    def __str__(self):
        return f"{self.kpi.name} - {self.user.email}: {self.actual_value} ({self.year}-{self.month})"
    
    def clean(self):
        if self.month < 1 or self.month > 12:
            raise ValidationError("Month must be between 1 and 12")
        
    def approve(self, supervisor, comment=None):
        self.status = 'APPROVED'
        self.save()
        ValidationRecord.objects.create(
            actual=self,
            status='APPROVED',
            validated_by=supervisor,
            validated_at=timezone.now(),
            comment=comment or 'Approved'
        )
    
    def resubmit(self, new_value, user, notes=None):
        self.actual_value = new_value
        self.status = 'PENDING'
        self.notes = notes or self.notes
        self.submitted_by = user
        self.save()

class ActualHistory(BaseKPIModel):
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('APPROVE', 'Approved'),
        ('REJECT', 'Rejected'),
        ('ADJUST', 'Adjusted'),
    ]
    actual = models.ForeignKey(MonthlyActual, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    new_value = models.DecimalField(max_digits=20, decimal_places=2)
    performed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_actual_history'
        ordering = ['-performed_at']
    
    def __str__(self):
        return f"{self.actual.kpi.name} - {self.action} at {self.performed_at}"
    
class ActualAdjustment(BaseKPIModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    original_actual = models.ForeignKey(MonthlyActual, on_delete=models.CASCADE, related_name='adjustments')
    adjusted_value = models.DecimalField(max_digits=20, decimal_places=2)
    reason = models.TextField()
    requested_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='requested_adjustments')
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='approved_adjustments')
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'kpi_actual_adjustments'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Adjustment for {self.original_actual.kpi.name} from {self.original_actual.actual_value} to {self.adjusted_value}"
    
    def approve(self, approver):
        self.status = 'APPROVED'
        self.approved_by = approver
        self.approved_at = timezone.now()
        self.save()
        MonthlyActual.objects.create(
            tenant_id=self.tenant_id,
            kpi=self.original_actual.kpi,
            user=self.original_actual.user,
            year=self.original_actual.year,
            month=self.original_actual.month,
            actual_value=self.adjusted_value,
            status='ADJUSTED',
            notes=f"Adjusted from {self.original_actual.actual_value}. Reason: {self.reason}"
        )

class Evidence(BaseKPIModel):
    EVIDENCE_TYPES = [
        ('DOCUMENT', 'Document'),
        ('IMAGE', 'Image'),
        ('LINK', 'Link'),
        ('NOTE', 'Note'),
    ]
    actual = models.ForeignKey(MonthlyActual, on_delete=models.CASCADE, related_name='evidence')
    evidence_type = models.CharField(max_length=20, choices=EVIDENCE_TYPES)
    file = models.FileField(upload_to='kpi_evidence/%Y/%m/', null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    description = models.TextField()
    uploaded_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'kpi_evidence'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Evidence for {self.actual.kpi.name} - {self.evidence_type}"