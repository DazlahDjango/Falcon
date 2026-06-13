from decimal import Decimal
from typing import List, Dict, Optional, Tuple
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db.models import Sum, Q
from apps.accounts.models import User
from apps.kpi.models import KPI, AnnualTarget, CascadeMap, CascadeRule, CascadeHistory
from apps.kpi.engine.cascade import CascadeEngine
from ..exceptions import CascadeError, CascadeIntegrityError, PermissionDenied

CACHE_TTL = 3600
CACHE_PREFIX = "kpi_cascade"

class TargetCascader:
    def __init__(self):
        self.engine = CascadeEngine()

    def cascade_from_organization(
        self,
        org_target_id: str,
        rule_id: str,
        targets: List[Dict],
        user
    ) -> List[CascadeMap]:
        if not user or not user.tenant_id:
            raise PermissionDenied("User has no tenant association")

        org_target = AnnualTarget.objects.filter(
            id=org_target_id,
            tenant_id=user.tenant_id
        ).first()

        if not org_target:
            raise ValidationError("Organization target not found")

        rule = CascadeRule.objects.filter(
            id=rule_id,
            tenant_id=user.tenant_id,
            is_active=True
        ).first()

        if not rule:
            raise ValidationError("Cascade rule not found")

        with transaction.atomic():
            result = self.engine.cascade_organization_target(org_target_id, rule_id, targets)
            self._invalidate_caches(org_target_id)
            return result

    def cascade_from_department(
        self,
        dept_target_id: str,
        rule_id: str,
        user_ids: List[str],
        user,
        weights: Dict = None
    ) -> List[CascadeMap]:
        if not user or not user.tenant_id:
            raise PermissionDenied("User has no tenant association")

        dept_target = AnnualTarget.objects.filter(
            id=dept_target_id,
            tenant_id=user.tenant_id
        ).first()

        if not dept_target:
            raise ValidationError("Department target not found")

        rule = CascadeRule.objects.filter(
            id=rule_id,
            tenant_id=user.tenant_id,
            is_active=True
        ).first()

        if not rule:
            raise ValidationError("Cascade rule not found")

        with transaction.atomic():
            result = self.engine.cascade_department_target(dept_target_id, rule_id, user_ids, weights)
            self._invalidate_caches(dept_target_id)
            return result

    def get_cascade_tree(self, org_target_id: str, tenant_id: str) -> Dict:
        cache_key = f"{CACHE_PREFIX}:tree:{org_target_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        cascade_maps = CascadeMap.objects.filter(
            organization_target_id=org_target_id,
            tenant_id=tenant_id
        ).select_related(
            'department_target',
            'individual_target',
            'cascade_rule',
            'organization_target'
        )

        org_target = AnnualTarget.objects.filter(
            id=org_target_id,
            tenant_id=tenant_id
        ).first()

        tree = {
            'organization_target': {
                'id': str(org_target_id),
                'target_value': float(org_target.target_value) if org_target else None
            },
            'departments': [],
            'individuals': []
        }

        for cm in cascade_maps:
            if cm.department_target:
                tree['departments'].append({
                    'id': str(cm.department_target.id),
                    'target_value': float(cm.department_target.target_value),
                    'contribution': float(cm.contribution_percentage),
                    'rule': cm.cascade_rule.name
                })
            elif cm.individual_target:
                user = cm.individual_target.user
                tree['individuals'].append({
                    'id': str(cm.individual_target.id),
                    'user_id': str(cm.individual_target.user_id),
                    'user_name': user.get_full_name() if user else None,
                    'user_email': user.email if user else None,
                    'target_value': float(cm.individual_target.target_value),
                    'contribution': float(cm.contribution_percentage),
                    'rule': cm.cascade_rule.name
                })

        cache.set(cache_key, tree, CACHE_TTL)
        return tree

    def _invalidate_caches(self, target_id: str) -> None:
        cache.delete(f"{CACHE_PREFIX}:tree:{target_id}")
        cache.delete_pattern(f"{CACHE_PREFIX}:contributors:*")


class CascadeMapper:
    def get_contributors(self, org_target_id: str, tenant_id: str) -> List[Dict]:
        cache_key = f"{CACHE_PREFIX}:contributors:{org_target_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        cascade_maps = CascadeMap.objects.filter(
            organization_target_id=org_target_id,
            tenant_id=tenant_id
        ).select_related('department_target', 'individual_target')

        contributors = []
        for cm in cascade_maps:
            if cm.department_target:
                contributors.append({
                    'type': 'DEPARTMENT',
                    'id': str(cm.department_target.id),
                    'target_value': float(cm.department_target.target_value),
                    'percentage': float(cm.contribution_percentage)
                })
            elif cm.individual_target:
                user = cm.individual_target.user
                contributors.append({
                    'type': 'INDIVIDUAL',
                    'id': str(cm.individual_target.id),
                    'user_id': str(cm.individual_target.user_id),
                    'user_name': user.get_full_name() if user else None,
                    'user_email': user.email if user else None,
                    'target_value': float(cm.individual_target.target_value),
                    'percentage': float(cm.contribution_percentage)
                })

        cache.set(cache_key, contributors, CACHE_TTL)
        return contributors

    def get_contributions_for_user(self, user_id: str, year: int, tenant_id: str) -> List[Dict]:
        cache_key = f"{CACHE_PREFIX}:user_contributions:{user_id}:{year}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        targets = AnnualTarget.objects.filter(
            user_id=user_id,
            year=year,
            tenant_id=tenant_id
        ).select_related('kpi')

        contributors = []
        for target in targets:
            cascade = CascadeMap.objects.filter(
                individual_target=target,
                tenant_id=tenant_id
            ).select_related('department_target', 'organization_target').first()

            if cascade:
                if cascade.department_target:
                    contributors.append({
                        'type': 'DEPARTMENT',
                        'target_id': str(cascade.department_target.id),
                        'target_value': float(cascade.department_target.target_value),
                        'my_target': float(target.target_value),
                        'kpi_name': target.kpi.name,
                        'percentage': float(cascade.contribution_percentage)
                    })
                elif cascade.organization_target:
                    contributors.append({
                        'type': 'ORGANIZATION',
                        'target_id': str(cascade.organization_target.id),
                        'target_value': float(cascade.organization_target.target_value),
                        'my_target': float(target.target_value),
                        'kpi_name': target.kpi.name,
                        'percentage': float(cascade.contribution_percentage)
                    })

        cache.set(cache_key, contributors, CACHE_TTL)
        return contributors


class CascadeNotifier:
    def notify_target_assignment(self, user_id: str, target: AnnualTarget) -> None:
        try:
            from ..tasks import send_target_assignment_notification
            send_target_assignment_notification.delay(
                user_id=str(user_id),
                kpi_name=target.kpi.name,
                target_value=float(target.target_value),
                year=target.year,
                tenant_id=str(target.tenant_id)
            )
        except ImportError:
            pass

    def notify_cascade_complete(self, org_target_id: str, user) -> None:
        try:
            from ..tasks import send_cascade_complete_notification
            send_cascade_complete_notification.delay(
                tenant_id=str(user.tenant_id),
                org_target_id=org_target_id,
                triggered_by=str(user.id)
            )
        except ImportError:
            pass


class CascadeRollback:
    def __init__(self):
        self.engine = CascadeEngine()

    def rollback_cascade(self, cascade_map_id: str, user) -> bool:
        cascade_map = CascadeMap.objects.filter(
            id=cascade_map_id,
            tenant_id=user.tenant_id
        ).first()

        if not cascade_map:
            raise ValidationError("Cascade map not found")

        with transaction.atomic():
            result = self.engine.rollback_cascade(cascade_map_id)
            self._invalidate_caches(cascade_map_id)
            return result

    def rollback_organization_cascade(self, org_target_id: str, user) -> Dict:
        cascade_maps = CascadeMap.objects.filter(
            organization_target_id=org_target_id,
            tenant_id=user.tenant_id
        )

        rolled_back = []
        errors = []

        with transaction.atomic():
            for cm in cascade_maps:
                try:
                    if self.rollback_cascade(str(cm.id), user):
                        rolled_back.append(str(cm.id))
                except Exception as e:
                    errors.append({'id': str(cm.id), 'error': str(e)})

        self._invalidate_caches(org_target_id)

        return {
            'rolled_back': rolled_back,
            'errors': errors,
            'total': cascade_maps.count()
        }

    def verify_cascade_integrity(self, org_target_id: str, tenant_id: str) -> Dict:
        cascade_maps = CascadeMap.objects.filter(
            organization_target_id=org_target_id,
            tenant_id=tenant_id
        )

        org_target = AnnualTarget.objects.filter(
            id=org_target_id,
            tenant_id=tenant_id
        ).first()

        if not org_target:
            return {'valid': False, 'issues': [{'reason': 'Organization target not found'}]}

        total_cascaded = cascade_maps.aggregate(
            total=Sum('contribution_percentage')
        )['total'] or 0

        issues = []
        if abs(total_cascaded - 100) > 0.01:
            issues.append({
                'reason': f'Total contribution {total_cascaded}% does not equal 100%'
            })

        for cm in cascade_maps:
            if not self.engine.validator.validate_cascade_integrity(str(cm.id)):
                issues.append({
                    'cascade_map_id': str(cm.id),
                    'reason': 'Integrity check failed'
                })

        return {
            'valid': len(issues) == 0,
            'total_contribution': float(total_cascaded),
            'issues': issues
        }

    def _invalidate_caches(self, target_id: str) -> None:
        cache.delete(f"{CACHE_PREFIX}:tree:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:contributors:{target_id}")
        cache.delete_pattern(f"{CACHE_PREFIX}:user_contributions:*")