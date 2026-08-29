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

        org_target = AnnualTarget.objects.filter(
            id=org_target_id,
            tenant_id=tenant_id
        ).select_related('user', 'kpi').first()

        if not org_target:
            return {}

        # Fetch all CascadeMap entries for this tenant and KPI
        cascade_maps = list(CascadeMap.objects.filter(
            tenant_id=tenant_id
        ).filter(
            Q(organization_target_id=org_target_id) | Q(parent_target__kpi=org_target.kpi) | Q(child_target__kpi=org_target.kpi)
        ).select_related(
            'department_target',
            'individual_target',
            'division_target',
            'section_target',
            'unit_target',
            'parent_target',
            'parent_target__user',
            'parent_target__kpi',
            'child_target',
            'child_target__user',
            'child_target__kpi',
            'cascade_rule',
            'organization_target'
        ))

        # Check if multi-level maps with parent_target_id exist
        has_parent_maps = any(cm.parent_target_id is not None for cm in cascade_maps)

        # Group maps by parent_target_id (or organization_target_id fallback if only flat maps exist)
        children_map = {}
        seen_pairs = set()
        for cm in cascade_maps:
            if has_parent_maps and cm.parent_target_id is None:
                continue
            p_id = str(cm.parent_target_id) if cm.parent_target_id else str(cm.organization_target_id)
            c_id = str(cm.child_target_id) if cm.child_target_id else None
            if not p_id or not c_id:
                continue
            pair = (p_id, c_id)
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            children_map.setdefault(p_id, []).append(cm)

        from apps.structure.models import Division, Department, Section, Unit, Employment
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_map = {str(u.id): u for u in User.objects.filter(tenant_id=tenant_id)}

        division_map = {str(d.id): d for d in Division.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        department_map = {str(d.id): d for d in Department.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        section_map = {str(s.id): s for s in Section.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        unit_map = {str(u.id): u for u in Unit.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        
        division_lead_map = {str(d.director_id): d for d in Division.objects.filter(tenant_id=tenant_id, is_deleted=False, director_id__isnull=False)}
        department_lead_map = {str(d.manager_id): d for d in Department.objects.filter(tenant_id=tenant_id, is_deleted=False, manager_id__isnull=False)}
        section_lead_map = {str(s.section_lead_id): s for s in Section.objects.filter(tenant_id=tenant_id, is_deleted=False, section_lead_id__isnull=False)}
        unit_lead_map = {str(u.unit_lead_id): u for u in Unit.objects.filter(tenant_id=tenant_id, is_deleted=False, unit_lead_id__isnull=False)}

        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True
        ).select_related('position__division', 'position__department', 'position__section', 'position__unit')

        user_emp_map = {}
        for emp in employments:
            user_emp_map[str(emp.user_id)] = emp

        def build_node(target, depth=0, visited=None, cascade_map=None):
            if not target:
                return {}
            if visited is None:
                visited = set()
            target_id = str(target.id)
            if target_id in visited:
                return {}
            visited.add(target_id)

            u_id = str(target.user_id) if target.user_id else None
            u = user_map.get(u_id) if u_id else (target.user if hasattr(target, 'user') else None)
            emp = user_emp_map.get(u_id) if u_id else None
            pos = emp.position if emp else None

            user_full_name = u.get_full_name() if (u and u.get_full_name()) else (u.email if u else 'Executive Owner')
            user_role = str(getattr(u, 'role', '')).lower() if u else ''

            if depth == 0:
                level = 'ORGANIZATION'
                node_name = f"{target.kpi.name} Target" if (hasattr(target, 'kpi') and target.kpi) else "Organization Target"
                code = getattr(target.kpi, 'code', '') or ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Chief Executive Officer"
            elif cascade_map and cascade_map.division_target_id:
                level = 'DIVISION'
                node_name = pos.division.name if (pos and pos.division) else (division_lead_map[u_id].name if (u_id and u_id in division_lead_map) else (division_map[str(cascade_map.division_target_id)].name if str(cascade_map.division_target_id) in division_map else "Division"))
                code = pos.division.code if (pos and pos.division) else (division_lead_map[u_id].code if (u_id and u_id in division_lead_map) else "")
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Division Director"
            elif cascade_map and cascade_map.department_target_id:
                level = 'DEPARTMENT'
                node_name = pos.department.name if (pos and pos.department) else (department_lead_map[u_id].name if (u_id and u_id in department_lead_map) else (department_map[str(cascade_map.department_target_id)].name if str(cascade_map.department_target_id) in department_map else "Department"))
                code = pos.department.code if (pos and pos.department) else (department_lead_map[u_id].code if (u_id and u_id in department_lead_map) else "")
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Department Manager"
            elif cascade_map and cascade_map.section_target_id:
                level = 'SECTION'
                node_name = pos.section.name if (pos and pos.section) else (section_lead_map[u_id].name if (u_id and u_id in section_lead_map) else (section_map[str(cascade_map.section_target_id)].name if str(cascade_map.section_target_id) in section_map else "Section"))
                code = pos.section.code if (pos and pos.section) else (section_lead_map[u_id].code if (u_id and u_id in section_lead_map) else "")
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Section Head"
            elif cascade_map and cascade_map.unit_target_id:
                level = 'UNIT'
                node_name = pos.unit.name if (pos and pos.unit) else (unit_lead_map[u_id].name if (u_id and u_id in unit_lead_map) else (unit_map[str(cascade_map.unit_target_id)].name if str(cascade_map.unit_target_id) in unit_map else "Unit"))
                code = pos.unit.code if (pos and pos.unit) else (unit_lead_map[u_id].code if (u_id and u_id in unit_lead_map) else "")
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Unit Lead"
            elif cascade_map and cascade_map.individual_target_id:
                level = 'INDIVIDUAL'
                node_name = user_full_name
                code = ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Individual Contributor"
            elif u_id and u_id in division_lead_map:
                div = division_lead_map[u_id]
                level = 'DIVISION'
                node_name = div.name
                code = div.code
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Division Director"
            elif u_id and u_id in department_lead_map:
                dept = department_lead_map[u_id]
                level = 'DEPARTMENT'
                node_name = dept.name
                code = dept.code
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Department Manager"
            elif u_id and u_id in section_lead_map:
                sec = section_lead_map[u_id]
                level = 'SECTION'
                node_name = sec.name
                code = sec.code
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Section Head"
            elif u_id and u_id in unit_lead_map:
                unit_obj = unit_lead_map[u_id]
                level = 'UNIT'
                node_name = unit_obj.name
                code = unit_obj.code
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Unit Lead"
            elif emp and emp.is_executive:
                level = 'DIVISION'
                node_name = pos.division.name if (pos and pos.division) else f"{user_full_name}'s Division"
                code = pos.division.code if (pos and pos.division) else ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Executive Director"
            elif emp and emp.is_manager:
                level = 'DEPARTMENT'
                node_name = pos.department.name if (pos and pos.department) else f"{user_full_name}'s Department"
                code = pos.department.code if (pos and pos.department) else ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Department Manager"
            elif emp and emp.is_team_lead:
                if pos and pos.section:
                    level = 'SECTION'
                    node_name = pos.section.name
                    code = pos.section.code
                    lead_title = pos.title or "Section Head"
                elif pos and pos.unit:
                    level = 'UNIT'
                    node_name = pos.unit.name
                    code = pos.unit.code
                    lead_title = pos.title or "Unit Lead"
                else:
                    level = 'SECTION'
                    node_name = f"{user_full_name}'s Section"
                    code = ''
                    lead_title = "Team Lead"
                lead_name = user_full_name
            elif 'division' in user_role:
                level = 'DIVISION'
                node_name = pos.division.name if (pos and pos.division) else f"{user_full_name}'s Division"
                code = pos.division.code if (pos and pos.division) else ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Division Director"
            elif 'department' in user_role:
                level = 'DEPARTMENT'
                node_name = pos.department.name if (pos and pos.department) else f"{user_full_name}'s Department"
                code = pos.department.code if (pos and pos.department) else ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Department Manager"
            else:
                level = 'INDIVIDUAL'
                node_name = user_full_name
                code = ''
                lead_name = user_full_name
                lead_title = getattr(pos, 'title', None) or "Individual Contributor"

            node = {
                'id': target_id,
                'name': node_name,
                'code': code,
                'target_value': float(target.target_value),
                'user_id': u_id,
                'user_name': user_full_name,
                'user_email': u.email if u else None,
                'lead_name': lead_name,
                'lead_title': lead_title,
                'level': level,
                'children': []
            }
            for cm in children_map.get(target_id, []):
                child = cm.child_target or cm.individual_target or cm.department_target or cm.division_target or cm.section_target or cm.unit_target
                if child and str(child.id) not in visited:
                    child_node = build_node(child, depth + 1, visited.copy(), cascade_map=cm)
                    if child_node:
                        child_node['contribution'] = float(cm.contribution_percentage)
                        child_node['rule'] = cm.cascade_rule.name if cm.cascade_rule else 'Default'
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