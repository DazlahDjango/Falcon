from django.db import models
from .base import BaseStructureManager

class PositionManager(BaseStructureManager):    
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    def by_grade(self, tenant_id, grade):
        return self.filter(tenant_id=tenant_id, grade=grade, is_deleted=False)
    def by_department(self, department_id, tenant_id):
        return self.filter(default_department_id=department_id, tenant_id=tenant_id, is_deleted=False)
    def vacant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, current_incumbents_count=0, is_deleted=False)
    def occupied(self, tenant_id):
        return self.filter(tenant_id=tenant_id, current_incumbents_count__gt=0, is_deleted=False)
    def at_level(self, tenant_id, level):
        return self.filter(tenant_id=tenant_id, level=level, is_deleted=False)
    def level_range(self, tenant_id, min_level, max_level):
        return self.filter(tenant_id=tenant_id, level__gte=min_level, level__lte=max_level, is_deleted=False)
    def reporting_to(self, position_id, tenant_id):
        return self.filter(reports_to_id=position_id, tenant_id=tenant_id, is_deleted=False)
    def under_manager(self, user_id, tenant_id):
        from apps.structure.models.employment import Employment
        manager_employments = Employment.objects.filter(user_id=user_id, is_current=True, is_deleted=False, tenant_id=tenant_id)
        manager_position_ids = [e.position_id for e in manager_employments]
        subordinate_positions = self.filter(reports_to_id__in=manager_position_ids, tenant_id=tenant_id, is_deleted=False)
        return subordinate_positions
    def get_reporting_chain_up(self, position_id, tenant_id):
        from apps.structure.models.position import Position
        chain = []
        current = self.filter(id=position_id, tenant_id=tenant_id).first()
        while current and current.reports_to:
            current = self.filter(id=current.reports_to_id, tenant_id=tenant_id).first()
            if current:
                chain.append(current)
        return chain
    def get_reporting_chain_down(self, position_id, tenant_id, max_depth=10):
        from apps.structure.models.position import Position
        def _get_children(pos_id, depth):
            if depth > max_depth:
                return []
            children = list(self.filter(reports_to_id=pos_id, tenant_id=tenant_id, is_deleted=False))
            result = []
            for child in children:
                result.append(child)
                result.extend(_get_children(child.id, depth + 1))
            return result
        return _get_children(position_id, 0)
    def increment_incumbent_count(self, position_id):
        return self.filter(id=position_id).update(current_incumbents_count=models.F('current_incumbents_count') + 1)
    def decrement_incumbent_count(self, position_id):
        return self.filter(id=position_id).update(current_incumbents_count=models.F('current_incumbents_count') - 1)