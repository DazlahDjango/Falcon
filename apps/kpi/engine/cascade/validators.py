from decimal import Decimal
from typing import List, Dict
from django.core.exceptions import ValidationError

from apps.kpi.models import AnnualTarget, CascadeRule, CascadeMap


class CascadeValidator:
    def validate_cascade(self, org_target: AnnualTarget, targets: List[Dict], rule: CascadeRule) -> None:
        # Validate target sum
        total_contribution = sum(t.get('contribution_percentage', 0) for t in targets)
        if total_contribution > 100:
            raise ValidationError(
                f"Total contribution {total_contribution}% exceeds 100%"
            )
        # Validate unique entities
        entity_ids = [t['entity_id'] for t in targets]
        if len(entity_ids) != len(set(entity_ids)):
            raise ValidationError("Duplicate entity IDs in cascade targets")
        # Validate target values
        total_value = Decimal('0')
        for target in targets:
            contribution = target.get('contribution_percentage', 0)
            if contribution:
                value = org_target.target_value * (Decimal(str(contribution)) / 100)
            else:
                value = self._calculate_target_value(org_target, rule, target)
            total_value += value
            if value <= 0:
                raise ValidationError(f"Target value must be positive for {target['entity_id']}")
        # Validate total matches org target (within tolerance)
        tolerance = Decimal('0.01')  # 1 cent tolerance
        if abs(total_value - org_target.target_value) > tolerance:
            raise ValidationError(
                f"Total cascaded value {total_value} does not match org target {org_target.target_value}"
            )
    def validate_department_cascade(self, dept_target: AnnualTarget, user_ids: List[str], weights: Dict = None) -> None:
        if not user_ids:
            raise ValidationError("No users specified for cascade")
        if weights:
            total_weight = sum(Decimal(str(w)) for w in weights.values())
            if total_weight > 100:
                raise ValidationError(f"Total weight {total_weight}% exceeds 100%")
    def validate_cascade_integrity(self, cascade_map_id: str) -> bool:
        cascade_map = CascadeMap.objects.get(id=cascade_map_id)
        if cascade_map.organization_target:
            maps = CascadeMap.objects.filter(
                organization_target=cascade_map.organization_target
            )
            total = Decimal('0')
            for m in maps:
                if m.department_target:
                    total += m.department_target.target_value
                elif m.individual_target:
                    total += m.individual_target.target_value 
            tolerance = Decimal('0.01')
            return abs(total - cascade_map.organization_target.target_value) <= tolerance
        elif cascade_map.department_target:
            # Check individual sum against department target
            maps = CascadeMap.objects.filter(
                department_target=cascade_map.department_target
            )
            total = sum(m.individual_target.target_value for m in maps if m.individual_target)
            tolerance = Decimal('0.01')
            return abs(total - cascade_map.department_target.target_value) <= tolerance
        return True
    def _calculate_target_value(self, org_target: AnnualTarget, rule: CascadeRule,
                                 target: Dict) -> Decimal:
        """Calculate target value using rule."""
        from .split_rule import SplitRules
        
        split_rules = SplitRules()
        return split_rules.calculate_target(
            org_target.target_value,
            rule,
            target['entity_id'],
            target['entity_type']
        )