from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class DashboardConfig(BaseDashboardModel):
    DASHBOARD_TYPE_EXECUTIVE = 'executive'
    DASHBOARD_TYPE_CLIENT_ADMIN = 'client_admin'
    DASHBOARD_TYPE_SUPER_ADMIN = 'super_admin'
    DASHBOARD_TYPE_MANAGER = 'manager'
    DASHBOARD_TYPE_STAFF = 'staff'
    DASHBOARD_TYPE_CHAMPION = 'champion'
    
    DASHBOARD_TYPE_CHOICES = [
        (DASHBOARD_TYPE_EXECUTIVE, 'Executive Dashboard'),
        (DASHBOARD_TYPE_CLIENT_ADMIN, 'Client Admin Dashboard'),
        (DASHBOARD_TYPE_SUPER_ADMIN, 'Super Admin Dashboard'),
        (DASHBOARD_TYPE_MANAGER, 'Manager Dashboard'),
        (DASHBOARD_TYPE_STAFF, 'Staff Dashboard'),
        (DASHBOARD_TYPE_CHAMPION, 'Dashboard Champion'),
    ]
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User this config belongs to")
    dashboard_type = models.CharField(_('dashboard type'), max_length=20, choices=DASHBOARD_TYPE_CHOICES, db_index=True)
    layout = models.JSONField(_('layout'), default=dict, help_text="Dashboard grid layout configuration")
    default_filters = models.JSONField(_('default filters'), default=dict, blank=True, help_text="Period, department, KPI category filters")
    default_time_period = models.CharField(_('default time period'), max_length=20, default='monthly',
                                           choices=[('monthly', 'Monthly'), ('quarterly', 'Quarterly'), ('yearly', 'Yearly')])
    default_view = models.CharField(_('default view'), max_length=50, default='overview')
    is_default = models.BooleanField(_('is default'), default=False, help_text="Is this the user's default dashboard?")
    is_shared = models.BooleanField(_('is shared'), default=False, help_text="Can this config be shared with other users?")
    shared_with_roles = models.JSONField(_('shared with roles'), default=list, blank=True, help_text="Roles that can use this config")
    name = models.CharField(_('name'), max_length=100, default='Default Dashboard')
    description = models.TextField(_('description'), blank=True)
    version = models.PositiveSmallIntegerField(_('version'), default=1)
    
    class Meta:
        db_table = 'dashboard_config'
        verbose_name = _('dashboard config')
        verbose_name_plural = _('dashboard configs')
        unique_together = [['user_id', 'dashboard_type']]
        indexes = [
            models.Index(fields=['user_id', 'dashboard_type']),
            models.Index(fields=['dashboard_type', 'is_default']),
            models.Index(fields=['tenant_id', 'dashboard_type']),
        ]
    def __str__(self):
        return f"{self.get_dashboard_type_display()} for {self.user_id}"
    def get_layout_widgets(self):
        return self.layout.get('widgets', [])

class WidgetConfig(BaseDashboardModel):
    WIDGET_TYPE_KPI_LIST = 'kpi_list'
    WIDGET_TYPE_TREND_CHART = 'trend_chart'
    WIDGET_TYPE_DEPARTMENT_HEATMAP = 'department_heatmap'
    WIDGET_TYPE_COMPLIANCE = 'compliance'
    WIDGET_TYPE_RED_ALERT = 'red_alert'
    WIDGET_TYPE_PENDING_APPROVALS = 'pending_approvals'
    WIDGET_TYPE_MISSING_DATA = 'missing_data'
    WIDGET_TYPE_TENANT_SUMMARY = 'tenant_summary'  # For Super Admin
    WIDGET_TYPE_SUBSCRIPTION_STATUS = 'subscription_status'  # For Super Admin
    WIDGET_TYPE_ORG_TREE = 'org_tree'  # For Executive
    WIDGET_TYPE_EXECUTIVE_SCORECARD = 'executive_scorecard'  # For Executive
    WIDGET_TYPE_CLIENT_KPI_BREAKDOWN = 'client_kpi_breakdown'  # For Client Admin
    
    WIDGET_TYPE_CHOICES = [
        (WIDGET_TYPE_KPI_LIST, 'KPI List'),
        (WIDGET_TYPE_TREND_CHART, 'Trend Chart'),
        (WIDGET_TYPE_DEPARTMENT_HEATMAP, 'Department Heatmap'),
        (WIDGET_TYPE_COMPLIANCE, 'Compliance Report'),
        (WIDGET_TYPE_RED_ALERT, 'Red Alert KPIs'),
        (WIDGET_TYPE_PENDING_APPROVALS, 'Pending Approvals'),
        (WIDGET_TYPE_MISSING_DATA, 'Missing Data Alert'),
        (WIDGET_TYPE_TENANT_SUMMARY, 'Tenant Summary'),
        (WIDGET_TYPE_SUBSCRIPTION_STATUS, 'Subscription Status'),
        (WIDGET_TYPE_ORG_TREE, 'Organization Tree'),
        (WIDGET_TYPE_EXECUTIVE_SCORECARD, 'Executive Scorecard'),
        (WIDGET_TYPE_CLIENT_KPI_BREAKDOWN, 'Client KPI Breakdown'),
    ]
    dashboard = models.ForeignKey(DashboardConfig, on_delete=models.CASCADE, related_name='widgets', verbose_name=_('dashboard'))
    widget_type = models.CharField(_('widget type'), max_length=30, choices=WIDGET_TYPE_CHOICES, db_index=True)
    row = models.PositiveSmallIntegerField(_('row'), default=0)
    col = models.PositiveSmallIntegerField(_('column'), default=0)
    width = models.PositiveSmallIntegerField(_('width'), default=4)
    height = models.PositiveSmallIntegerField(_('height'), default=2)
    config = models.JSONField(_('configuration'), default=dict, blank=True, help_text="Widget-specific config (KPIs to show, filters, etc.)")
    title = models.CharField(_('title'), max_length=100, blank=True)
    show_title = models.BooleanField(_('show title'), default=True)
    refresh_interval = models.PositiveSmallIntegerField(_('refresh interval seconds'), default=60, help_text="Auto-refresh interval in seconds, 0 = no auto-refresh")
    is_visible = models.BooleanField(_('is visible'), default=True)
    order = models.PositiveSmallIntegerField(_('order'), default=0)
    class Meta:
        db_table = 'dashboard_widget_config'
        verbose_name = _('widget config')
        verbose_name_plural = _('widget configs')
        ordering = ['order', 'row', 'col']
        indexes = [
            models.Index(fields=['dashboard', 'widget_type']),
            models.Index(fields=['dashboard', 'is_visible']),
        ]
    
    def __str__(self):
        return f"{self.get_widget_type_display()} on {self.dashboard}"