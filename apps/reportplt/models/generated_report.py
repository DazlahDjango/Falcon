import uuid
from django.db import models, transaction
from django.utils import timezone
from apps.reportplt.models.base import ReportingBaseModel
from apps.reportplt.constants import ReportCategory, ExportFormat, GenerationStatus, DataSensitivityLevel
from apps.reportplt.managers.generated_report import GeneratedReportManager

class GeneratedReport(ReportingBaseModel):
    template = models.ForeignKey('reportplt.ReportTemplate', on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_reports')
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=100, db_index=True)
    category = models.CharField(max_length=20, choices=ReportCategory.choices, default=ReportCategory.PRODUCTION, db_index=True)
    format = models.CharField(max_length=10, choices=ExportFormat.choices, default=ExportFormat.PDF)
    status = models.CharField(max_length=20, choices=GenerationStatus.choices, default=GenerationStatus.PENDING, db_index=True)
    sensitivity_level = models.CharField(max_length=20, choices=DataSensitivityLevel.choices, default=DataSensitivityLevel.INTERNAL)
    file_path = models.FileField(upload_to='reports/%Y/%m/', null=True, blank=True)
    file_size_bytes = models.BigIntegerField(default=0)
    filters_used = models.JSONField(default=dict)
    execution_time_ms = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, default='')
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    objects = GeneratedReportManager()

    class Meta:
        db_table = 'reporting_generated_report'
        verbose_name = 'Generated Report'
        verbose_name_plural = 'Generated Reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} [{self.format}] ({self.status})"

    @transaction.atomic
    def mark_completed(self, file_name, file_bytes, execution_time_ms=0):
        from django.core.files.base import ContentFile
        self.file_path.save(file_name, ContentFile(file_bytes), save=False)
        self.file_size_bytes = len(file_bytes)
        self.status = GenerationStatus.COMPLETED
        self.execution_time_ms = execution_time_ms
        self.completed_at = timezone.now()
        self.save(update_fields=['file_path', 'file_size_bytes', 'status', 'execution_time_ms', 'completed_at', 'updated_at'])

    @transaction.atomic
    def mark_failed(self, error_message):
        self.status = GenerationStatus.FAILED
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message', 'updated_at'])
