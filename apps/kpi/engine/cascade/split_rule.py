from decimal import Decimal
from typing import List, Dict, Optional
from django.db import models

class SplitRules:
    def calculate_target(self, parent_target: Decimal, rule, entity_id: str, entity_type: str, tenant_id: str, targets_scope: Optional[List[Dict]] = None) -> Decimal:
        rule_type = getattr(rule, 'rule_type', rule)
        if rule_type == 'EQUAL_SPLIT':
            return self._equal_split(parent_target, entity_type, entity_id, tenant_id, targets_scope)
        elif rule_type == 'WEIGHTED':
            return self._weighted_by_headcount(parent_target, entity_type, entity_id, tenant_id, targets_scope)
        elif rule_type == 'WEIGHTED_BY_BUDGET':
            return self._weighted_by_budget(parent_target, entity_type, entity_id, tenant_id, targets_scope)
        elif rule_type == 'CUSTOM':
            return self._custom_split(parent_target, rule, entity_id, entity_type, tenant_id, targets_scope)
        return self._equal_split(parent_target, entity_type, entity_id, tenant_id, targets_scope)
    
    def _equal_split(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str, targets_scope: Optional[List[Dict]] = None) -> Decimal:
        if targets_scope and len(targets_scope) > 0:
            total_count = len(targets_scope)
        elif entity_type == 'INDIVIDUAL':
            total_count = self._get_user_count(entity_id, tenant_id)
        else:
            total_count = self._get_node_count(entity_type, tenant_id)
        if total_count == 0:
            return Decimal('0')
        return parent_target / Decimal(str(total_count))
    
    def _weighted_by_headcount(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str, targets_scope: Optional[List[Dict]] = None) -> Decimal:
        entity_headcount = self._get_entity_headcount(entity_type, entity_id, tenant_id)
        
        if targets_scope and len(targets_scope) > 0:
            total_headcount = sum(
                self._get_entity_headcount(
                    t.get('entity_type', entity_type),
                    t.get('entity_id') or t.get('user_id'),
                    tenant_id
                )
                for t in targets_scope
            )
        else:
            total_headcount = self._get_total_employees(tenant_id)

        if total_headcount == 0:
            return Decimal('0')
        return parent_target * (Decimal(str(entity_headcount)) / Decimal(str(total_headcount)))
    
    def _weighted_by_budget(self, parent_target: Decimal, entity_type: str, entity_id: str, tenant_id: str, targets_scope: Optional[List[Dict]] = None) -> Decimal:
        entity_budget = self._get_entity_budget(entity_type, entity_id, tenant_id)
        
        if targets_scope and len(targets_scope) > 0:
            total_budget = sum(
                self._get_entity_budget(
                    t.get('entity_type', entity_type),
                    t.get('entity_id') or t.get('user_id'),
                    tenant_id
                )
                for t in targets_scope
            )
        else:
            total_budget = self._get_total_budget(tenant_id)

        if total_budget == 0:
            return Decimal('0')
        return parent_target * (entity_budget / total_budget)
    
    def _custom_split(self, parent_target: Decimal, rule, entity_id: str, entity_type: str = 'INDIVIDUAL', tenant_id: str = '', targets_scope: Optional[List[Dict]] = None) -> Decimal:
        config = getattr(rule, 'configuration', {}) or {}
        custom_weights = config.get('weights', {})
        if entity_id in custom_weights:
            weight = Decimal(str(custom_weights[entity_id]))
            return parent_target * (weight / Decimal('100'))
        return self._equal_split(parent_target, entity_type, entity_id, tenant_id, targets_scope)
    
    def _get_node_count(self, entity_type: str, tenant_id: str) -> int:
        if not tenant_id:
            return 0
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
    
    def _get_user_count(self, entity_id: str, tenant_id: str) -> int:
        if not tenant_id:
            return 0
        from apps.accounts.models import User
        if not entity_id:
            return User.objects.filter(tenant_id=tenant_id, is_active=True).count()
        user_by_id = User.objects.filter(tenant_id=tenant_id, id=entity_id, is_active=True).first()
        if user_by_id and user_by_id.department_id:
            return User.objects.filter(tenant_id=tenant_id, department_id=user_by_id.department_id, is_active=True).count()
        dept_count = User.objects.filter(tenant_id=tenant_id, department_id=entity_id, is_active=True).count()
        if dept_count > 0:
            return dept_count
        return User.objects.filter(tenant_id=tenant_id, is_active=True).count()
    
    def _get_total_employees(self, tenant_id: str) -> int:
        if not tenant_id:
            return 0
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=tenant_id, is_active=True).count()
    
    def _get_entity_headcount(self, entity_type: str, entity_id: str, tenant_id: str) -> int:
        if not tenant_id or not entity_id:
            return 0
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
            filter_kwargs['position__division_id'] = entity_id
        elif entity_type == 'DEPARTMENT':
            filter_kwargs['position__department_id'] = entity_id
        elif entity_type == 'SECTION':
            filter_kwargs['position__section_id'] = entity_id
        elif entity_type == 'UNIT':
            filter_kwargs['position__unit_id'] = entity_id
        else:
            return 0
            
        try:
            return Employment.objects.filter(**filter_kwargs).count()
        except Exception:
            return 0
    
    def _get_total_budget(self, tenant_id: str) -> Decimal:
        if not tenant_id:
            return Decimal('0')
        from apps.structure.models.cost_center import CostCenter
        try:
            result = CostCenter.objects.filter(
                tenant_id=tenant_id, is_active=True, is_deleted=False
            ).aggregate(total=models.Sum('budget_amount'))['total']
            return Decimal(str(result)) if result else Decimal('0')
        except Exception:
            return Decimal('0')
    
    def _get_entity_budget(self, entity_type: str, entity_id: str, tenant_id: str) -> Decimal:
        if not tenant_id or not entity_id:
            return Decimal('0')
        from apps.structure.models.cost_center import CostCenter
        if entity_type == 'INDIVIDUAL':
            return Decimal('0')
        
        try:
            cc = CostCenter.objects.filter(
                organizational_unit_id=entity_id,
                tenant_id=tenant_id,
                is_active=True,
                is_deleted=False
            ).first()
            return Decimal(str(cc.budget_amount)) if cc and cc.budget_amount else Decimal('0')
        except Exception:
            return Decimal('0')