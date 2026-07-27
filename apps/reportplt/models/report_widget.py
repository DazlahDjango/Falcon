# apps/reportplt/models/report_widget.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportWidget(BaseModel):
    WIDGET_TYPES = [
        ('kpi', 'KPI Card'),
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('heatmap', 'Heatmap'),
        ('trend', 'Trend Chart'),
        ('gauge', 'Gauge'),
        ('pie', 'Pie Chart'),
        ('bar', 'Bar Chart'),
        ('line', 'Line Chart'),
        ('area', 'Area Chart'),
        ('scatter', 'Scatter Plot'),
        ('map', 'Map'),
        ('list', 'List'),
        ('summary', 'Summary Card'),
        ('mission', 'Mission Status'),
        ('pip', 'PIP Tracker'),
        ('compliance', 'Compliance Status'),
        ('custom', 'Custom Widget'),
    ]
    dashboard = models.ForeignKey('reportplt.ReportDashboard', on_delete=models.CASCADE, related_name='widgets')
    name = models.CharField(_('name'), max_length=255)
    widget_type = models.CharField(_('widget type'), max_length=50, choices=WIDGET_TYPES, db_index=True)
    config = models.JSONField(_('widget configuration'), default=dict)
    data_config = models.JSONField(_('data configuration'), default=dict)
    style_config = models.JSONField(_('style configuration'), default=dict)
    position = models.JSONField(_('position'), default=dict)
    size = models.JSONField(_('size'), default=dict)
    is_active = models.BooleanField(_('is active'), default=True)
    is_visible = models.BooleanField(_('is visible'), default=True)
    auto_refresh = models.BooleanField(_('auto refresh'), default=True)
    refresh_interval = models.IntegerField(_('refresh interval (seconds)'), default=60)
    title = models.CharField(_('title'), max_length=255, blank=True)
    subtitle = models.CharField(_('subtitle'), max_length=255, blank=True)
    data_source = models.CharField(_('data source'), max_length=50, blank=True)
    data_query = models.JSONField(_('data query'), default=dict)
    filters = models.JSONField(_('filters'), default=dict)
    sort = models.JSONField(_('sort configuration'), default=list)
    aggregation = models.JSONField(_('aggregation'), default=dict)
    limit = models.PositiveIntegerField(_('limit'), default=0)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_widget'
        verbose_name = _('report widget')
        verbose_name_plural = _('report widgets')
        indexes = [
            models.Index(fields=['tenant_id', 'dashboard_id', 'widget_type']),
            models.Index(fields=['tenant_id', 'is_active', 'is_visible']),
            models.Index(fields=['tenant_id', 'widget_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.widget_type})"
    
    def get_data(self):
        from ..services.widget_data_fetcher import WidgetDataFetcher
        fetcher = WidgetDataFetcher(self)
        return fetcher.fetch()
    
    def render(self):
        from ..services.widget_engine import WidgetEngine
        engine = WidgetEngine(self)
        return engine.render()