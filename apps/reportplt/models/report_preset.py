import uuid
from django.db import models
from .base import BaseModel
from apps.reportplt.managers.base import SoftDeleteManager

class ReportPreset(BaseModel):
    template = models.ForeignKey('reportplt.ReportTemplate', on_delete=models.CASCADE, related_name='presets')
    name = models.CharField(max_length=255)
    layout_config = models.JSONField(default=dict, blank=True)
    column_selection = models.JSONField(default=list, blank=True)
    sort_orders = models.JSONField(default=dict, blank=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'reporting_preset'
        verbose_name = 'Report Preset'
        verbose_name_plural = 'Report Presets'

    def __str__(self):
        return f"{self.name} [{getattr(self.template, 'name', '')}]"
