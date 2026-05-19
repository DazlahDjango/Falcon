from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class ExecutiveViewPreset(BaseDashboardModel):
    VIEW_TYPE_DEPARTMENT = 'department'
    VIEW_TYPE_STRATEGIC_OBJECTIVE = 'strategic_objective'
    VIEW_TYPE_REGION = 'region'
    VIEW_TYPE_COST_CENTER = 'cost_center'
    
    VIEW_TYPE_CHOICES = [
        (VIEW_TYPE_DEPARTMENT, 'By Department'),
        (VIEW_TYPE_STRATEGIC_OBJECTIVE, 'By Strategic Objective'),
        (VIEW_TYPE_REGION, 'By Region'),
        (VIEW_TYPE_COST_CENTER, 'By Cost Center'),
    ]
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="Executive user who owns this view")
    name = models.CharField(_('name'), max_length=100)
    view_type = models.CharField(_('view type'), max_length=25, choices=VIEW_TYPE_CHOICES)
    filters = models.JSONField(_('filters'), default=dict, help_text="Applied filters for this view")
    sort_by = models.CharField(_('sort by'), max_length=50, blank=True)
    sort_order = models.CharField(_('sort order'), max_length=4, default='desc', choices=[('asc', 'Ascending'), ('desc', 'Descending')])
    show_traffic_lights = models.BooleanField(_('show traffic lights'), default=True)
    show_trend_indicators = models.BooleanField(_('show trend indicators'), default=True)
    is_default = models.BooleanField(_('is default'), default=False)
    
    class Meta:
        db_table = 'dashboard_executive_view_preset'
        verbose_name = _('executive view preset')
        verbose_name_plural = _('executive view presets')
        indexes = [
            models.Index(fields=['user_id', 'view_type']),
            models.Index(fields=['user_id', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_view_type_display()}) for {self.user_id}"