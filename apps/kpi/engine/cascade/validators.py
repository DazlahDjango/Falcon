from decimal import Decimal
from typing import List, Dict
from django.core.exceptions import ValidationError

from apps.kpi.models import AnnualTarget, CascadeRule, CascadeMap


class CascadeValidator:
    def validate_cascade(self, org_target: AnnualTarget, targets: List[Dict], rule: CascadeRule) -> None:
        # Validate target sum
        total_contribution = sum(Decimal(str(round(t.get('contribution_percentage', 0), 4))) for t in targets)
        if total_contribution > Decimal('100.00'):
            raise ValidationError(
                f"Total contribution {total_contribution}% exceeds 100%"
            )
        # Validate unique entities
        entity_ids = [t.get('entity_id') or t.get('user_id') for t in targets if t.get('entity_id') or t.get('user_id')]
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
        parent = cascade_map.parent_target or cascade_map.organization_target or cascade_map.department_target
        if parent:
            from django.db.models import Q
            maps = CascadeMap.objects.filter(
                Q(parent_target=parent) |
                Q(organization_target=parent) |
                Q(department_target=parent)
            )
            total = Decimal('0')
            for m in maps:
                child = m.child_target or m.individual_target or m.department_target or m.division_target or m.section_target or m.unit_target
                if child:
                    total += child.target_value
            tolerance = Decimal('0.01')
            return abs(total - parent.target_value) <= tolerance
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
            target['entity_type'],
            str(org_target.tenant_id)
        )