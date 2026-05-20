# apps/dashboard/models/staff_view.py

from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel
from apps.dashboard.constants import DashboardType


class StaffView(BaseDashboardModel):
    """
    Staff dashboard view configuration.
    """
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='staff_views',
        help_text=_("Staff user")
    )
    
    view_name = models.CharField(
        max_length=100,
        default='default',
        help_text=_("Name of the saved view")
    )
    
    dashboard_type = models.CharField(
        max_length=50,
        default=DashboardType.STAFF,
        choices=DashboardType.CHOICES,
        help_text=_("Dashboard type")
    )
    
    show_mission_status = models.BooleanField(
        default=True,
        help_text=_("Show mission status report on dashboard")
    )
    
    show_tasks = models.BooleanField(
        default=True,
        help_text=_("Show pending tasks on dashboard")
    )
    
    show_recent_activity = models.BooleanField(
        default=True,
        help_text=_("Show recent activity on dashboard")
    )
    
    show_performance_chart = models.BooleanField(
        default=True,
        help_text=_("Show performance trend chart")
    )
    
    show_kpi_comparison = models.BooleanField(
        default=False,
        help_text=_("Show comparison with team average")
    )
    
    kpi_display_mode = models.CharField(
        max_length=20,
        choices=[
            ('list', _('List View')),
            ('cards', _('Card View')),
            ('compact', _('Compact View')),
        ],
        default='cards',
        help_text=_("How KPIs are displayed")
    )
    
    auto_save_drafts = models.BooleanField(
        default=True,
        help_text=_("Automatically save KPI data entry drafts")
    )
    
    default_period = models.CharField(
        max_length=20,
        choices=[
            ('current', _('Current Period')),
            ('last', _('Last Period')),
        ],
        default='current',
        help_text=_("Default period to show")
    )
    
    email_on_approval = models.BooleanField(
        default=True,
        help_text=_("Send email when KPI data is approved")
    )
    
    email_on_rejection = models.BooleanField(
        default=True,
        help_text=_("Send email when KPI data is rejected")
    )
    
    is_default = models.BooleanField(
        default=False,
        help_text=_("Is this the default view for this staff member")
    )
    
    class Meta:
        db_table = 'dashboard_staff_views'
        verbose_name = _('Staff View')
        verbose_name_plural = _('Staff Views')
        unique_together = ['user', 'view_name', 'tenant_id']
        indexes = [
            models.Index(fields=['tenant_id', 'user', 'is_default']),
            models.Index(fields=['user', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.view_name}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            StaffView.objects.filter(
                user=self.user,
                tenant_id=self.tenant_id,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)