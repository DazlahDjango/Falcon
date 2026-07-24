import uuid
from django.db import models
from apps.reportplt.models.base import ReportingBaseModel
from apps.reportplt.constants import AuditActionType, DataSensitivityLevel
from apps.reportplt.managers.audit import ReportAuditLogManager

class ReportAuditLog(ReportingBaseModel):
    generated_report = models.ForeignKey('reportplt.GeneratedReport', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    template_code = models.CharField(max_length=100, db_index=True)
    action = models.CharField(max_length=20, choices=AuditActionType.choices, db_index=True)
    actor = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='report_audit_actions')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    sensitivity_level = models.CharField(max_length=20, choices=DataSensitivityLevel.choices, default=DataSensitivityLevel.INTERNAL)
    details = models.JSONField(default=dict)

    objects = ReportAuditLogManager()

    class Meta:
        db_table = 'reporting_audit_log'
        verbose_name = 'Report Audit Log'
        verbose_name_plural = 'Report Audit Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.template_code} by {self.actor}"
