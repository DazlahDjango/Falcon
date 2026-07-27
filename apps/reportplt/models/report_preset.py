import uuid
from django.db import models
from apps.reportplt.models.base import ReportingBaseModel
from apps.accounts.managers.base import TenantAwareManager

class ReportPreset(ReportingBaseModel):
    template = models.ForeignKey('reportplt.ReportTemplate', on_delete=models.CASCADE, related_name='presets')
    name = models.CharField(max_length=255)
    layout_config = models.JSONField(default=dict)
    column_selection = models.JSONField(default=list)
    sort_orders = models.JSONField(default=dict)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'reporting_preset'
        verbose_name = 'Report Preset'
        verbose_name_plural = 'Report Presets'

    def __str__(self):
        return f"{self.name} [{self.template.code}]"
