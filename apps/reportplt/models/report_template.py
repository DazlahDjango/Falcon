# apps/reportplt/models/report_template.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import TemplateManager

class ReportTemplate(BaseModel):
    TEMPLATE_TYPES = [
        ('executive', 'Executive Dashboard'),
        ('departmental', 'Departmental Scorecard'),
        ('kpi', 'KPI Report'),
        ('mission', 'Mission Status Report'),
        ('compliance', 'Compliance Report'),
        ('trend', 'Trend Analysis'),
        ('comparative', 'Comparative Analysis'),
        ('pip', 'PIP Report'),
        ('custom', 'Custom Template'),
    ]
    SECTOR_CHOICES = [
        ('commercial', 'Commercial/Corporate'),
        ('ngo', 'NGO/Non-Profit'),
        ('public', 'Public Sector'),
        ('consulting', 'Consulting'),
        ('all', 'All Sectors'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    description = models.TextField(_('description'), blank=True)
    template_type = models.CharField(_('template type'), max_length=50, choices=TEMPLATE_TYPES, db_index=True)
    category = models.CharField(_('category'), max_length=50, blank=True)
    sector = models.CharField(_('sector'), max_length=50, choices=SECTOR_CHOICES, default='all', db_index=True)
    department = models.CharField(_('department'), max_length=100, blank=True)
    owner = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='report_templates')
    is_system = models.BooleanField(_('is system template'), default=False)
    is_published = models.BooleanField(_('is published'), default=False)
    is_default = models.BooleanField(_('is default'), default=False)
    is_popular = models.BooleanField(_('is popular'), default=False)
    has_prebuilt_charts = models.BooleanField(_('has prebuilt charts'), default=False)
    has_dynamic_filters = models.BooleanField(_('has dynamic filters'), default=False)
    has_parameters = models.BooleanField(_('has parameters'), default=False)
    layout_config = models.JSONField(_('layout configuration'), default=dict)
    widget_config = models.JSONField(_('widget configuration'), default=dict)
    filter_config = models.JSONField(_('filter configuration'), default=dict)
    parameter_config = models.JSONField(_('parameter configuration'), default=dict)
    chart_config = models.JSONField(_('chart configuration'), default=dict)
    table_config = models.JSONField(_('table configuration'), default=dict)
    style_config = models.JSONField(_('style configuration'), default=dict)
    export_config = models.JSONField(_('export configuration'), default=dict)
    applicable_industries = models.JSONField(_('applicable industries'), default=list)
    org_size = models.IntegerField(_('maximum org size'), default=0)
    version = models.PositiveIntegerField(_('version'), default=1)
    
    objects = TemplateManager()
    
    class Meta:
        db_table = 'reportplt_template'
        verbose_name = _('report template')
        verbose_name_plural = _('report templates')
        indexes = [
            models.Index(fields=['tenant_id', 'template_type', 'sector']),
            models.Index(fields=['tenant_id', 'is_system', 'is_published']),
            models.Index(fields=['tenant_id', 'is_default', 'sector']),
            models.Index(fields=['tenant_id', 'is_popular']),
        ]
        unique_together = [['tenant_id', 'name', 'is_system']]
    
    def __str__(self):
        return self.name
    
    def is_applicable_to_sector(self, sector):
        return self.sector == 'all' or self.sector == sector
    
    def apply_to_report(self, report):
        report.config = self.layout_config
        report.save(update_fields=['config'])
        return report
    
    def duplicate(self, new_name=None, new_owner=None):
        from copy import deepcopy
        template = ReportTemplate(
            tenant_id=self.tenant_id,
            name=new_name or f"{self.name} (Copy)",
            description=self.description,
            template_type=self.template_type,
            category=self.category,
            sector=self.sector,
            department=self.department,
            owner=new_owner or self.owner,
            is_system=False,
            is_published=False,
            is_default=False,
            is_popular=False,
            has_prebuilt_charts=self.has_prebuilt_charts,
            has_dynamic_filters=self.has_dynamic_filters,
            has_parameters=self.has_parameters,
            layout_config=deepcopy(self.layout_config),
            widget_config=deepcopy(self.widget_config),
            filter_config=deepcopy(self.filter_config),
            parameter_config=deepcopy(self.parameter_config),
            chart_config=deepcopy(self.chart_config),
            table_config=deepcopy(self.table_config),
            style_config=deepcopy(self.style_config),
            export_config=deepcopy(self.export_config),
            applicable_industries=deepcopy(self.applicable_industries),
            org_size=self.org_size,
        )
        template.save()
        return template