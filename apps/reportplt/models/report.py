# apps/reportplt/models/report.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import ReportManager

class Report(BaseModel):
    REPORT_TYPES = [
        ('kpi', 'KPI Performance Report'),
        ('departmental', 'Departmental Performance Report'),
        ('executive', 'Executive Summary Report'),
        ('compliance', 'Compliance Report'),
        ('trend', 'Trend Analysis Report'),
        ('comparative', 'Comparative Report'),
        ('mission', 'Mission Status Report'),
        ('pip', 'PIP Tracking Report'),
        ('custom', 'Custom Report'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('queued', 'Queued'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('archived', 'Archived'),
    ]
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('pptx', 'PowerPoint'),
        ('html', 'HTML'),
    ]
    DATA_SOURCE_CHOICES = [
        ('kpi', 'KPI Data'),
        ('reviews', 'Review Data'),
        ('tasks', 'Task Data'),
        ('pip', 'PIP Data'),
        ('combined', 'Combined Data'),
    ]
    CATEGORY_CHOICES = [
        ('operational', 'Operational'),
        ('strategic', 'Strategic'),
        ('financial', 'Financial'),
        ('hr', 'Human Resources'),
        ('compliance', 'Compliance'),
        ('impact', 'Impact'),
        ('project', 'Project'),
        ('custom', 'Custom'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    description = models.TextField(_('description'), blank=True)
    report_type = models.CharField(_('report type'), max_length=50, choices=REPORT_TYPES, db_index=True)
    status = models.CharField(_('status'), max_length=50, choices=STATUS_CHOICES, default='draft', db_index=True)
    default_format = models.CharField(_('default format'), max_length=20, choices=FORMAT_CHOICES, default='pdf')
    category = models.CharField(_('category'), max_length=50, choices=CATEGORY_CHOICES, default='operational', db_index=True)
    data_source = models.CharField(_('data source'), max_length=50, choices=DATA_SOURCE_CHOICES, default='kpi')
    owner = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_reports')
    is_scheduled = models.BooleanField(_('is scheduled'), default=False)
    is_system = models.BooleanField(_('is system generated'), default=False)
    is_published = models.BooleanField(_('is published'), default=False)
    is_archived = models.BooleanField(_('is archived'), default=False)
    is_public = models.BooleanField(_('is public'), default=False)
    needs_refresh = models.BooleanField(_('needs refresh'), default=False)
    include_executive_summary = models.BooleanField(_('include executive summary'), default=True)
    include_charts = models.BooleanField(_('include charts'), default=True)
    include_tables = models.BooleanField(_('include tables'), default=True)
    include_commentary = models.BooleanField(_('include commentary'), default=True)
    config = models.JSONField(_('report configuration'), default=dict)
    parameters = models.JSONField(_('report parameters'), default=dict)
    filters = models.JSONField(_('applied filters'), default=dict)
    sorting = models.JSONField(_('sorting configuration'), default=list)
    grouping = models.JSONField(_('grouping configuration'), default=list)
    aggregation = models.JSONField(_('aggregation configuration'), default=dict)
    allowed_roles = models.JSONField(_('allowed roles'), default=list)
    allowed_departments = models.JSONField(_('allowed departments'), default=list)
    tags = models.JSONField(_('tags'), default=list)
    last_generated_at = models.DateTimeField(_('last generated at'), null=True, blank=True)
    generation_duration = models.FloatField(_('generation duration (seconds)'), default=0)
    row_count = models.IntegerField(_('row count'), default=0)
    cache_ttl = models.IntegerField(_('cache TTL (seconds)'), default=3600)
    version = models.PositiveIntegerField(_('version'), default=1)
    
    objects = ReportManager()
    
    class Meta:
        db_table = 'reportplt_report'
        verbose_name = _('report')
        verbose_name_plural = _('reports')
        indexes = [
            models.Index(fields=['tenant_id', 'report_type', 'status']),
            models.Index(fields=['tenant_id', 'category', 'is_published']),
            models.Index(fields=['tenant_id', 'owner', 'status']),
            models.Index(fields=['tenant_id', 'is_scheduled']),
            models.Index(fields=['tenant_id', 'is_public', 'is_published']),
            models.Index(fields=['tenant_id', 'last_generated_at']),
        ]
    
    def __str__(self):
        return self.name
    
    def is_ready(self):
        return self.status == 'completed'
    
    def is_accessible_by(self, user):
        if user.is_superuser or user.role == 'super_admin':
            return True
        if self.is_public:
            return True
        if self.owner_id == user.id:
            return True
        if user.role in self.allowed_roles:
            return True
        if user.department and user.department in self.allowed_departments:
            return True
        return False
    
    def mark_generating(self):
        self.status = 'generating'
        self.save(update_fields=['status'])
    
    def mark_completed(self):
        self.status = 'completed'
        self.last_generated_at = timezone.now()
        self.needs_refresh = False
        self.save(update_fields=['status', 'last_generated_at', 'needs_refresh'])
    
    def mark_failed(self):
        self.status = 'failed'
        self.save(update_fields=['status'])
    
    def mark_refresh_needed(self):
        self.needs_refresh = True
        self.save(update_fields=['needs_refresh'])
    
    def archive(self):
        self.is_archived = True
        self.status = 'archived'
        self.save(update_fields=['is_archived', 'status'])
    
    def unarchive(self):
        self.is_archived = False
        self.status = 'draft'
        self.save(update_fields=['is_archived', 'status'])
    
    def increment_version(self):
        self.version += 1
        self.save(update_fields=['version'])