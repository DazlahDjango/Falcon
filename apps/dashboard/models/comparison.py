from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel


class PeriodComparison(BaseDashboardModel):
    COMPARISON_TYPE_MONTH_OVER_MONTH = 'mom'
    COMPARISON_TYPE_QUARTER_OVER_QUARTER = 'qoq'
    COMPARISON_TYPE_YEAR_OVER_YEAR = 'yoy'
    COMPARISON_TYPE_CUSTOM = 'custom'
    
    COMPARISON_TYPE_CHOICES = [
        (COMPARISON_TYPE_MONTH_OVER_MONTH, 'Month over Month'),
        (COMPARISON_TYPE_QUARTER_OVER_QUARTER, 'Quarter over Quarter'),
        (COMPARISON_TYPE_YEAR_OVER_YEAR, 'Year over Year'),
        (COMPARISON_TYPE_CUSTOM, 'Custom Periods'),
    ]
    
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User who saved this comparison")
    name = models.CharField(_('name'), max_length=100)
    comparison_type = models.CharField(_('comparison type'), max_length=10, choices=COMPARISON_TYPE_CHOICES)
    current_period = models.JSONField(_('current period'), help_text="Current period definition (year, month, quarter)")
    previous_period = models.JSONField(_('previous period'), help_text="Previous period definition")
    department_ids = models.JSONField(_('department IDs'), default=list, blank=True, help_text="Departments to compare, empty = all")
    kpi_ids = models.JSONField(_('KPI IDs'), default=list, blank=True, help_text="KPIs to compare, empty = all")
    cached_results = models.JSONField(_('cached results'), default=dict, blank=True, help_text="Cached comparison results")
    cached_at = models.DateTimeField(_('cached at'), null=True, blank=True)
    is_public = models.BooleanField(_('is public'), default=False, help_text="Can other users see this comparison?")

    class Meta:
        db_table = 'dashboard_period_comparison'
        verbose_name = _('period comparison')
        verbose_name_plural = _('period comparisons')
        indexes = [
            models.Index(fields=['user_id', 'comparison_type']),
            models.Index(fields=['user_id', 'is_public']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_comparison_type_display()}"