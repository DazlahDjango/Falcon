from decimal import Decimal
from typing import Optional
from django.db import models

class SplitRules:
    def calculate_target(self, parent_target: Decimal, rule, entity_id: str, entity_type: str, tenant_id: str) -> Decimal:
        rule_type = rule.rule_type
        if rule_type == 'EQUAL_SPLIT':
            return self._equal_split(parent_target, entity_type, entity_id, tenant_id)
        elif rule_type == 'WEIGHTED':
            return self._weighted_by_headcount(parent_target, entity_type, entity_id, tenant_id)
        elif rule_type == 'WEIGHTED_BY_BUDGET':
            return self._weighted_by_budget(parent_target, entity_type, entity_id, tenant_id)
        elif rule_type == 'CUSTOM':
            return self._custom_split(parent_target, rule, entity_id)
        return self._equal_split(parent_target, entity_type, entity_id, tenant_id)
    
    def _equal_split(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        if entity_type == 'DEPARTMENT':
            total_count = self._get_department_count(tenant_id)
        else:
            total_count = self._get_user_count(entity_id, tenant_id)
        if total_count == 0:
            return Decimal('0')
        return parent_target / Decimal(str(total_count))
    
    def _weighted_by_headcount(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        if entity_type == 'DEPARTMENT':
            total_headcount = self._get_total_employees(tenant_id)
            dept_headcount = self._get_department_headcount(entity_id, tenant_id)
            if total_headcount == 0:
                return Decimal('0')
            return parent_target * (Decimal(str(dept_headcount)) / Decimal(str(total_headcount)))
        else:
            return self._equal_split(parent_target, entity_type, entity_id, tenant_id)
    
    def _weighted_by_budget(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        if entity_type == 'DEPARTMENT':
            total_budget = self._get_total_budget(tenant_id)
            dept_budget = self._get_department_budget(entity_id, tenant_id)
            if total_budget == 0:
                return Decimal('0')
            return parent_target * (dept_budget / total_budget)
        else:
            return self._equal_split(parent_target, entity_type, entity_id, tenant_id)
    
    def _custom_split(self, parent_target: Decimal, rule, entity_id: str) -> Decimal:
        config = rule.configuration
        custom_weights = config.get('weights', {})
        if entity_id in custom_weights:
            weight = Decimal(str(custom_weights[entity_id]))
            return parent_target * (weight / Decimal('100'))
        return self._equal_split(parent_target, 'INDIVIDUAL', entity_id, '')
    
    def _get_department_count(self, tenant_id: str) -> int:
        from apps.structure.models import Department
        return Department.objects.filter(tenant_id=tenant_id, is_active=True).count()
    
    def _get_user_count(self, department_id: str, tenant_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=tenant_id, department_id=department_id, is_active=True).count()
    
    def _get_total_employees(self, tenant_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=tenant_id, is_active=True).count()
    
    def _get_department_headcount(self, department_id: str, tenant_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=tenant_id, department_id=department_id, is_active=True).count()
    
    def _get_total_budget(self, tenant_id: str) -> Decimal:
        return Decimal('0')
    
    def _get_department_budget(self, department_id: str, tenant_id: str) -> Decimal:
        return Decimal('0')