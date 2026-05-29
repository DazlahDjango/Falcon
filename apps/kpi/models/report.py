from django.db import models
from .base import BaseKPIModel

class ReportTask(BaseKPIModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    report_type = models.CharField(max_length=50)
    format = models.CharField(max_length=10, default='pdf')
    filters = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    progress = models.PositiveSmallIntegerField(default=0, help_text="Progress percentage")
    result_url = models.URLField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='report_tasks')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'kpi_report_tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant_id', 'user', 'status']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.report_type} - {self.status}"