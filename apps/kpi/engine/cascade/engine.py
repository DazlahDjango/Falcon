from decimal import Decimal
from typing import Dict, List, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from apps.kpi.models import AnnualTarget, CascadeMap, CascadeRule, CascadeHistory
from .split_rule import SplitRules
from .validators import CascadeValidator

# Cascade Engine for Target Allocation & Tree Building
class CascadeEngine:
    def __init__(self, tenant_id: str = None, user_id: str = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.validator = CascadeValidator()
        self.split_rules = SplitRules()
    
    def set_context(self, tenant_id: str, user_id: str = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        return self
    
    def cascade_organization_target(self, org_target_id: str, rule_id: str, targets: List[Dict]) -> List[CascadeMap]:
        if not self.tenant_id:
            raise ValueError("Tenant context not set. Call set_context() first")
        
        org_target = AnnualTarget.objects.get(id=org_target_id, tenant_id=self.tenant_id)
        rule = CascadeRule.objects.get(id=rule_id, tenant_id=self.tenant_id)
        
        self.validator.validate_cascade(org_target, targets, rule)
        
        cascade_maps = []
        with transaction.atomic():
            for target_data in targets:
                entity_type = target_data['entity_type']
                entity_id = target_data['entity_id']
                parent_target_id = target_data.get('parent_target_id') or target_data.get('parent_target')
                if parent_target_id:
                    parent_target_obj = AnnualTarget.objects.filter(id=parent_target_id, tenant_id=self.tenant_id).first() or org_target
                else:
                    parent_target_obj = org_target

                contribution = target_data.get('contribution_percentage')
                if contribution:
                    target_value = parent_target_obj.target_value * (Decimal(str(contribution)) / 100)
                else:
                    target_value = self.split_rules.calculate_target(
                        parent_target_obj.target_value, rule, entity_id, entity_type, self.tenant_id
                    )
                
                target_user_id = target_data.get('user_id')
                if not target_user_id:
                    if entity_type == 'INDIVIDUAL':
                        target_user_id = entity_id
                    elif entity_type == 'DIVISION':
                        from apps.structure.models import Division
                        div = Division.objects.filter(id=entity_id, tenant_id=self.tenant_id).first()
                        if div:
                            target_user_id = str(div.director_id or div.manager_id or '') or None
                    elif entity_type == 'DEPARTMENT':
                        from apps.structure.models import Department
                        dept = Department.objects.filter(id=entity_id, tenant_id=self.tenant_id).first()
                        if dept:
                            target_user_id = str(dept.manager_id or getattr(dept, 'department_head_id', None) or '') or None
                    elif entity_type == 'SECTION':
                        from apps.structure.models import Section
                        sec = Section.objects.filter(id=entity_id, tenant_id=self.tenant_id).first()
                        if sec:
                            target_user_id = str(getattr(sec, 'section_lead_id', None) or getattr(sec, 'manager_id', None) or '') or None
                    elif entity_type == 'UNIT':
                        from apps.structure.models import Unit
                        unit = Unit.objects.filter(id=entity_id, tenant_id=self.tenant_id).first()
                        if unit:
                            target_user_id = str(getattr(unit, 'unit_lead_id', None) or getattr(unit, 'manager_id', None) or '') or None

                if not target_user_id and entity_type != 'INDIVIDUAL':
                    from apps.structure.models import Employment
                    filter_kwargs = {'tenant_id': self.tenant_id, 'is_current': True}
                    if entity_type == 'DIVISION':
                        filter_kwargs['position__division_id'] = entity_id
                    elif entity_type == 'DEPARTMENT':
                        filter_kwargs['position__department_id'] = entity_id
                    elif entity_type == 'SECTION':
                        filter_kwargs['position__section_id'] = entity_id
                    elif entity_type == 'UNIT':
                        filter_kwargs['position__unit_id'] = entity_id
                    emp = Employment.objects.filter(**filter_kwargs).first()
                    if emp:
                        target_user_id = str(emp.user_id)

                if not target_user_id:
                    target_user_id = org_target.user_id

                target_obj, _ = AnnualTarget.objects.update_or_create(
                    tenant_id=self.tenant_id,
                    kpi=org_target.kpi,
                    user_id=target_user_id,
                    year=org_target.year,
                    defaults={
                        'target_value': target_value,
                        'notes': f"Cascaded [{entity_type}:{entity_id}] from target {parent_target_obj.id}"
                    }
                )

                map_kwargs = {
                    'tenant_id': self.tenant_id,
                    'organization_target': org_target,
                    'parent_target': parent_target_obj,
                    'child_target': target_obj,
                    'cascade_rule': rule,
                    'contribution_percentage': contribution or 0
                }
                
                if entity_type == 'DIVISION':
                    map_kwargs['division_target'] = target_obj
                elif entity_type == 'DEPARTMENT':
                    map_kwargs['department_target'] = target_obj
                elif entity_type == 'SECTION':
                    map_kwargs['section_target'] = target_obj
                elif entity_type == 'UNIT':
                    map_kwargs['unit_target'] = target_obj
                elif entity_type == 'INDIVIDUAL':
                    map_kwargs['individual_target'] = target_obj
                
                cascade_map, _ = CascadeMap.objects.update_or_create(
                    tenant_id=self.tenant_id,
                    organization_target=org_target,
                    parent_target=parent_target_obj,
                    child_target=target_obj,
                    defaults=map_kwargs
                )
                cascade_maps.append(cascade_map)
            
            if cascade_maps:
                CascadeHistory.objects.create(
                    tenant_id=self.tenant_id,
                    cascade_map=cascade_maps[0],
                    action='CASCADE',
                    source_target_value=org_target.target_value,
                    resulting_targets=self._serialize_targets(targets),
                    performed_by_id=self.user_id,
                    performed_at=timezone.now()
                )
        
        return cascade_maps
    
    def cascade_department_target(self, dept_target_id: str, rule_id: str, user_ids: List[str], weights: Optional[Dict] = None) -> List[CascadeMap]:
        if not self.tenant_id:
            raise ValueError("Tenant context not set. Call set_context() first")
        
        dept_target = AnnualTarget.objects.get(id=dept_target_id, tenant_id=self.tenant_id)
        rule = CascadeRule.objects.get(id=rule_id, tenant_id=self.tenant_id)
        
        cascade_maps = []
        with transaction.atomic():
            for user_id in user_ids:
                if weights and user_id in weights:
                    contribution = Decimal(str(weights[user_id]))
                    target_value = dept_target.target_value * (contribution / 100)
                else:
                    target_value = self.split_rules.calculate_target(
                        dept_target.target_value, rule, user_id, 'INDIVIDUAL', self.tenant_id
                    )
                
                individual_target, _ = AnnualTarget.objects.update_or_create(
                    tenant_id=self.tenant_id,
                    kpi=dept_target.kpi,
                    user_id=user_id,
                    year=dept_target.year,
                    defaults={
                        'target_value': target_value,
                        'notes': f"Cascaded from parent target {dept_target.id}"
                    }
                )
                
                cascade_map, _ = CascadeMap.objects.update_or_create(
                    tenant_id=self.tenant_id,
                    department_target=dept_target,
                    individual_target=individual_target,
                    defaults={
                        'parent_target': dept_target,
                        'child_target': individual_target,
                        'cascade_rule': rule,
                        'contribution_percentage': weights.get(user_id, 0) if weights else 0
                    }
                )
                cascade_maps.append(cascade_map)
        
        return cascade_maps
    
    def rollback_cascade(self, cascade_map_id: str) -> bool:
        if not self.tenant_id:
            raise ValueError("Tenant context not set. Call set_context() first")
        
        cascade_map = CascadeMap.objects.get(id=cascade_map_id, tenant_id=self.tenant_id)
        
        with transaction.atomic():
            if cascade_map.child_target:
                cascade_map.child_target.delete()
            if cascade_map.department_target:
                cascade_map.department_target.delete()
            if cascade_map.individual_target:
                cascade_map.individual_target.delete()
            if cascade_map.division_target:
                cascade_map.division_target.delete()
            if cascade_map.section_target:
                cascade_map.section_target.delete()
            if cascade_map.unit_target:
                cascade_map.unit_target.delete()
            
            CascadeHistory.objects.create(
                tenant_id=self.tenant_id,
                cascade_map=cascade_map,
                action='ROLLBACK',
                source_target_value=cascade_map.parent_target.target_value if cascade_map.parent_target else 0,
                resulting_targets={},
                performed_by_id=self.user_id,
                performed_at=timezone.now(),
                notes="Cascade rolled back"
            )
            
            cascade_map.delete()
        
        return True
    
    def _serialize_targets(self, targets: List[Dict]) -> Dict:
        import uuid
        from decimal import Decimal
        serialized = []
        for target in targets:
            s_target = {}
            for k, v in target.items():
                if isinstance(v, (uuid.UUID, Decimal)):
                    s_target[k] = str(v)
                else:
                    s_target[k] = v
            serialized.append(s_target)
        return {'targets': serialized}