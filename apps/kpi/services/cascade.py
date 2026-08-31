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
        cache_key = f"{CACHE_PREFIX}:tree:v4:{org_target_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        org_target = AnnualTarget.objects.filter(
            id=org_target_id,
            tenant_id=tenant_id
        ).select_related('user', 'kpi').first()

        if not org_target:
            return {}

        org_target_id_str = str(org_target.id)

        # Fetch CascadeMap entries for this KPI/year only (not every leftover edge).
        cascade_maps = list(CascadeMap.objects.filter(
            tenant_id=tenant_id
        ).filter(
            Q(organization_target_id=org_target_id)
            | Q(parent_target__kpi=org_target.kpi, parent_target__year=org_target.year)
            | Q(child_target__kpi=org_target.kpi, child_target__year=org_target.year)
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

        from apps.structure.models import Division, Department, Section, Unit, Employment
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_map = {str(u.id): u for u in User.objects.filter(tenant_id=tenant_id)}

        division_map = {str(d.id): d for d in Division.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        department_map = {str(d.id): d for d in Department.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('division')}
        section_map = {str(s.id): s for s in Section.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('department', 'department__division')}
        unit_map = {str(u.id): u for u in Unit.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('section', 'section__department', 'section__department__division')}

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

        LEVEL_ORDER = ('DIVISION', 'DEPARTMENT', 'SECTION', 'UNIT', 'INDIVIDUAL')
        LEVEL_RANK = {name: i for i, name in enumerate(LEVEL_ORDER)}

        def cm_role_rank(cm):
            if not cm:
                return 0
            if cm.division_target_id:
                return 5
            if cm.department_target_id:
                return 4
            if cm.section_target_id:
                return 3
            if cm.unit_target_id:
                return 2
            if cm.individual_target_id:
                return 1
            return 0

        target_by_user = {}
        cm_by_user = {}
        for cm in cascade_maps:
            child = cm.child_target or cm.individual_target or cm.department_target or cm.division_target or cm.section_target or cm.unit_target
            if not child or not child.user_id:
                continue
            uid = str(child.user_id)
            prev_cm = cm_by_user.get(uid)
            if prev_cm is None or cm_role_rank(cm) >= cm_role_rank(prev_cm):
                cm_by_user[uid] = cm
                target_by_user[uid] = child

        for extra in AnnualTarget.objects.filter(
            tenant_id=tenant_id,
            kpi=org_target.kpi,
            year=org_target.year,
        ):
            uid = str(extra.user_id)
            target_by_user.setdefault(uid, extra)

        org_uid = str(org_target.user_id) if org_target.user_id else None

        needed_div_ids = set()
        needed_dept_ids = set()
        needed_sec_ids = set()
        needed_unit_ids = set()

        def mark_user_org(uid):
            emp = user_emp_map.get(uid)
            pos = emp.position if emp else None
            if pos:
                if pos.unit_id:
                    needed_unit_ids.add(str(pos.unit_id))
                if pos.section_id:
                    needed_sec_ids.add(str(pos.section_id))
                if pos.department_id:
                    needed_dept_ids.add(str(pos.department_id))
                if pos.division_id:
                    needed_div_ids.add(str(pos.division_id))
            if uid in division_lead_map:
                needed_div_ids.add(str(division_lead_map[uid].id))
            if uid in department_lead_map:
                needed_dept_ids.add(str(department_lead_map[uid].id))
            if uid in section_lead_map:
                needed_sec_ids.add(str(section_lead_map[uid].id))
            if uid in unit_lead_map:
                needed_unit_ids.add(str(unit_lead_map[uid].id))

        for uid in target_by_user:
            if uid != org_uid:
                mark_user_org(uid)

        for unit_id in list(needed_unit_ids):
            unit = unit_map.get(unit_id)
            if unit and unit.section_id:
                needed_sec_ids.add(str(unit.section_id))
        for sec_id in list(needed_sec_ids):
            sec = section_map.get(sec_id)
            if sec and sec.department_id:
                needed_dept_ids.add(str(sec.department_id))
        for dept_id in list(needed_dept_ids):
            dept = department_map.get(dept_id)
            if dept and dept.division_id:
                needed_div_ids.add(str(dept.division_id))

        def user_display(uid):
            u = user_map.get(uid) if uid else None
            if u and u.get_full_name():
                return u.get_full_name(), getattr(u, 'email', None)
            if u:
                return u.email, u.email
            return 'Unassigned', None

        def lead_title_for(uid, default):
            emp = user_emp_map.get(uid) if uid else None
            pos = emp.position if emp else None
            return getattr(pos, 'title', None) or default

        def make_org_node(level, entity, lead_attr, default_title):
            lead_raw = getattr(entity, lead_attr, None)
            lead_id = str(lead_raw) if lead_raw else None
            target = target_by_user.get(lead_id) if lead_id else None
            name, email = user_display(lead_id)
            cm = cm_by_user.get(lead_id) if lead_id else None
            node_id = str(target.id) if target else f"struct:{level.lower()}:{entity.id}"
            return {
                'id': node_id,
                'name': entity.name,
                'code': getattr(entity, 'code', '') or '',
                'target_value': float(target.target_value) if target else 0.0,
                'user_id': lead_id,
                'user_name': name,
                'user_email': email,
                'lead_name': name if lead_id else 'Unassigned',
                'lead_title': lead_title_for(lead_id, default_title),
                'level': level,
                'children': [],
                'contribution': float(cm.contribution_percentage) if cm else 0,
                'rule': (cm.cascade_rule.name if cm and cm.cascade_rule else 'Default'),
            }

        org_user = user_map.get(org_uid) if org_uid else None
        org_name = org_user.get_full_name() if (org_user and org_user.get_full_name()) else (
            org_user.email if org_user else 'Executive Owner'
        )
        nodes = {
            'org': {
                'id': org_target_id_str,
                'name': f"{org_target.kpi.name} Target" if org_target.kpi else 'Organization Target',
                'code': getattr(org_target.kpi, 'code', '') or '',
                'target_value': float(org_target.target_value),
                'user_id': org_uid,
                'user_name': org_name,
                'user_email': org_user.email if org_user else None,
                'lead_name': org_name,
                'lead_title': lead_title_for(org_uid, 'Chief Executive Officer'),
                'level': 'ORGANIZATION',
                'children': [],
            }
        }

        for did in needed_div_ids:
            div = division_map.get(did)
            if div:
                nodes[f'division:{did}'] = make_org_node('DIVISION', div, 'director_id', 'Division Director')
        for did in needed_dept_ids:
            dept = department_map.get(did)
            if dept:
                nodes[f'department:{did}'] = make_org_node('DEPARTMENT', dept, 'manager_id', 'Department Manager')
        for sid in needed_sec_ids:
            sec = section_map.get(sid)
            if sec:
                nodes[f'section:{sid}'] = make_org_node('SECTION', sec, 'section_lead_id', 'Section Head')
        for uid in needed_unit_ids:
            unit = unit_map.get(uid)
            if unit:
                nodes[f'unit:{uid}'] = make_org_node('UNIT', unit, 'unit_lead_id', 'Unit Lead')

        lead_user_ids = {
            node['user_id'] for key, node in nodes.items()
            if key != 'org' and node.get('user_id')
        }

        def first_existing(*keys):
            for key in keys:
                if key and key in nodes:
                    return key
            return 'org'

        children_keys = {key: [] for key in nodes}

        for did in needed_div_ids:
            key = f'division:{did}'
            if key in nodes:
                children_keys['org'].append(key)

        for did in needed_dept_ids:
            dept = department_map.get(did)
            key = f'department:{did}'
            if key not in nodes:
                continue
            div_key = f'division:{dept.division_id}' if dept and dept.division_id else None
            children_keys[first_existing(div_key)].append(key)

        for sid in needed_sec_ids:
            sec = section_map.get(sid)
            key = f'section:{sid}'
            if key not in nodes:
                continue
            dept = department_map.get(str(sec.department_id)) if sec and sec.department_id else None
            dept_key = f'department:{sec.department_id}' if sec and sec.department_id else None
            div_key = f'division:{dept.division_id}' if dept and dept.division_id else None
            children_keys[first_existing(dept_key, div_key)].append(key)

        for uid in needed_unit_ids:
            unit = unit_map.get(uid)
            key = f'unit:{uid}'
            if key not in nodes:
                continue
            sec = section_map.get(str(unit.section_id)) if unit and unit.section_id else None
            dept = department_map.get(str(sec.department_id)) if sec and sec.department_id else None
            sec_key = f'section:{unit.section_id}' if unit and unit.section_id else None
            dept_key = f'department:{sec.department_id}' if sec and sec.department_id else None
            div_key = f'division:{dept.division_id}' if dept and dept.division_id else None
            children_keys[first_existing(sec_key, dept_key, div_key)].append(key)

        for uid, target in target_by_user.items():
            if uid == org_uid or uid in lead_user_ids:
                continue
            emp = user_emp_map.get(uid)
            pos = emp.position if emp else None
            unit_key = f'unit:{pos.unit_id}' if pos and pos.unit_id else None
            sec_key = f'section:{pos.section_id}' if pos and pos.section_id else None
            dept_key = f'department:{pos.department_id}' if pos and pos.department_id else None
            div_key = f'division:{pos.division_id}' if pos and pos.division_id else None
            parent = first_existing(unit_key, sec_key, dept_key, div_key)
            ikey = f'individual:{uid}'
            name, email = user_display(uid)
            cm = cm_by_user.get(uid)
            nodes[ikey] = {
                'id': str(target.id),
                'name': name,
                'code': '',
                'target_value': float(target.target_value),
                'user_id': uid,
                'user_name': name,
                'user_email': email,
                'lead_name': name,
                'lead_title': lead_title_for(uid, 'Individual Contributor'),
                'level': 'INDIVIDUAL',
                'children': [],
                'contribution': float(cm.contribution_percentage) if cm else 0,
                'rule': (cm.cascade_rule.name if cm and cm.cascade_rule else 'Default'),
            }
            children_keys.setdefault(parent, []).append(ikey)

        assembled = set()

        def assemble(key):
            if key in assembled:
                node = dict(nodes[key])
                node['children'] = []
                return node
            assembled.add(key)
            node = nodes[key]
            kids = []
            seen_child = set()
            for ck in children_keys.get(key, []):
                if ck == key or ck in seen_child or ck not in nodes:
                    continue
                seen_child.add(ck)
                kids.append(assemble(ck))
            kids.sort(key=lambda n: (LEVEL_RANK.get(n.get('level'), 99), (n.get('name') or '').lower()))
            node['children'] = kids
            return node

        tree = assemble('org')
        cache.set(cache_key, tree, CACHE_TTL)
        return tree

    def repair_structural_cascade_maps(self, tenant_id: str, kpi_id: str, year: int) -> Dict:
        """Rewrite CascadeMap rows to match org structure: one downward parent, no self/cycles."""
        org_target = AnnualTarget.objects.filter(
            tenant_id=tenant_id,
            kpi_id=kpi_id,
            year=year,
        ).order_by('-target_value').first()
        if not org_target:
            raise ValidationError("No annual target found for this KPI/year")

        rule = (
            CascadeRule.objects.filter(tenant_id=tenant_id, is_default=True, is_active=True).first()
            or CascadeRule.objects.filter(tenant_id=tenant_id, is_active=True).first()
        )
        if not rule:
            raise ValidationError("No cascade rule found for this tenant")

        from apps.structure.models import Division, Department, Section, Unit, Employment

        division_map = {str(d.id): d for d in Division.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        department_map = {str(d.id): d for d in Department.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        section_map = {str(s.id): s for s in Section.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        unit_map = {str(u.id): u for u in Unit.objects.filter(tenant_id=tenant_id, is_deleted=False)}
        division_lead_map = {
            str(d.director_id): d
            for d in Division.objects.filter(tenant_id=tenant_id, is_deleted=False, director_id__isnull=False)
        }
        department_lead_map = {
            str(d.manager_id): d
            for d in Department.objects.filter(tenant_id=tenant_id, is_deleted=False, manager_id__isnull=False)
        }
        section_lead_map = {
            str(s.section_lead_id): s
            for s in Section.objects.filter(tenant_id=tenant_id, is_deleted=False, section_lead_id__isnull=False)
        }
        unit_lead_map = {
            str(u.unit_lead_id): u
            for u in Unit.objects.filter(tenant_id=tenant_id, is_deleted=False, unit_lead_id__isnull=False)
        }
        user_emp_map = {}
        for emp in Employment.objects.filter(tenant_id=tenant_id, is_current=True).select_related(
            'position__division', 'position__department', 'position__section', 'position__unit'
        ):
            user_emp_map[str(emp.user_id)] = emp

        targets = list(AnnualTarget.objects.filter(tenant_id=tenant_id, kpi_id=kpi_id, year=year))
        target_by_user = {str(t.user_id): t for t in targets}
        org_uid = str(org_target.user_id) if org_target.user_id else None

        def child_role(uid):
            if uid in division_lead_map:
                return 'DIVISION'
            if uid in department_lead_map:
                return 'DEPARTMENT'
            if uid in section_lead_map:
                return 'SECTION'
            if uid in unit_lead_map:
                return 'UNIT'
            return 'INDIVIDUAL'

        def ancestor_candidates(uid):
            emp = user_emp_map.get(uid)
            pos = emp.position if emp else None
            role = child_role(uid)
            chain = []

            def add_unit(unit):
                if unit and unit.unit_lead_id:
                    chain.append(str(unit.unit_lead_id))
                if unit and unit.section_id:
                    add_section(section_map.get(str(unit.section_id)))

            def add_section(sec):
                if sec and sec.section_lead_id:
                    chain.append(str(sec.section_lead_id))
                if sec and sec.department_id:
                    add_department(department_map.get(str(sec.department_id)))

            def add_department(dept):
                if dept and dept.manager_id:
                    chain.append(str(dept.manager_id))
                if dept and dept.division_id:
                    add_division(division_map.get(str(dept.division_id)))

            def add_division(div):
                if div and div.director_id:
                    chain.append(str(div.director_id))

            if role == 'INDIVIDUAL':
                if pos and pos.unit_id:
                    add_unit(unit_map.get(str(pos.unit_id)))
                elif pos and pos.section_id:
                    add_section(section_map.get(str(pos.section_id)))
                elif pos and pos.department_id:
                    add_department(department_map.get(str(pos.department_id)))
                elif pos and pos.division_id:
                    add_division(division_map.get(str(pos.division_id)))
            elif role == 'UNIT':
                unit = unit_lead_map.get(uid)
                if unit and unit.section_id:
                    add_section(section_map.get(str(unit.section_id)))
            elif role == 'SECTION':
                sec = section_lead_map.get(uid)
                if sec and sec.department_id:
                    add_department(department_map.get(str(sec.department_id)))
            elif role == 'DEPARTMENT':
                dept = department_lead_map.get(uid)
                if dept and dept.division_id:
                    add_division(division_map.get(str(dept.division_id)))

            if org_uid:
                chain.append(org_uid)
            return chain

        def structural_parent_uid(uid):
            for candidate in ancestor_candidates(uid):
                if candidate and candidate != uid and candidate in target_by_user:
                    return candidate
            return None

        grouped = {}
        child_meta = {}
        skipped_self = 0
        for uid, child_target in target_by_user.items():
            if uid == org_uid:
                continue
            parent_uid = structural_parent_uid(uid)
            if not parent_uid:
                skipped_self += 1
                continue
            grouped.setdefault(parent_uid, []).append(uid)
            child_meta[uid] = child_role(uid)

        created = []
        with transaction.atomic():
            CascadeMap.objects.filter(
                tenant_id=tenant_id
            ).filter(
                Q(organization_target=org_target)
                | Q(parent_target__kpi_id=kpi_id, parent_target__year=year)
                | Q(child_target__kpi_id=kpi_id, child_target__year=year)
            ).delete()

            for parent_uid, child_uids in grouped.items():
                parent_target = target_by_user[parent_uid]
                child_uids = sorted(child_uids)
                n = len(child_uids)
                base = (Decimal('100.00') / n).quantize(Decimal('0.01'))
                shares = [base] * n
                shares[-1] = Decimal('100.00') - base * (n - 1)
                for uid, pct in zip(child_uids, shares):
                    child_target = target_by_user[uid]
                    role = child_meta[uid]
                    map_kwargs = {
                        'tenant_id': tenant_id,
                        'organization_target': org_target,
                        'parent_target': parent_target,
                        'child_target': child_target,
                        'cascade_rule': rule,
                        'contribution_percentage': pct,
                        'division_target': None,
                        'department_target': None,
                        'section_target': None,
                        'unit_target': None,
                        'individual_target': None,
                    }
                    if role == 'DIVISION':
                        map_kwargs['division_target'] = child_target
                    elif role == 'DEPARTMENT':
                        map_kwargs['department_target'] = child_target
                    elif role == 'SECTION':
                        map_kwargs['section_target'] = child_target
                    elif role == 'UNIT':
                        map_kwargs['unit_target'] = child_target
                    else:
                        map_kwargs['individual_target'] = child_target
                    created.append(CascadeMap.objects.create(**map_kwargs))

        self._invalidate_caches(str(org_target.id))
        return {
            'deleted_and_rebuilt': True,
            'maps_created': len(created),
            'parents': len(grouped),
            'skipped_no_parent': skipped_self,
            'org_target_id': str(org_target.id),
            'rule': rule.name,
        }

    def _invalidate_caches(self, target_id: str) -> None:
        from apps.kpi.utils.cache_keys import safe_delete_pattern
        cache.delete(f"{CACHE_PREFIX}:tree:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:tree:v2:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:tree:v3:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:tree:v4:{target_id}")
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
        cache.delete(f"{CACHE_PREFIX}:tree:v2:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:tree:v3:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:tree:v4:{target_id}")
        cache.delete(f"{CACHE_PREFIX}:contributors:{target_id}")
        safe_delete_pattern(f"{CACHE_PREFIX}:user_contributions:*")
        safe_delete_pattern(f"{CACHE_PREFIX}:user_contributions:*")