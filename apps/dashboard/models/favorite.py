from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class FavoriteKPI(BaseDashboardModel):
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User who favorited this KPI")
    kpi_id = models.UUIDField(_('KPI ID'), db_index=True, help_text="Reference to KPI definition")
    kpi_name = models.CharField(_('KPI name'), max_length=200, help_text="Denormalized for display")
    order = models.PositiveSmallIntegerField(_('order'), default=0)
    dashboard = models.ForeignKey('DashboardConfig', on_delete=models.SET_NULL, null=True, blank=True, related_name='favorites', verbose_name=_('dashboard'))
    notes = models.TextField(_('notes'), blank=True, help_text="User notes about this KPI")
    class Meta:
        db_table = 'dashboard_favorite_kpi'
        verbose_name = _('favorite KPI')
        verbose_name_plural = _('favorite KPIs')
        ordering = ['order']
        unique_together = [['user_id', 'kpi_id']]
        indexes = [
            models.Index(fields=['user_id', 'order']),
            models.Index(fields=['user_id', 'dashboard']),
        ]
    def __str__(self):
        return f"{self.kpi_name} favorited by {self.user_id}"