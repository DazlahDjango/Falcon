from django.db.models import Sum, Avg, Count
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

    def pending_approval(self):
        return self.filter(approved_at__isnull=True)

    def approved(self):
        return self.filter(approved_at__isnull=False)

    def get_summary(self, user_id, year):
        return self.filter(user_id=user_id, year=year).aggregate(
            total_targets=Sum('target_value'),
            avg_target=Avg('target_value'),
            kpi_count=Count('id'),
        )


class MonthlyPhasingManager(TenantAwareManager):
    def for_target(self, annual_target_id):
        return self.filter(annual_target_id=annual_target_id)

    def for_period(self, year, month):
        return self.filter(annual_target__year=year, month=month)

    def locked(self):
        return self.filter(is_locked=True)

    def unlocked(self):
        return self.filter(is_locked=False)

    def get_cumulative(self, user_id, year, month):
        return self.filter(
            annual_target__user_id=user_id,
            annual_target__year=year,
            month__lte=month
        ).aggregate(cumulative=Sum('target_value'))['cumulative'] or 0

    def verify_total(self, annual_target_id):
        target = self.filter(annual_target_id=annual_target_id).first().annual_target
        total = self.filter(annual_target_id=annual_target_id).aggregate(total=Sum('target_value'))['total'] or 0
        return total == target.target_value

    def lock_cycle(self, tenant_id, performance_cycle, user):
        from apps.kpi.models import PhasingLock
        PhasingLock.objects.create(
            tenant_id=tenant_id,
            performance_cycle=performance_cycle,
            locked_by=user
        )
        year = int(performance_cycle[-4:])
        return self.filter(annual_target__year=year).update(
            is_locked=True,
            locked_at=timezone.now(),
            locked_by=user
        )