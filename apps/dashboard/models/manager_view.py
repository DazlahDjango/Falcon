# apps/dashboard/models/manager_view.py

from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel
from apps.dashboard.constants import DashboardType


class ManagerView(BaseDashboardModel):
    """
    Manager/Supervisor dashboard view configuration.
    """
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='manager_views',
        help_text=_("Manager user")
    )
    
    view_name = models.CharField(
        max_length=100,
        default='default',
        help_text=_("Name of the saved view")
    )
    
    dashboard_type = models.CharField(
        max_length=50,
        default=DashboardType.MANAGER,
        choices=DashboardType.CHOICES,
        help_text=_("Dashboard type")
    )
    
    team_filters = models.JSONField(
        default=dict,
        help_text=_("Filters applied to team view")
    )
    
    show_personal_kpis = models.BooleanField(
        default=True,
        help_text=_("Show personal KPIs on manager dashboard")
    )
    
    show_team_kpis = models.BooleanField(
        default=True,
        help_text=_("Show team KPIs on manager dashboard")
    )
    
    default_team_view = models.CharField(
        max_length=50,
        choices=[
            ('list', _('List View')),
            ('cards', _('Card View')),
            ('grid', _('Grid View')),
        ],
        default='cards',
        help_text=_("Default view for team members")
    )
    
    show_pending_approvals = models.BooleanField(
        default=True,
        help_text=_("Show pending approvals widget")
    )
    
    approval_notifications = models.BooleanField(
        default=True,
        help_text=_("Receive notifications for pending approvals")
    )
    
    team_member_sort = models.CharField(
        max_length=50,
        choices=[
            ('name', _('By Name')),
            ('score', _('By Score')),
            ('status', _('By Status')),
        ],
        default='name',
        help_text=_("How to sort team members")
    )
    
    items_per_page = models.IntegerField(
        default=20,
        help_text=_("Number of team members to show per page")
    )
    
    is_default = models.BooleanField(
        default=False,
        help_text=_("Is this the default view for this manager")
    )
    
    class Meta:
        db_table = 'dashboard_manager_views'
        verbose_name = _('Manager View')
        verbose_name_plural = _('Manager Views')
        unique_together = ['user', 'view_name', 'tenant_id']
        indexes = [
            models.Index(fields=['tenant_id', 'user', 'is_default']),
            models.Index(fields=['user', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.view_name}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            ManagerView.objects.filter(
                user=self.user,
                tenant_id=self.tenant_id,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)