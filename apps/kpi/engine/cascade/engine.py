from decimal import Decimal
from typing import Dict, List, Optional, Any
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from apps.kpi.models import AnnualTarget, CascadeMap, CascadeRule, CascadeHistory
from .split_rule import SplitRules
from .validators import CascadeValidator

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
                contribution = target_data.get('contribution_percentage')
                
                if contribution:
                    target_value = org_target.target_value * (Decimal(str(contribution)) / 100)
                else:
                    target_value = self.split_rules.calculate_target(
                        org_target.target_value, rule, entity_id, entity_type, self.tenant_id
                    )
                
                if entity_type == 'DEPARTMENT':
                    dept_target = AnnualTarget.objects.create(
                        tenant_id=self.tenant_id,
                        kpi=org_target.kpi,
                        user_id=target_data.get('user_id'),
                        year=org_target.year,
                        target_value=target_value,
                        notes=f"Cascaded from organization target {org_target.id}"
                    )
                    cascade_map = CascadeMap.objects.create(
                        tenant_id=self.tenant_id,
                        organization_target=org_target,
                        department_target=dept_target,
                        cascade_rule=rule,
                        contribution_percentage=contribution or 0
                    )
                elif entity_type == 'INDIVIDUAL':
                    individual_target = AnnualTarget.objects.create(
                        tenant_id=self.tenant_id,
                        kpi=org_target.kpi,
                        user_id=entity_id,
                        year=org_target.year,
                        target_value=target_value,
                        notes=f"Cascaded from organization target {org_target.id}"
                    )
                    cascade_map = CascadeMap.objects.create(
                        tenant_id=self.tenant_id,
                        organization_target=org_target,
                        individual_target=individual_target,
                        cascade_rule=rule,
                        contribution_percentage=contribution or 0
                    )
                else:
                    continue
                
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
                
                individual_target = AnnualTarget.objects.create(
                    tenant_id=self.tenant_id,
                    kpi=dept_target.kpi,
                    user_id=user_id,
                    year=dept_target.year,
                    target_value=target_value,
                    notes=f"Cascaded from department target {dept_target.id}"
                )
                
                cascade_map = CascadeMap.objects.create(
                    tenant_id=self.tenant_id,
                    department_target=dept_target,
                    individual_target=individual_target,
                    cascade_rule=rule,
                    contribution_percentage=weights.get(user_id, 0) if weights else 0
                )
                cascade_maps.append(cascade_map)
        
        return cascade_maps
    
    def rollback_cascade(self, cascade_map_id: str) -> bool:
        if not self.tenant_id:
            raise ValueError("Tenant context not set. Call set_context() first")
        
        cascade_map = CascadeMap.objects.get(id=cascade_map_id, tenant_id=self.tenant_id)
        
        with transaction.atomic():
            if cascade_map.department_target:
                cascade_map.department_target.delete()
            if cascade_map.individual_target:
                cascade_map.individual_target.delete()
            
            CascadeHistory.objects.create(
                tenant_id=self.tenant_id,
                cascade_map=cascade_map,
                action='ROLLBACK',
                source_target_value=cascade_map.organization_target.target_value if cascade_map.organization_target else 0,
                resulting_targets={},
                performed_by_id=self.user_id,
                performed_at=timezone.now(),
                notes="Cascade rolled back"
            )
            
            cascade_map.delete()
        
        return True
    
    def _serialize_targets(self, targets: List[Dict]) -> Dict:
        return {'targets': targets}