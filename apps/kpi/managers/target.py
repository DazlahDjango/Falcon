from django.db import models
from django.db.models import Q, Sum, F, Avg, Count
from django.utils import timezone
from .base import TenantAwareManager

class AnnualTargetManager(TenantAwareManager):
    def for_user(self, user_id, year=None):
        queryset = self.filter(user_id=user_id)
        if year:
            queryset = queryset.filter(year=year)
        return queryset
    def for_kpi(self, kpi_id, year=None):
        queryset = self.filter(kpi_id=kpi_id)
        if year:
            queryset = queryset.filter(year=year)
        return queryset
    def by_year(self, year):
        return self.filter(year=year)
    def with_phasing(self):
        return self.prefetch_related('monthly_phasing')
    def get_user_target_summary(self, user_id, year):
        return self.filter(user_id=user_id, year=year).aggregate(
            total_targets=Sum('target_value'),
            avg_target=Avg('target_value'),
            kpi_count=Count('id'),
        )
    def pending_approval(self):
        return self.filter(approved_by__isnull=True)
    def approved(self):
        return self.filter(approved_by__isnull=False)
    def get_cascade_targets(self, organization_target_id):
        return self.filter(cascade_maps__organization_target_id=organization_target_id)
    
class MonthlyPhasingManager(TenantAwareManager):
    def for_target(self, annual_target_id):
        return self.filter(annual_target_id=annual_target_id)
    def for_period(self, year, month):
        return self.filter(annual_target__year=year, month=month)
    def locked(self):
        return self.filter(is_locked=True)
    def unlocked(self):
        return self.filter(is_locked=False)
    def get_monthly_summary(self, user_id, year):
        return self.filter(
            annual_target__user_id=user_id,
            annual_target__year=year
        ).values('month').annotate(
            total_target=Sum('target_value')
        ).order_by('month')
    def get_cumulative_target(self, user_id, year, month):
        return self.filter(
            annual_target__user_id=user_id,
            annual_target__year=year,
            month__lte=month
        ).aggregate(cumulative=Sum('target_value'))['cumulative'] or 0
    def verify_phasing_sum(self, annual_target_id):
        annual_target = self.filter(annual_target_id=annual_target_id).first().annual_target
        total_phased = self.filter(annual_target_id=annual_target_id).aggregate(total=Sum('target_value'))['total'] or 0
        return total_phased == annual_target.target_value
    def lock_phasing_for_cycle(self, tenant_id, performance_cycle, user):
        from apps.kpi.models import PhasingLock
        PhasingLock.objects.create(
            tenant_id=tenant_id,
            performance_cycle=performance_cycle,
            locked_by=user
        )
        updated = self.filter(annual_target__year=performance_cycle[-4:]).update(
            is_locked=True,
            locked_at=timezone.now(),
            locked_by=user
        )
        return updated