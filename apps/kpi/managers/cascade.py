from django.db import models
from django.db.models import Q, Sum, Count, F
from .base import TenantAwareManager


class CascadeMapManager(TenantAwareManager):
    def by_organization_target(self, target_id):
        return self.filter(organization_target_id=target_id)
    def by_department_target(self, target_id):
        return self.filter(department_target_id=target_id)
    def by_individual_target(self, target_id):
        return self.filter(individual_target_id=target_id)
    def get_cascade_tree(self, organization_target_id):
        return self.select_related(
            'department_target',
            'individual_target',
            'cascade_rule'
        ).filter(organization_target_id=organization_target_id)
    def verify_cascade_sum(self, organization_target_id):
        total_cascaded = self.filter(
            organization_target_id=organization_target_id
        ).aggregate(
            total=Sum('contribution_percentage')
        )['total'] or 0
        return total_cascaded <= 100
    def get_cascade_summary(self, organization_target_id):
        return self.filter(
            organization_target_id=organization_target_id
        ).aggregate(
            total_departments=Count('department_target', distinct=True),
            total_individuals=Count('individual_target', distinct=True),
            total_contribution=Sum('contribution_percentage'),
        )

class CascadeRuleManager(TenantAwareManager):
    def active(self):
        return self.filter(is_active=True)
    def default(self):
        return self.filter(is_default=True, is_active=True).first()
    def by_type(self, rule_type):
        return self.filter(rule_type=rule_type)
    def get_rule_for_sector(self, sector_id):
        from ..models import Sector
        sector = Sector.objects.get(id=sector_id)
        if sector.sector_type == 'COMMERCIAL':
            return self.filter(rule_type='WEIGHTED_BY_BUDGET', is_active=True).first()
        if sector.sector_type == 'NGO':
            return self.filter(rule_type='EQUAL_SPLIT', is_active=True).first()
        return self.filter(rule_type='WEIGHTED', is_active=True).first()