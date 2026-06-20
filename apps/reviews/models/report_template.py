# apps/reviews/models/report_template.py
"""
Report Template Model - Saved report configurations for reuse
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel


class ReportTemplate(ReviewBaseModel):
    """
    Saved report template for generating consistent reports.
    Users can save their report configurations for reuse.
    """
    
    class ReportType(models.TextChoices):
        EMPLOYEE = 'employee', 'Employee Summary'
        TEAM = 'team', 'Team Summary'
        CYCLE = 'cycle', 'Cycle Summary'
        PIP = 'pip', 'PIP Report'
        CALIBRATION = 'calibration', 'Calibration Report'
        PROMOTION = 'promotion', 'Promotion Report'
        DISTRIBUTION = 'distribution', 'Rating Distribution'
        COMPANY = 'company', 'Company Performance'
        
    class Format(models.TextChoices):
        PDF = 'pdf', 'PDF Document'
        EXCEL = 'excel', 'Excel Spreadsheet'
        CSV = 'csv', 'CSV File'
        JSON = 'json', 'JSON Data'
    
    # Basic Information
    # tenant (inherited from ReviewBaseModel)
    
    name = models.CharField(
        max_length=100,
        help_text="Template name (e.g., 'Monthly Executive Report')"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Optional description of this template"
    )
    
    report_type = models.CharField(
        max_length=20,
        choices=ReportType.choices,
        help_text="Type of report this template generates"
    )
    
    # Report Configuration (JSON)
    config = models.JSONField(
        default=dict,
        help_text="JSON configuration for the report"
    )
    
    # Output Settings
    default_format = models.CharField(
        max_length=10,
        choices=Format.choices,
        default=Format.PDF,
        help_text="Default export format"
    )
    
    include_charts = models.BooleanField(
        default=True,
        help_text="Include charts in the report"
    )
    
    include_tables = models.BooleanField(
        default=True,
        help_text="Include data tables in the report"
    )
    
    # Scheduling (for automated reports)
    is_scheduled = models.BooleanField(
        default=False,
        help_text="Whether this report is scheduled for automatic generation"
    )
    
    schedule_cron = models.CharField(
        max_length=100,
        blank=True,
        help_text="Cron expression for scheduled reports (e.g., '0 8 * * 1' for Monday 8 AM)"
    )
    
    recipients = models.JSONField(
        default=list,
        blank=True,
        help_text="List of email addresses to send scheduled reports to"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(
        default=False,
        help_text="Whether this template is available to all users"
    )
    
    # Ownership
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='report_templates'
    )
    
    # Tracking
    last_generated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this report was last generated"
    )
    
    generation_count = models.IntegerField(
        default=0,
        help_text="Number of times this report has been generated"
    )
    
    class Meta:
        db_table = 'reviews_report_templates'
        ordering = ['-is_default', 'name']
        indexes = [
            models.Index(fields=['tenant', 'report_type']),
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['created_by']),
            models.Index(fields=['is_scheduled']),
        ]
        unique_together = [['tenant', 'name']]
    
    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"
    
    def clean(self):
        """Basic validation"""
        super().clean()
        
        # Validate config structure
        if not isinstance(self.config, dict):
            raise ValidationError({'config': 'Config must be a JSON object'})
        
        # Validate schedule if scheduled
        if self.is_scheduled:
            if not self.schedule_cron:
                raise ValidationError({
                    'schedule_cron': 'Schedule cron is required for scheduled reports'
                })
            if not self.recipients:
                raise ValidationError({
                    'recipients': 'At least one recipient is required for scheduled reports'
                })
    
    def save(self, *args, **kwargs):
        """Auto-assign default if first template for tenant"""
        if not ReportTemplate.objects.filter(tenant=self.tenant).exists():
            self.is_default = True
        super().save(*args, **kwargs)