# apps/reportplt/models/report_filter.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportFilter(BaseModel):
    FILTER_TYPES = [
        ('date_range', 'Date Range'),
        ('dropdown', 'Dropdown'),
        ('multi_select', 'Multi-Select'),
        ('text', 'Text'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('hierarchy', 'Hierarchical'),
        ('custom', 'Custom'),
    ]
    name = models.CharField(_('name'), max_length=255)
    filter_type = models.CharField(_('filter type'), max_length=50, choices=FILTER_TYPES, db_index=True)
    owner = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='saved_filters')
    is_global = models.BooleanField(_('is global'), default=False)
    is_system = models.BooleanField(_('is system'), default=False)
    is_default = models.BooleanField(_('is default'), default=False)
    config = models.JSONField(_('filter configuration'), default=dict)
    values = models.JSONField(_('saved values'), default=dict)
    display_label = models.CharField(_('display label'), max_length=255, blank=True)
    placeholder = models.CharField(_('placeholder'), max_length=255, blank=True)
    help_text = models.TextField(_('help text'), blank=True)
    required = models.BooleanField(_('required'), default=False)
    multiple = models.BooleanField(_('multiple'), default=False)
    options = models.JSONField(_('options'), default=list)
    default_values = models.JSONField(_('default values'), default=list)
    validation = models.JSONField(_('validation rules'), default=dict)
    dependencies = models.JSONField(_('dependencies'), default=list)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_filter'
        verbose_name = _('report filter')
        verbose_name_plural = _('report filters')
        indexes = [
            models.Index(fields=['tenant_id', 'owner', 'filter_type']),
            models.Index(fields=['tenant_id', 'is_global', 'is_default']),
            models.Index(fields=['tenant_id', 'is_system']),
        ]
        unique_together = [['tenant_id', 'owner', 'name']]
    
    def __str__(self):
        return self.name
    
    def is_accessible_by(self, user):
        if user.is_superuser or user.role == 'super_admin':
            return True
        if self.is_global:
            return True
        return self.owner_id == user.id
    
    def apply_to_queryset(self, queryset):
        from ..services.filter_engine import FilterEngine
        engine = FilterEngine(self)
        return engine.apply(queryset, self.values)
    
    def get_options(self):
        if self.filter_type in ['dropdown', 'multi_select']:
            return self.options
        return []
    
    def validate_value(self, value):
        from ..validators import FilterValidator
        validator = FilterValidator(self)
        return validator.validate(value)