from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from .base import BaseKPIModel


class KPISummary(models.Model):
    kpi = models.ForeignKey('KPI', on_delete=models.DO_NOTHING)
    tenant_id = models.UUIDField(db_index=True)
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    average_score = models.DecimalField(max_digits=10, decimal_places=2)
    green_count = models.PositiveIntegerField()
    yellow_count = models.PositiveIntegerField()
    red_count = models.PositiveIntegerField()
    total_users = models.PositiveIntegerField()
    last_calculated = models.DateTimeField(auto_now=True)
    class Meta:
        managed = False
        db_table = 'kpi_summary_mv'
        indexes = [
            models.Index(fields=['tenant_id', 'kpi', 'year', 'month']),
        ]

class DepartmentRollup(models.Model):
    department_id = models.UUIDField()
    department_name = models.CharField(max_length=255)
    tenant_id = models.UUIDField(db_index=True)
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    overall_score = models.DecimalField(max_digits=10, decimal_places=2)
    employee_count = models.PositiveIntegerField()
    green_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    yellow_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    red_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    last_calculated = models.DateTimeField(auto_now=True)
    class Meta:
        managed = False
        db_table = 'department_rollup_mv'
        indexes = [
            models.Index(fields=['tenant_id', 'department_id', 'year', 'month']),
        ]

class OrganizationHealth(models.Model):
    tenant_id = models.UUIDField(primary_key=True, db_index=True)
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    overall_health_score = models.DecimalField(max_digits=10, decimal_places=2)
    kpi_completion_rate = models.DecimalField(max_digits=5, decimal_places=2)
    validation_compliance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    red_kpi_count = models.PositiveIntegerField()
    total_kpi_count = models.PositiveIntegerField()
    active_employees = models.PositiveIntegerField()
    last_calculated = models.DateTimeField(auto_now=True)
    class Meta:
        managed = False
        db_table = 'organization_health_mv'

class RefreshTracker(BaseKPIModel):
    VIEW_NAME_CHOICES = [
        ('kpi_summary', 'KPI Summary'),
        ('department_rollup', 'Department Rollup'),
        ('organization_health', 'Organization Health'),
    ]
    view_name = models.CharField(max_length=50, choices=VIEW_NAME_CHOICES)
    last_refresh = models.DateTimeField()
    next_refresh = models.DateTimeField()
    refresh_duration_ms = models.PositiveIntegerField(help_text="Duration in milliseconds")
    rows_affected = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=[('SUCCESS', 'Success'), ('FAILED', 'Failed')])
    error_message = models.TextField(blank=True)
    triggered_by = models.CharField(max_length=255, default='system')
    class Meta:
        db_table = 'kpi_refresh_tracker'
        ordering = ['-last_refresh']
        unique_together = [['tenant_id', 'view_name']]
    
    def __str__(self):
        return f"{self.get_view_name_display()} last refreshed at {self.last_refresh}"
