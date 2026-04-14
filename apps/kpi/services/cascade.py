from decimal import Decimal
from typing import List, Dict, Optional, Tuple
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from apps.accounts.models import User
from apps.kpi.models import KPI, AnnualTarget, CascadeMap, CascadeRule, CascadeHistory
from apps.kpi.engine import CascadeEngine
from ..exceptions import CascadeError, CascadeIntegrityError

class TargetCascader:
    def __init__(self):
        self.engine = CascadeEngine()
    def cascade_from_organization(self, org_target_id: str, rule_id: str, targets: List[Dict], user) -> List[CascadeMap]:
        return self.engine.cascade_organization_target(org_target_id, rule_id, targets)
    def cascade_from_department(self, dept_target_id: str, rule_id: str, user_ids: List[str], user, weights: Dict = None) -> List[CascadeMap]:
        return self.engine.cascade_department_target(dept_target_id, rule_id, user_ids, weights)
    def get_cascade_tree(self, org_target_id: str) -> Dict:
        cascade_maps = CascadeMap.objects.filter(organization_target_id=org_target_id).select_related('department_target', 'individual_target', 'cascade_rule')
        tree = {
            'organization_target': {
                'id': str(org_target_id),
                'target_value': None
            },
            'departments': [],
            'individuals': []
        }
        for cm in cascade_maps:
            if cm.department_target:
                tree['departments'].append({
                    'id': str(cm.department_target.id),
                    'target_value': cm.department_target.target_value,
                    'contribution': cm.contribution_percentage,
                    'rule': cm.cascade_rule.name
                })
            elif cm.individual_target:
                tree['individuals'].append({
                    'id': str(cm.individual_target.id),
                    'user_id': cm.individual_target.user_id,
                    'target_value': cm.individual_target.target_value,
                    'contribution': cm.contribution_percentage,
                    'rule': cm.cascade_rule.name
                })
        return tree
    
class CascadeMapper:
    def get_contributors(self, org_target_id: str) -> List[Dict]:
        cascade_maps = CascadeMap.objects.filter(organization_target_id=org_target_id)
        contributors = []
        for cm in cascade_maps:
            if cm.department_target:
                contributors.append({
                    'type': 'DEPARTMENT',
                    'id': str(cm.department_target.id),
                    'target_value': cm.department_target.target_value,
                    'percentage': cm.contribution_percentage
                })
            elif cm.individual_target:
                contributors.append({
                    'type': 'INDIVIDUAL',
                    'id': str(cm.individual_target.id),
                    'user_id': str(cm.individual_target.user_id),
                    'target_value': cm.individual_target.target_value,
                    'percentage': cm.contribution_percentage
                })
        return contributors
    def get_contributions_for_user(self, user_id: str, year: int) -> List[Dict]:
        targets = AnnualTarget.objects.filter(user_id=user_id, year=year)
        contributors = []
        for target in targets:
            cascade = CascadeMap.objects.filter(individual_target=target).first()
            if cascade:
                if cascade.department_target:
                    contributors.append({
                        'type': 'DEPARTMENT',
                        'target_id': str(cascade.department_target.id),
                        'target_value': cascade.department_target.target_value,
                        'my_target': target.target_value,
                        'percentage': cascade.contribution_percentage
                    })
                elif cascade.organization_target:
                    contributors.append({
                        'type': 'ORGANIZATION',
                        'target_id': str(cascade.organization_target.id),
                        'target_value': cascade.organization_target.target_value,
                        'my_target': target.target_value,
                        'percentage': cascade.contribution_percentage
                    })
        return contributors

class CascadeNotifier:
    def notify_target_assignment(self, user_id: str, target: AnnualTarget) -> None:
        from ..tasks import send_target_assignment_notification
        send_target_assignment_notification.delay(
            user_id=str(user_id),
            kpi_name=target.kpi.name,
            target_value=float(target.target_value),
            year=target.year
        )
    def notify_cascade_complete(self, org_target_id: str, user) -> None:
        """Notify that cascade operation completed"""
        from ..tasks import send_cascade_complete_notification
        send_cascade_complete_notification.delay(
            tenant_id=str(user.tenant_id),
            org_target_id=org_target_id,
            triggered_by=str(user.id)
        )

class CascadeRollback:
    def __init__(self):
        self.engine = CascadeEngine()
    def rollback_cascade(self, cascade_map_id: str, user) -> bool:
        return self.engine.rollback_cascade(cascade_map_id)
    def rollback_organization_cascade(self, org_target_id: str, user) -> Dict:
        cascade_maps = CascadeMap.objects.filter(organization_target_id=org_target_id)
        rolled_back = []
        errors = []
        for cm in cascade_maps:
            try:
                if self.rollback_cascade(str(cm.id), user):
                    rolled_back.append(str(cm.id))
            except Exception as e:
                errors.append({'id': str(cm.id), 'error': str(e)})
        return {
            'rolled_back': rolled_back,
            'errors': errors,
            'total': len(cascade_maps)
        }
    def verify_cascade_integrity(self, org_target_id: str) -> Dict:
        cascade_maps = CascadeMap.objects.filter(organization_target_id=org_target_id)
        issues = []
        for cm in cascade_maps:
            if not self.engine.validator.validate_cascade_integrity(str(cm.id)):
                issues.append({
                    'cascade_map_id': str(cm.id),
                    'reason': 'Integrity check failed'
                })
        return {
            'valid': len(issues) == 0,
            'issues': issues
        }