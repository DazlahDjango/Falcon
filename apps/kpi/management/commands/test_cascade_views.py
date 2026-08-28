"""
Management command that tests the full KPI target cascade through Django REST Framework views.
Usage: python manage.py test_cascade_views --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""
import time
from django.core.management.base import BaseCommand
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.tenant.context import set_current_tenant_id
from apps.kpi.models import AnnualTarget, CascadeMap, CascadeRule


class Command(BaseCommand):
    help = 'Test full KPI target cascade through DRF API views'

    def add_arguments(self, parser):
        parser.add_argument('--tenant-id', required=True, help='Tenant UUID')
        parser.add_argument('--target-id', default='c4c7bd7a-2ec2-47b3-8f5e-9a059a4785f1', help='Org Target UUID')
        parser.add_argument('--admin-email', default='admin@falcontech.com', help='Super admin email')

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        target_id = options['target_id']
        admin_email = options['admin_email']
        set_current_tenant_id(tenant_id)

        W = "=" * 85
        self.stdout.write(W)
        self.stdout.write(self.style.SUCCESS(f" TESTING KPI CASCADE THROUGH DRF VIEWS | TENANT: {tenant_id}"))
        self.stdout.write(W + "\n")

        # ---------- SETUP ---------------------------------------------------------
        user = User.objects.filter(email=admin_email).first()
        if not user:
            self.stderr.write(self.style.ERROR(f"User {admin_email} not found"))
            return

        client = APIClient()
        client.force_authenticate(user=user)
        client.credentials(HTTP_X_TENANT_ID=tenant_id)

        org_target = AnnualTarget.objects.filter(id=target_id, tenant_id=tenant_id).first()
        if not org_target:
            self.stderr.write(self.style.ERROR(f"AnnualTarget {target_id} not found"))
            return

        rule = CascadeRule.objects.filter(tenant_id=tenant_id, is_active=True).first()
        if not rule:
            self.stderr.write(self.style.ERROR("No active CascadeRule found"))
            return

        self.stdout.write(f"Org Target : {org_target.kpi.name} = {org_target.target_value:,.2f} (Year {org_target.year})")
        self.stdout.write(f"Rule       : {rule.name} | ID: {rule.id}\n")

        # ---------- GET STRUCTURE ENTITIES ----------------------------------------
        self.stdout.write(self.style.HTTP_INFO(" STEP 1 - GET STRUCTURE ENTITIES VIA VIEWS"))
        self.stdout.write("-" * 85)

        def get_list(path):
            t0 = time.time()
            resp = client.get(path)
            elapsed = round(time.time() - t0, 3)
            body = resp.json() if resp.status_code == 200 else {}
            if isinstance(body, dict):
                items = body.get('data') or body.get('results') or body.get('employments') or []
            else:
                items = body if isinstance(body, list) else []
            status_str = self.style.SUCCESS("OK") if resp.status_code == 200 else self.style.ERROR(f"FAIL {resp.status_code}")
            self.stdout.write(f"  GET {path[:70]:<70} [{status_str}] {elapsed}s  ({len(items)} items)")
            if resp.status_code != 200:
                self.stdout.write(f"    Response: {resp.content[:300]}")
            return items, resp.status_code

        divisions, _    = get_list('/api/v1/structure/divisions/?page_size=100')
        departments, _  = get_list('/api/v1/structure/departments/?page_size=100')
        sections, _     = get_list('/api/v1/structure/sections/?page_size=100')
        units, _        = get_list('/api/v1/structure/units/?page_size=100')
        employments, _  = get_list('/api/v1/structure/employments/current/?page_size=500')

        # ---------- HELPER --------------------------------------------------------
        def post_cascade(level_name, payload, show_detail=True):
            self.stdout.write(f"\n  POST /api/v1/kpi/cascade-maps/ [{level_name}] -- {len(payload.get('targets', []))} targets")
            t0 = time.time()
            resp = client.post('/api/v1/kpi/cascade-maps/', payload, format='json')
            elapsed = round(time.time() - t0, 3)
            if resp.status_code in (200, 201):
                maps = resp.json()
                self.stdout.write(self.style.SUCCESS(f"    OK {elapsed}s -> created {len(maps)} CascadeMap(s)"))
                if show_detail:
                    for m in maps:
                        try:
                            cm = CascadeMap.objects.get(id=m['id'])
                            ct = cm.child_target
                            self.stdout.write(f"      -> Child Target {ct.id}: value={ct.target_value:,.2f} ({m.get('contribution_percentage')}%)")
                        except Exception:
                            pass
                return maps
            else:
                self.stdout.write(self.style.ERROR(f"    FAIL {resp.status_code} {elapsed}s"))
                try:
                    self.stdout.write(f"    Detail: {resp.json()}")
                except Exception:
                    self.stdout.write(f"    Raw: {resp.content[:400]}")
                return []

        # ---------- LEVEL 1 - DIVISIONS -------------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" LEVEL 1: ORG TARGET -> 2 DIVISIONS (50% each)"))
        self.stdout.write("-" * 85)

        target_divs = [d for d in divisions if d['code'] in ('DIV_COMM', 'DIV_TECH')]
        l1_targets = []
        for d in target_divs:
            leader_id = d.get('director_id') or d.get('manager_id') or (d.get('leader') or {}).get('user_id')
            l1_targets.append({
                'entity_type': 'DIVISION',
                'entity_id': d['id'],
                'user_id': leader_id,
                'contribution_percentage': 50.0
            })
        self.stdout.write(f"Targeting divisions: {[d['name'] for d in target_divs]}")
        l1_maps = post_cascade("Level-1 Division", {
            'organization_target': target_id,
            'cascade_rule': str(rule.id),
            'targets': l1_targets
        })

        if not l1_maps:
            self.stderr.write(self.style.ERROR("Stopping: Level 1 cascade failed."))
            return

        # ---------- LEVEL 2 - DEPARTMENTS -----------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" LEVEL 2: DIVISION TARGETS -> DEPARTMENTS (50% each, up to 2 per division)"))
        self.stdout.write("-" * 85)

        l2_maps = []
        for m in l1_maps:
            cm = CascadeMap.objects.get(id=m['id'])
            div_id = str(cm.division_target_id)
            div_name = cm.division_target.name if cm.division_target else div_id
            div_depts = [d for d in departments if str(d.get('division_id', '')) == div_id][:2]
            self.stdout.write(f"\n  Division: {div_name} -> {len(div_depts)} depts: {[d['name'] for d in div_depts]}")
            if not div_depts:
                self.stdout.write(self.style.WARNING("  No departments found for this division - check division_id field in dept serializer"))
                continue
            dept_targets = []
            for dept in div_depts:
                leader_id = dept.get('manager_id') or (dept.get('leader') or {}).get('user_id')
                dept_targets.append({
                    'entity_type': 'DEPARTMENT',
                    'entity_id': dept['id'],
                    'user_id': leader_id,
                    'contribution_percentage': 50.0
                })
            maps = post_cascade(f"Level-2 Dept ({div_name})", {
                'organization_target': target_id,
                'cascade_rule': str(rule.id),
                'targets': dept_targets
            })
            l2_maps.extend(maps)

        self.stdout.write(f"\nTotal L2 CascadeMaps created: {len(l2_maps)}")

        # ---------- LEVEL 3 - SECTIONS --------------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" LEVEL 3: DEPARTMENT TARGETS -> SECTIONS (50% each, up to 2 per dept)"))
        self.stdout.write("-" * 85)

        l3_maps = []
        for m in l2_maps:
            cm = CascadeMap.objects.get(id=m['id'])
            dept_id = str(cm.department_target_id)
            dept_secs = [s for s in sections if str(s.get('department_id', '')) == dept_id][:2]
            self.stdout.write(f"\n  Dept ({dept_id[:8]}..) -> {len(dept_secs)} sections: {[s['name'] for s in dept_secs]}")
            if not dept_secs:
                self.stdout.write(self.style.WARNING("  No sections found for this dept - check department_id field in section serializer"))
                continue
            sec_targets = []
            for sec in dept_secs:
                leader_id = sec.get('manager_id') or (sec.get('leader') or {}).get('user_id')
                sec_targets.append({
                    'entity_type': 'SECTION',
                    'entity_id': sec['id'],
                    'user_id': leader_id,
                    'contribution_percentage': 50.0
                })
            maps = post_cascade(f"Level-3 Section", {
                'organization_target': target_id,
                'cascade_rule': str(rule.id),
                'targets': sec_targets
            })
            l3_maps.extend(maps)

        self.stdout.write(f"\nTotal L3 CascadeMaps created: {len(l3_maps)}")

        # ---------- LEVEL 4 - UNITS -----------------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" LEVEL 4: SECTION TARGETS -> UNITS (50% each, up to 2 per section)"))
        self.stdout.write("-" * 85)

        l4_maps = []
        for m in l3_maps:
            cm = CascadeMap.objects.get(id=m['id'])
            sec_id = str(cm.section_target_id)
            sec_units = [u for u in units if str(u.get('section_id', '')) == sec_id][:2]
            self.stdout.write(f"\n  Section ({sec_id[:8]}..) -> {len(sec_units)} units: {[u['name'] for u in sec_units]}")
            if not sec_units:
                self.stdout.write(self.style.WARNING("  No units found for this section - check section_id field in unit serializer"))
                continue
            unit_targets = []
            for unit in sec_units:
                leader_id = unit.get('manager_id') or (unit.get('leader') or {}).get('user_id')
                unit_targets.append({
                    'entity_type': 'UNIT',
                    'entity_id': unit['id'],
                    'user_id': leader_id,
                    'contribution_percentage': 50.0
                })
            maps = post_cascade(f"Level-4 Unit", {
                'organization_target': target_id,
                'cascade_rule': str(rule.id),
                'targets': unit_targets
            })
            l4_maps.extend(maps)

        self.stdout.write(f"\nTotal L4 CascadeMaps created: {len(l4_maps)}")

        # ---------- LEVEL 5 - INDIVIDUALS -----------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" LEVEL 5: UNIT TARGETS -> INDIVIDUAL EMPLOYEES"))
        self.stdout.write("-" * 85)

        l5_maps = []
        total_skipped = 0
        for m in l4_maps:
            cm = CascadeMap.objects.get(id=m['id'])
            unit_id = str(cm.unit_target_id)
            unit_emps = [e for e in employments if str(e.get('unit_id', '')) == unit_id]
            if not unit_emps:
                total_skipped += 1
                self.stdout.write(self.style.WARNING(f"  Unit ({unit_id[:8]}..) - no employments found (check unit_id field in employment serializer)"))
                continue
            n = len(unit_emps)
            equal = round(100.0 / n, 2)
            ind_targets = []
            for i, emp in enumerate(unit_emps):
                pct = round(100.0 - equal * (n - 1), 2) if i == n - 1 else equal
                ind_targets.append({
                    'entity_type': 'INDIVIDUAL',
                    'entity_id': None,
                    'user_id': emp['user_id'],
                    'contribution_percentage': pct
                })
            self.stdout.write(f"\n  Unit ({unit_id[:8]}..) -> {n} employees, share={equal}%")
            maps = post_cascade(f"Level-5 Individual ({n} emps)", {
                'organization_target': target_id,
                'cascade_rule': str(rule.id),
                'targets': ind_targets
            }, show_detail=False)
            l5_maps.extend(maps)

        self.stdout.write(f"\nTotal L5 CascadeMaps created: {len(l5_maps)} | Skipped units (no emps): {total_skipped}")

        # ---------- CASCADE TREE VERIFICATION -------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" VERIFICATION: GET CASCADE TREE VIEW"))
        self.stdout.write("-" * 85)
        t0 = time.time()
        tree_resp = client.get(f'/api/v1/kpi/cascade-maps/tree/?organization_target={target_id}')
        self.stdout.write(f"  GET /api/v1/kpi/cascade-maps/tree/ : status={tree_resp.status_code} {round(time.time()-t0,3)}s")
        if tree_resp.status_code == 200:
            tree = tree_resp.json()
            self.stdout.write(f"  Root Target Value : {tree.get('target_value')}")
            self.stdout.write(f"  Direct Children   : {len(tree.get('children', []))}")

        # ---------- SUMMARY -------------------------------------------------------
        self.stdout.write("\n" + W)
        self.stdout.write(self.style.SUCCESS(" SUMMARY"))
        self.stdout.write("-" * 85)
        total = CascadeMap.objects.filter(tenant_id=tenant_id, organization_target_id=target_id).count()
        self.stdout.write(f"  Level 1 (Divisions)   : {len(l1_maps)}")
        self.stdout.write(f"  Level 2 (Departments) : {len(l2_maps)}")
        self.stdout.write(f"  Level 3 (Sections)    : {len(l3_maps)}")
        self.stdout.write(f"  Level 4 (Units)       : {len(l4_maps)}")
        self.stdout.write(f"  Level 5 (Individuals) : {len(l5_maps)}")
        self.stdout.write(f"  Total DB CascadeMaps  : {total}")
        self.stdout.write(W)
