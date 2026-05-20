# apps/dashboard/models/champion_view.py

from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel
from apps.dashboard.constants import DashboardType


class ChampionView(BaseDashboardModel):
    """
    Dashboard Champion view configuration.
    """
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='champion_views',
        help_text=_("Champion user")
    )
    
    view_name = models.CharField(
        max_length=100,
        default='default',
        help_text=_("Name of the saved view")
    )
    
    dashboard_type = models.CharField(
        max_length=50,
        default=DashboardType.CHAMPION,
        choices=DashboardType.CHOICES,
        help_text=_("Dashboard type")
    )
    
    target_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='champion_edited_views',
        help_text=_("User whose dashboard is being edited")
    )
    
    saved_configuration = models.JSONField(
        default=dict,
        help_text=_("Saved dashboard configuration")
    )
    
    is_template = models.BooleanField(
        default=False,
        help_text=_("Can this view be used as a template?")
    )
    
    template_name = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text=_("Name if this is a template")
    )
    
    template_description = models.TextField(
        blank=True,
        help_text=_("Description of this template")
    )
    
    template_category = models.CharField(
        max_length=100,
        blank=True,
        help_text=_("Category for template")
    )
    
    apply_to_team = models.BooleanField(
        default=False,
        help_text=_("Apply this configuration to entire team")
    )
    
    team_filter = models.JSONField(
        default=dict,
        help_text=_("Filter to select which team members to apply to")
    )
    
    version = models.IntegerField(
        default=1,
        help_text=_("Configuration version number")
    )
    
    version_notes = models.TextField(
        blank=True,
        help_text=_("Notes about this version")
    )
    
    is_default = models.BooleanField(
        default=False,
        help_text=_("Is this the default champion view")
    )
    
    class Meta:
        db_table = 'dashboard_champion_views'
        verbose_name = _('Champion View')
        verbose_name_plural = _('Champion Views')
        unique_together = ['user', 'view_name', 'tenant_id']
        indexes = [
            models.Index(fields=['tenant_id', 'user', 'is_default']),
            models.Index(fields=['user', 'is_default']),
            models.Index(fields=['is_template']),
            models.Index(fields=['template_category']),
        ]
    
    def __str__(self):
        if self.is_template:
            return f"Template: {self.template_name or self.view_name}"
        return f"{self.user.email} - {self.view_name}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            ChampionView.objects.filter(
                user=self.user,
                tenant_id=self.tenant_id,
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)