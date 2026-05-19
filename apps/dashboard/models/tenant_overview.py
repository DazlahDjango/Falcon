from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseDashboardModel

class TenantOverviewSnapshot(BaseDashboardModel):
    client_id = models.UUIDField(_('client ID'), db_index=True, unique=True)
    client_name = models.CharField(_('client name'), max_length=200)
    subscription_status = models.CharField(_('subscription status'), max_length=20, default='active')
    subscription_plan = models.CharField(_('subscription plan'), max_length=50, blank=True)
    subscription_expires_at = models.DateTimeField(_('subscription expires at'), null=True, blank=True)
    total_users = models.PositiveIntegerField(_('total users'), default=0)
    active_users = models.PositiveIntegerField(_('active users'), default=0)
    total_kpis = models.PositiveIntegerField(_('total KPIs'), default=0)
    kpi_green_count = models.PositiveIntegerField(_('green KPIs'), default=0)
    kpi_yellow_count = models.PositiveIntegerField(_('yellow KPIs'), default=0)
    kpi_red_count = models.PositiveIntegerField(_('red KPIs'), default=0)
    avg_individual_score = models.DecimalField(_('avg individual score'), max_digits=5, decimal_places=2, null=True, blank=True)
    avg_department_score = models.DecimalField(_('avg department score'), max_digits=5, decimal_places=2, null=True, blank=True)
    data_submission_rate = models.DecimalField(_('data submission rate'), max_digits=5, decimal_places=2, null=True, blank=True)
    review_completion_rate = models.DecimalField(_('review completion rate'), max_digits=5, decimal_places=2, null=True, blank=True)
    last_active_at = models.DateTimeField(_('last active at'), null=True, blank=True)
    total_logins_30d = models.PositiveIntegerField(_('total logins 30 days'), default=0)
    snapshot_date = models.DateField(_('snapshot date'), db_index=True)
    is_stale = models.BooleanField(_('is stale'), default=False)
    
    class Meta:
        db_table = 'dashboard_tenant_overview_snapshot'
        verbose_name = _('tenant overview snapshot')
        verbose_name_plural = _('tenant overview snapshots')
        indexes = [
            models.Index(fields=['client_id', 'snapshot_date']),
            models.Index(fields=['subscription_status', 'subscription_expires_at']),
            models.Index(fields=['snapshot_date', 'is_stale']),
        ]
    
    def __str__(self):
        return f"Snapshot for {self.client_name} on {self.snapshot_date}"
    
    @property
    def total_kpi_count(self):
        return self.kpi_green_count + self.kpi_yellow_count + self.kpi_red_count
    
    @property
    def overall_health_score(self):
        if self.total_kpi_count == 0:
            return None
        green_weight = 100
        yellow_weight = 50
        red_weight = 0
        total_score = (self.kpi_green_count * green_weight) + (self.kpi_yellow_count * yellow_weight) + (self.kpi_red_count * red_weight)
        return round(total_score / self.total_kpi_count, 2)