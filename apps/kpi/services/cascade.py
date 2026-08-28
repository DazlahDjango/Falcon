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
            self.engine.set_context(user.tenant_id, user.id)
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
            self.engine.set_context(user.tenant_id, user.id)
            result = self.engine.cascade_department_target(dept_target_id, rule_id, user_ids, weights)
            self._invalidate_caches(dept_target_id)
            return result

    def get_cascade_tree(self, org_target_id: str, tenant_id: str) -> Dict:
        cache_key = f"{CACHE_PREFIX}:tree:{org_target_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        cascade_maps = CascadeMap.objects.filter(
            tenant_id=tenant_id,
            organization_target_id=org_target_id
        ).select_related(
            'department_target',
            'individual_target',
            'division_target',
            'section_target',
            'unit_target',
            'parent_target',
            'child_target',
            'cascade_rule',
            'organization_target'
        )

        children_map = {}
        for cm in cascade_maps:
            p_id = str(cm.parent_target_id) if cm.parent_target_id else str(cm.organization_target_id)
            children_map.setdefault(p_id, []).append(cm)

        org_target = AnnualTarget.objects.filter(
            id=org_target_id,
            tenant_id=tenant_id
        ).select_related('user', 'kpi').first()

        def build_node(target, depth=0, visited=None):
            if not target:
                return {}
            if visited is None:
                visited = set()
            target_id = str(target.id)
            if target_id in visited:
                return {}
            visited.add(target_id)

            # Determine level for node based on FKs, user role, and depth
            user_role = str(getattr(target.user, 'role', '')).lower() if target.user else ''
            if depth == 0:
                level = 'ORGANIZATION'
            elif 'division' in user_role or ('executive' in user_role and depth <= 1):
                level = 'DIVISION'
            elif 'department' in user_role or ('manager' in user_role and depth <= 2):
                level = 'DEPARTMENT'
            elif 'section' in user_role:
                level = 'SECTION'
            elif 'unit' in user_role:
                level = 'UNIT'
            elif 'supervisor' in user_role:
                depth_levels = {1: 'DIVISION', 2: 'DEPARTMENT', 3: 'SECTION', 4: 'UNIT'}
                level = depth_levels.get(depth, 'SECTION')
            else:
                depth_levels = {1: 'DIVISION', 2: 'DEPARTMENT', 3: 'SECTION', 4: 'UNIT'}
                level = depth_levels.get(depth, 'INDIVIDUAL')

            node = {
                'id': target_id,
                'target_value': float(target.target_value),
                'user_id': str(target.user_id) if target.user_id else None,
                'user_name': target.user.get_full_name() if (target.user and target.user.get_full_name()) else (target.user.email if target.user else 'Executive Owner'),
                'user_email': target.user.email if target.user else None,
                'level': level,
                'children': []
            }
            for cm in children_map.get(target_id, []):
                child = cm.child_target or cm.individual_target or cm.department_target or cm.division_target or cm.section_target or cm.unit_target
                if child and str(child.id) not in visited:
                    child_node = build_node(child, depth + 1, visited.copy())
                    if child_node:
                        child_node['contribution'] = float(cm.contribution_percentage)
                        child_node['rule'] = cm.cascade_rule.name if cm.cascade_rule else 'Default'
                        
                        if cm.division_target_id:
                            child_node['level'] = 'DIVISION'
                        elif cm.department_target_id:
                            child_node['level'] = 'DEPARTMENT'
                        elif cm.section_target_id:
                            child_node['level'] = 'SECTION'
                        elif cm.unit_target_id:
                            child_node['level'] = 'UNIT'

                        node['children'].append(child_node)
            return node

        tree = build_node(org_target)
        cache.set(cache_key, tree, CACHE_TTL)
        return tree

    def _invalidate_caches(self, target_id: str) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:tree:{target_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:tree:*")
        safe_delete_pattern(f"{CACHE_PREFIX}:contributors:*")


class CascadeMapper:
    def get_contributors(self, org_target_id: str, tenant_id: str) -> List[Dict]:
        cache_key = f"{CACHE_PREFIX}:contributors:{org_target_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        from django.db.models import Q
        cascade_maps = CascadeMap.objects.filter(
            Q(organization_target_id=org_target_id) | Q(parent_target_id=org_target_id),
            tenant_id=tenant_id
        ).select_related(
            'department_target', 'individual_target', 'division_target', 'section_target', 'unit_target', 'child_target'
        )

        contributors = []
        for cm in cascade_maps:
            child = cm.child_target or cm.individual_target or cm.department_target or cm.division_target or cm.section_target or cm.unit_target
            if child:
                contr = {
                    'type': 'INDIVIDUAL' if (cm.individual_target or (child.user and child.user.role == 'staff')) else 'UNIT',
                    'id': str(child.id),
                    'target_value': float(child.target_value),
                    'percentage': float(cm.contribution_percentage)
                }
                if child.user:
                    contr.update({
                        'user_id': str(child.user_id),
                        'user_name': child.user.get_full_name(),
                        'user_email': child.user.email
                    })
                contributors.append(contr)

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

        from django.db.models import Q
        contributors = []
        for target in targets:
            cascade = CascadeMap.objects.filter(
                Q(individual_target=target) | Q(child_target=target),
                tenant_id=tenant_id
            ).select_related('department_target', 'organization_target', 'parent_target').first()

            if cascade:
                parent = cascade.parent_target or cascade.department_target or cascade.organization_target
                if parent:
                    parent_type = 'ORGANIZATION'
                    if parent.user and parent.user.role not in ['executive', 'super_admin', 'client_admin']:
                        parent_type = 'UNIT'
                    contributors.append({
                        'type': parent_type,
                        'target_id': str(parent.id),
                        'target_value': float(parent.target_value),
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
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:tree:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:contributors:{target_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:user_contributions:*")