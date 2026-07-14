from decimal import Decimal
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
        if entity_type == 'INDIVIDUAL':
            total_count = self._get_user_count(entity_id, tenant_id)
        else:
            total_count = self._get_node_count(entity_type, tenant_id)
        if total_count == 0:
            return Decimal('0')
        return parent_target / Decimal(str(total_count))
    
    def _weighted_by_headcount(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        total_headcount = self._get_total_employees(tenant_id)
        entity_headcount = self._get_entity_headcount(entity_type, entity_id, tenant_id)
        if total_headcount == 0:
            return Decimal('0')
        return parent_target * (Decimal(str(entity_headcount)) / Decimal(str(total_headcount)))
    
    def _weighted_by_budget(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        total_budget = self._get_total_budget(tenant_id)
        entity_budget = self._get_entity_budget(entity_type, entity_id, tenant_id)
        if total_budget == 0:
            return Decimal('0')
        return parent_target * (entity_budget / total_budget)
    
    def _custom_split(self, parent_target: Decimal, rule, entity_id: str) -> Decimal:
        config = rule.configuration
        custom_weights = config.get('weights', {})
        if entity_id in custom_weights:
            weight = Decimal(str(custom_weights[entity_id]))
            return parent_target * (weight / Decimal('100'))
        return self._equal_split(parent_target, 'INDIVIDUAL', entity_id, '')
    
    def _get_node_count(self, entity_type: str, tenant_id: str) -> int:
        if entity_type == 'DIVISION':
            from apps.structure.models import Division
            return Division.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False).count()
        elif entity_type == 'DEPARTMENT':
            from apps.structure.models import Department
            return Department.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False).count()
        elif entity_type == 'SECTION':
            from apps.structure.models import Section
            return Section.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False).count()
        elif entity_type == 'UNIT':
            from apps.structure.models import Unit
            return Unit.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False).count()
        return 0
    
    def _get_user_count(self, department_id: str, tenant_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=tenant_id, department=department_id, is_active=True).count()
    
    def _get_total_employees(self, tenant_id: str) -> int:
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=tenant_id, is_active=True).count()
    
    def _get_entity_headcount(self, entity_type: str, entity_id: str, tenant_id: str) -> int:
        from apps.structure.models.employment import Employment
        if entity_type == 'INDIVIDUAL':
            return 1
        
        filter_kwargs = {
            'is_current': True,
            'is_active': True,
            'is_deleted': False,
            'tenant_id': tenant_id
        }
        if entity_type == 'DIVISION':
            filter_kwargs['division_id'] = entity_id
        elif entity_type == 'DEPARTMENT':
            filter_kwargs['department_id'] = entity_id
        elif entity_type == 'SECTION':
            filter_kwargs['section_id'] = entity_id
        elif entity_type == 'UNIT':
            filter_kwargs['unit_id'] = entity_id
        else:
            return 0
            
        return Employment.objects.filter(**filter_kwargs).count()
    
    def _get_total_budget(self, tenant_id: str) -> Decimal:
        from apps.structure.models.cost_center import CostCenter
        result = CostCenter.objects.filter(
            tenant_id=tenant_id, is_active=True, is_deleted=False
        ).aggregate(total=models.Sum('budget_amount'))['total']
        return Decimal(str(result)) if result else Decimal('0')
    
    def _get_entity_budget(self, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        from apps.structure.models.cost_center import CostCenter
        if entity_type == 'INDIVIDUAL':
            return Decimal('0')
        
        cc = CostCenter.objects.filter(
            organizational_unit_id=entity_id,
            tenant_id=tenant_id,
            is_active=True,
            is_deleted=False
        ).first()
        return cc.budget_amount if cc and cc.budget_amount else Decimal('0')