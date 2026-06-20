from django.db.models import Sum, Count
from .base import TenantAwareManager

class CascadeMapManager(TenantAwareManager):
    def by_organization_target(self, target_id):
        return self.filter(organization_target_id=target_id)

    def by_department_target(self, target_id):
        return self.filter(department_target_id=target_id)

    def by_individual_target(self, target_id):
        return self.filter(individual_target_id=target_id)

    def get_tree(self, organization_target_id):
        return self.select_related(
            'department_target', 'individual_target', 'cascade_rule'
        ).filter(organization_target_id=organization_target_id)

    def verify_sum(self, organization_target_id):
        total = self.filter(organization_target_id=organization_target_id).aggregate(
            total=Sum('contribution_percentage')
        )['total'] or 0
        return total <= 100

    def get_summary(self, organization_target_id):
        return self.filter(organization_target_id=organization_target_id).aggregate(
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

    def for_sector(self, sector_type):
        mapping = {
            'COMMERCIAL': 'WEIGHTED_BY_BUDGET',
            'NGO': 'EQUAL_SPLIT',
            'PUBLIC': 'WEIGHTED',
            'CONSULTING': 'WEIGHTED',
        }
        rule_type = mapping.get(sector_type, 'WEIGHTED')
        return self.filter(rule_type=rule_type, is_active=True).first()