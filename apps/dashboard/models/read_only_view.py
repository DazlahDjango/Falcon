# apps/dashboard/models/read_only_view.py

from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel
from apps.dashboard.constants import DashboardType


class ReadOnlyView(BaseDashboardModel):
    """
    Read-Only dashboard view configuration.
    """
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='readonly_views',
        help_text=_("Read-only user")
    )
    
    view_name = models.CharField(
        max_length=100,
        default='default',
        help_text=_("Name of the saved view")
    )
    
    dashboard_type = models.CharField(
        max_length=50,
        default=DashboardType.READ_ONLY,
        choices=DashboardType.CHOICES,
        help_text=_("Dashboard type")
    )
    
    default_view_type = models.CharField(
        max_length=50,
        choices=[
            ('executive', _('Executive View')),
            ('manager', _('Manager View')),
            ('staff', _('Staff View')),
        ],
        default='executive',
        help_text=_("Which dashboard type to show by default")
    )
    
    allowed_view_types = models.JSONField(
        default=list,
        help_text=_("Which dashboard types this user can access")
    )
    
    hide_sensitive_data = models.BooleanField(
        default=True,
        help_text=_("Hide sensitive KPI data")
    )
    
    mask_individual_scores = models.BooleanField(
        default=False,
        help_text=_("Mask individual employee scores")
    )
    
    show_export_button = models.BooleanField(
        default=True,
        help_text=_("Show export button in read-only mode")
    )
    
    show_refresh_button = models.BooleanField(
        default=True,
        help_text=_("Show refresh button")
    )
    
    auto_refresh_interval = models.IntegerField(
        default=60,
        help_text=_("Auto-refresh interval in seconds (0 = disabled)")
    )
    
    show_watermark = models.BooleanField(
        default=True,
        help_text=_("Show 'READ ONLY' watermark on dashboard")
    )
    
    watermark_text = models.CharField(
        max_length=100,
        default='READ ONLY',
        help_text=_("Text to display as watermark")
    )
    
    is_default = models.BooleanField(
        default=False,
        help_text=_("Is this the default view for this user")
    )
    
    class Meta:
        db_table = 'dashboard_readonly_views'
        verbose_name = _('Read-Only View')
        verbose_name_plural = _('Read-Only Views')
        unique_together = ['user', 'view_name', 'tenant_id']
        indexes = [
            models.Index(fields=['tenant_id', 'user', 'is_default']),
            models.Index(fields=['user', 'is_default']),
            models.Index(fields=['default_view_type']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.view_name}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            ReadOnlyView.objects.filter(
                user=self.user,
                tenant_id=self.tenant_id,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)
    
    def get_allowed_view_types_list(self):
        if self.allowed_view_types:
            return self.allowed_view_types
        return ['executive', 'manager', 'staff']