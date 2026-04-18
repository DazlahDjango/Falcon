from django.db import models
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum
from .base import TenantAwareManager, SoftDeleteManager
from apps.kpi.models import MonthlyActual

class KPIManager(SoftDeleteManager):
    def active_kpis(self):
        return self.filter(is_active=True)
    def by_framework(self, framework_id):
        return self.filter(framework_id=framework_id)
    def by_section(self, section_id):
        return self.filter(section_id=section_id)
    def by_category(self, category_id):
        return self.filter(category_id=category_id)
    def by_owner(self, owner_id):
        return self.filter(owner_id=owner_id)
    def by_department(self, department_id):
        return self.filter(department_id=department_id)
    def by_kpi_type(self, kpi_type):
        return self.filter(kpi_type=kpi_type)
    def with_calculation_logic(self, logic):
        return self.filter(calculation_logic=logic)
    def with_measure_type(self, measure_type):
        return self.filter(measure_type=measure_type)
    def for_user_hierarchy(self, user):
        from django.db.models import Q
        user_kpis = Q(owner=user)
        direct_reports = user.get_direct_reports().values_list('id', flat=True)
        report_kpis = Q(owner_id__in=direct_reports)
        managed_depts = getattr(user, 'managed_departments', [])
        dept_kpis = Q(department_id__in=managed_depts) if managed_depts else Q()
        return self.filter(user_kpis | report_kpis | dept_kpis)
    def with_weights(self):
        return self.prefetch_related('weights')
    def with_recent_actuals(self, year, month):
        return self.prefetch_related(
            models.Prefetch(
                'actuals',
                queryset=MonthlyActual.objects.filter(year=year, month=month),
                to_attr='recent_actuals'
            )
        )
    def get_kpi_statistics(self):
        return self.aggregate(
            total_kpis=Count('id'),
            active_kpis=Count('id', filter=Q(is_active=True)),
            inactive_kpis=Count('id', filter=Q(is_active=False)),
            commercial_kpis=Count('id', filter=Q(sector__sector_type='COMMERCIAL')),
            ngo_kpis=Count('id', filter=Q(sector__sector_type='NGO')),
            public_kpis=Count('id', filter=Q(sector__sector_type='PUBLIC')),
            consulting_kpis=Count('id', filter=Q(sector__sector_type='CONSULTING')),
        )
    def search(self, query):
        if not query:
            return self
        return self.filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query)
        )
    def by_strategic_objective(self, objective):
        return self.filter(strategic_objective=objective)
    def needs_attention(self, threshold_days=30):
        cutoff = timezone.now() - timezone.timedelta(days=threshold_days)
        return self.filter(updated_at__lt=cutoff, is_active=True)
    def get_weighted_kpis_for_user(self, user):
        return self.filter(weights__user=user, weights__is_active=True).select_related('weights')
    
class KPIFrameworkManager(TenantAwareManager):
    def published(self):
        return self.filter(status='PUBLISHED')
    def draft(self):
        return self.filter(status='DRAFT')
    def archived(self):
        return self.filter(status='ACHIVED')
    def default_for_sector(self, sector_id):
        return self.filter(sector_id=sector_id, is_default=True).first()
    def current_effective(self, date=None):
        date = date or timezone.now().date()
        return self.filter(
            Q(effective_from__lte=date) & 
            (Q(effective_to__gte=date) | Q(effective_to__isnull=True))
        )
    def with_kpi_count(self):
        return self.annotate(kpi_count=Count('kpis'))
    
class KPICategoryManager(TenantAwareManager):
    def root_categories(self):
        return self.filter(parent__isnull=True)
    def by_framework(self, framework_id):
        return self.filter(framework_id=framework_id)
    def with_children(self):
        return self.prefetch_related('children')
    def active(self):
        return self.filter(is_active=True)
    def get_category_tree(self, framework_id=None):
        queryset = self.root_categories()
        if framework_id:
            queryset = queryset.by_framework(framework_id)
        return queryset.prefetch_related('children__children')
