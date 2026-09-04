from django.db import models
from django.db.models import Q, Count
from django.utils import timezone
from .base import TenantAwareManager, SoftDeleteManager

class KPIManager(SoftDeleteManager):
    def active(self):
        return self.filter(is_active=True)

    def by_category(self, category_id):
        return self.filter(category_id=category_id)

    def by_owner(self, owner_id):
        return self.filter(owner_id=owner_id)

    def by_department(self, department_id):
        return self.filter(department_id=department_id)

    def by_type(self, kpi_type):
        return self.filter(kpi_type=kpi_type)

    def with_calculation_logic(self, logic):
        return self.filter(calculation_logic=logic)

    def with_measure_type(self, measure_type):
        return self.filter(measure_type=measure_type)

    def approved(self):
        return self.filter(approval_status='APPROVED')

    def pending_approval(self):
        return self.filter(approval_status='PENDING_APPROVAL')

    def for_parent(self, parent_kpi_id):
        return self.filter(parent_kpi_id=parent_kpi_id)

    def staff_created(self):
        return self.filter(is_staff_created=True)

    def staff_operational(self):
        return self.filter(is_staff_created=True, parent_kpi__isnull=True)

    def sub_kpis(self):
        return self.filter(parent_kpi__isnull=False)

    def for_user_hierarchy(self, user):
        role = str(getattr(user, 'role', '')).lower()
        if role in ['super_admin', 'superadmin', 'platform_admin', 'client_admin', 'dashboard_champion', 'executive']:
            return self

        user_kpis = Q(owner=user) | Q(created_by=user)
        direct_reports = []
        if hasattr(user, 'get_direct_reports'):
            try:
                direct_reports = user.get_direct_reports().values_list('id', flat=True)
            except Exception:
                direct_reports = []
        report_kpis = Q(owner_id__in=direct_reports) if direct_reports else Q()
        managed_depts = getattr(user, 'managed_departments', [])
        dept_kpis = Q(department_id__in=managed_depts) if managed_depts else Q()
        return self.filter(user_kpis | report_kpis | dept_kpis)

    def with_recent_actuals(self, year, month):
        from apps.kpi.models import MonthlyActual
        return self.prefetch_related(
            models.Prefetch(
                'actuals',
                queryset=MonthlyActual.objects.filter(year=year, month=month),
                to_attr='recent_actuals'
            )
        )

    def get_statistics(self):
        return self.aggregate(
            total=models.Count('id'),
            active=models.Count('id', filter=Q(is_active=True)),
            inactive=models.Count('id', filter=Q(is_active=False)),
        )

    def search(self, query):
        if not query:
            return self
        return self.filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query)
        )

    def needs_attention(self, threshold_days=30):
        cutoff = timezone.now() - timezone.timedelta(days=threshold_days)
        return self.filter(updated_at__lt=cutoff, is_active=True)


class KPICategoryManager(TenantAwareManager):
    def root_categories(self):
        return self.filter(parent__isnull=True)

    def active(self):
        return self.filter(is_active=True)

    def get_tree(self):
        queryset = self.root_categories()
        return queryset.prefetch_related('children__children')