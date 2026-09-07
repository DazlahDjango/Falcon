"""
Manage Target Cascading, Cascade Maps, Trees, Repair, and Rollback.

Usage Examples:
    # 1. List all cascade maps for tenant
    python manage.py manage_cascade --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. View visual target cascade tree for a KPI
    python manage.py manage_cascade --action tree --kpi-name "Revenue Growth"

    # 3. Perform top-down target cascade with equal distribution
    python manage.py manage_cascade --action cascade --kpi-name "Revenue Growth" \
        --assignee-email "emily.clark@globalapex.com" --rule-type EQUAL \
        --child-users "paige.webb@globalapex.com,victor.sullivan@globalapex.com"

    # 4. Repair structural cascade maps across tenant
    python manage.py manage_cascade --action repair --kpi-name "Revenue Growth"

    # 5. Rollback cascaded targets for a parent target
    python manage.py manage_cascade --action rollback --kpi-name "Revenue Growth" \
        --assignee-email "emily.clark@globalapex.com"

    # 6. View cascade history audit logs
    python manage.py manage_cascade --action history --kpi-name "Revenue Growth"
"""

import json
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.kpi.models.definition import KPI
from apps.kpi.models.target import AnnualTarget
from apps.kpi.models.cascade import CascadeRule, CascadeMap, CascadeHistory
from apps.kpi.services.cascade import TargetCascader


import uuid

def is_valid_uuid(val):
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


class Command(BaseCommand):
    help = 'Manage target cascading, multi-level hierarchy trees, structural map repair, and rollback operations.'


    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id', '-t',
            type=str,
            default='6102e576-12b5-4347-9bb8-4ddae94b8a94',
            help='Tenant Organization ID (default: 6102e576-12b5-4347-9bb8-4ddae94b8a94)'
        )
        parser.add_argument(
            '--user-email', '-u',
            type=str,
            default=None,
            help='Actor user email performing management action'
        )
        parser.add_argument(
            '--action', '-a',
            type=str,
            choices=['list', 'cascade', 'tree', 'repair', 'rollback', 'history'],
            default='list',
            help='Action: list, cascade, tree, repair, rollback, history'
        )

        # Action-specific arguments
        parser.add_argument('--parent-target-id', type=str, default=None, help='Parent AnnualTarget UUID')
        parser.add_argument('--kpi-name', '--kpi-code', '-k', type=str, default=None, dest='kpi_name', help='KPI Name or Code')
        parser.add_argument('--assignee-email', type=str, default=None, help='Email of user owning the parent target')
        parser.add_argument('--year', '-y', type=int, default=2026, help='Target year (default: 2026)')
        parser.add_argument('--rule-type', type=str, default='EQUAL', choices=['EQUAL', 'WEIGHTED', 'DIRECT', 'CUSTOM'], help='Cascade rule type')
        parser.add_argument('--child-users', type=str, default=None, help='Comma-separated emails of child users for cascading')
        parser.add_argument('--structural', action='store_true', default=False, help='Cascade down full organizational reporting line hierarchy')
        parser.add_argument('--limit', type=int, default=0, help='Max rows to print (0 = all)')

    def set_tenant_schema(self, tenant_id):
        schema_obj = OrganizationSchema.objects.filter(organization_id=tenant_id).first()
        if schema_obj:
            schema_name = schema_obj.schema_name
        else:
            try:
                org = Organization.objects.get(id=tenant_id)
                schema_name = f"org_{org.slug.replace('-', '_')}"
            except Exception:
                schema_name = 'public'

        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema_name}", public')
        return schema_name

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        user_email = options['user_email']
        action = options['action']

        schema_name = self.set_tenant_schema(tenant_id)

        if user_email:
            actor = User.objects.filter(email__iexact=user_email, tenant_id=tenant_id).first()
        else:
            actor = User.objects.filter(tenant_id=tenant_id, is_staff=True).first() or User.objects.filter(tenant_id=tenant_id).first()

        if not actor:
            raise CommandError(f"No user found under tenant '{tenant_id}'")

        self.stdout.write(self.style.MIGRATE_HEADING(f"=== FALCON TARGET CASCADE MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {actor.email}")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'cascade':
            self.action_cascade(tenant_id, actor, options)
        elif action == 'tree':
            self.action_tree(tenant_id, options)
        elif action == 'repair':
            self.action_repair(tenant_id, actor, options)
        elif action == 'rollback':
            self.action_rollback(tenant_id, actor, options)
        elif action == 'history':
            self.action_history(tenant_id, options)

    def action_list(self, tenant_id, options):
        maps_qs = CascadeMap.objects.filter(tenant_id=tenant_id).select_related(
            'parent_target__kpi', 'parent_target__user',
            'child_target__user', 'individual_target__user',
            'cascade_rule'
        )
        kpi_filter = options.get('kpi_name')
        if kpi_filter:
            maps_qs = maps_qs.filter(
                models.Q(parent_target__kpi__name__icontains=kpi_filter) |
                models.Q(parent_target__kpi__id__icontains=kpi_filter) |
                models.Q(organization_target__kpi__name__icontains=kpi_filter)
            )

        maps = list(maps_qs.order_by('-created_at'))
        self.stdout.write(self.style.SUCCESS(f"Found {len(maps)} Cascade Maps:"))

        fmt = "{:<36} {:<24} {:<26} {:<26} {:<12} {:<12}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("MAP ID", "KPI NAME", "PARENT USER", "CHILD USER / LEVEL", "RULE TYPE", "WEIGHT/VAL")))
        self.stdout.write("-" * 145)
        for m in maps:
            parent_user = m.parent_target.user.email if m.parent_target and m.parent_target.user else "N/A"
            child_desc = "N/A"
            if m.child_target and m.child_target.user:
                child_desc = m.child_target.user.email
            elif m.individual_target and m.individual_target.user:
                child_desc = m.individual_target.user.email
            elif m.department_target:
                child_desc = f"Dept:{m.department_target.id}"
            elif m.division_target:
                child_desc = f"Div:{m.division_target.id}"

            rule_name = m.cascade_rule.rule_type if m.cascade_rule else "DIRECT"
            contrib = f"{m.contribution_percentage}%" if m.contribution_percentage is not None else "N/A"

            kpi_title = (m.parent_target.kpi.name if m.parent_target and m.parent_target.kpi else (m.organization_target.kpi.name if m.organization_target and m.organization_target.kpi else "N/A"))
            self.stdout.write(fmt.format(
                str(m.id),
                kpi_title[:23],
                parent_user[:25],
                child_desc[:25],
                rule_name,
                contrib
            ))

    def get_parent_target(self, tenant_id, options):
        target_id = options.get('parent_target_id')
        if target_id:
            target = AnnualTarget.objects.filter(id=target_id, tenant_id=tenant_id).select_related('kpi', 'user').first()
            if target:
                return target

        kpi_ref = options.get('kpi_name')
        if kpi_ref:
            assignee_email = options.get('assignee_email')
            qs = AnnualTarget.objects.filter(tenant_id=tenant_id, year=options['year']).select_related('kpi', 'user')
            if is_valid_uuid(kpi_ref):
                qs = qs.filter(models.Q(kpi__id=kpi_ref) | models.Q(kpi__name__icontains=kpi_ref))
            else:
                qs = qs.filter(models.Q(kpi__name__icontains=kpi_ref))
            if assignee_email:
                qs = qs.filter(user__email__iexact=assignee_email)
            target = qs.first()
            if target:
                return target

        raise CommandError("Could not locate Parent Annual Target. Provide --parent-target-id OR (--kpi-name and optionally --assignee-email and --year)")

    def action_cascade(self, tenant_id, actor, options):
        parent_target = self.get_parent_target(tenant_id, options)
        is_structural = options.get('structural')

        rule_type = options['rule_type']
        rule = (
            CascadeRule.objects.filter(tenant_id=tenant_id, is_default=True, is_active=True).first()
            or CascadeRule.objects.filter(tenant_id=tenant_id, is_active=True).first()
        )
        if not rule:
            rule = CascadeRule.objects.create(
                tenant_id=tenant_id,
                name=f"Cascade Rule ({rule_type})",
                rule_type=rule_type,
                created_by=actor,
                is_active=True,
                is_default=True
            )

        cascader = TargetCascader()

        if is_structural:
            self.stdout.write(self.style.WARNING(f"[*] Cascading Target across full Organizational Reporting Hierarchy..."))
            created_maps = self.cascade_structural_hierarchy(tenant_id, parent_target, rule, actor, options)
            self.stdout.write(self.style.SUCCESS(
                f"\n[OK] Successfully cascaded Target '{parent_target.kpi.name}' (${parent_target.target_value:,.2f}) across entire organization structure!\n"
                f"  - Total Cascade Maps: {len(created_maps)}"
            ))
            return

        child_users_str = options.get('child_users')
        if not child_users_str:
            raise CommandError("--child-users (comma-separated email list) OR --structural flag is required for cascading target")

        emails = [e.strip() for e in child_users_str.split(',') if e.strip()]
        child_users = list(User.objects.filter(tenant_id=tenant_id, email__in=emails))
        if not child_users:
            raise CommandError(f"No valid child users found for emails: {child_users_str}")

        n = len(child_users)
        base = (Decimal('100.00') / n).quantize(Decimal('0.01'))
        shares = [base] * n
        shares[-1] = Decimal('100.00') - base * (n - 1)

        targets_def = []
        for u, pct in zip(child_users, shares):
            targets_def.append({
                'entity_type': 'INDIVIDUAL',
                'entity_id': str(u.id),
                'user_id': str(u.id),
                'parent_target_id': str(parent_target.id),
                'contribution_percentage': pct
            })

        maps = cascader.cascade_from_organization(
            org_target_id=str(parent_target.id),
            rule_id=str(rule.id),
            targets=targets_def,
            user=actor
        )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully CASCADED Parent Target '{parent_target.kpi.name}' (${parent_target.target_value:,.2f}) to {len(child_users)} child users!\n"
            f"  - Created Maps: {len(maps)}"
        ))

    def cascade_structural_hierarchy(self, tenant_id, org_target, rule, actor, options):
        from apps.structure.models import Division, Department, Section, Unit, Employment
        cascader = TargetCascader()

        # Level 1: Divisions (Directors under CEO/Org)
        divisions = list(Division.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False))
        div_users = []
        for d in divisions:
            if d.director_id:
                u = User.objects.filter(id=d.director_id, tenant_id=tenant_id).first()
                if u:
                    div_users.append((d, u))

        n_div = len(div_users)
        if not n_div:
            raise CommandError("No active division directors found in organizational structure.")

        base_div = (Decimal('100.00') / n_div).quantize(Decimal('0.01'))
        shares_div = [base_div] * n_div
        shares_div[-1] = Decimal('100.00') - base_div * (n_div - 1)

        div_targets = []
        for (d, u), pct in zip(div_users, shares_div):
            div_targets.append({
                'entity_type': 'DIVISION',
                'entity_id': str(d.id),
                'user_id': str(u.id),
                'parent_target_id': str(org_target.id),
                'contribution_percentage': pct
            })

        self.stdout.write(f"  -> Cascading Organization Target to {n_div} Divisions...")
        cascader.cascade_from_organization(
            org_target_id=str(org_target.id),
            rule_id=str(rule.id),
            targets=div_targets,
            user=actor
        )

        # Level 2: Division -> Departments & Direct Division Staff
        for d, u_div in div_users:
            div_annual_target = AnnualTarget.objects.filter(tenant_id=tenant_id, user=u_div, kpi=org_target.kpi, year=org_target.year).first()
            if not div_annual_target:
                continue

            departments = list(Department.objects.filter(tenant_id=tenant_id, division=d, is_active=True, is_deleted=False))
            dept_users = []
            for dp in departments:
                if dp.manager_id:
                    u_dp = User.objects.filter(id=dp.manager_id, tenant_id=tenant_id).first()
                    if u_dp:
                        dept_users.append((dp, u_dp))

            div_staff_emps = Employment.objects.filter(
                tenant_id=tenant_id, position__division=d, position__department__isnull=True, is_current=True
            ).exclude(user_id=u_div.id)
            div_staff_uids = [emp.user_id for emp in div_staff_emps if emp.user_id]
            direct_div_staff = list(User.objects.filter(tenant_id=tenant_id, id__in=div_staff_uids))

            all_div_children = []
            for dp, u_dp in dept_users:
                all_div_children.append(('DEPARTMENT', str(dp.id), u_dp))
            for u_st in direct_div_staff:
                all_div_children.append(('INDIVIDUAL', str(u_st.id), u_st))

            if all_div_children:
                n_dp = len(all_div_children)
                base_dp = (Decimal('100.00') / n_dp).quantize(Decimal('0.01'))
                shares_dp = [base_dp] * n_dp
                shares_dp[-1] = Decimal('100.00') - base_dp * (n_dp - 1)

                dp_targets = []
                for (etype, eid, u_child), pct in zip(all_div_children, shares_dp):
                    dp_targets.append({
                        'entity_type': etype,
                        'entity_id': eid,
                        'user_id': str(u_child.id),
                        'parent_target_id': str(div_annual_target.id),
                        'contribution_percentage': pct
                    })

                self.stdout.write(f"  -> Cascading Division '{d.name}' to {len(dept_users)} Department Managers and {len(direct_div_staff)} Staff...")
                cascader.cascade_from_organization(
                    org_target_id=str(org_target.id),
                    rule_id=str(rule.id),
                    targets=dp_targets,
                    user=u_div
                )

                # Level 3: Department -> Sections & Direct Department Staff
                for dp, u_dp in dept_users:
                    dept_annual_target = AnnualTarget.objects.filter(tenant_id=tenant_id, user=u_dp, kpi=org_target.kpi, year=org_target.year).first()
                    if not dept_annual_target:
                        continue

                    sections = list(Section.objects.filter(tenant_id=tenant_id, department=dp, is_active=True, is_deleted=False))
                    sec_users = []
                    for s in sections:
                        if s.section_lead_id:
                            u_sec = User.objects.filter(id=s.section_lead_id, tenant_id=tenant_id).first()
                            if u_sec:
                                sec_users.append((s, u_sec))

                    dept_staff_emps = Employment.objects.filter(
                        tenant_id=tenant_id, position__department=dp, position__section__isnull=True, is_current=True
                    ).exclude(user_id=u_dp.id)
                    dept_staff_uids = [emp.user_id for emp in dept_staff_emps if emp.user_id]
                    direct_dept_staff = list(User.objects.filter(tenant_id=tenant_id, id__in=dept_staff_uids))

                    all_dept_children = []
                    for s, u_sec in sec_users:
                        all_dept_children.append(('SECTION', str(s.id), u_sec))
                    for u_st in direct_dept_staff:
                        all_dept_children.append(('INDIVIDUAL', str(u_st.id), u_st))

                    if all_dept_children:
                        n_s = len(all_dept_children)
                        base_s = (Decimal('100.00') / n_s).quantize(Decimal('0.01'))
                        shares_s = [base_s] * n_s
                        shares_s[-1] = Decimal('100.00') - base_s * (n_s - 1)

                        sec_targets = []
                        for (etype, eid, u_child), pct in zip(all_dept_children, shares_s):
                            sec_targets.append({
                                'entity_type': etype,
                                'entity_id': eid,
                                'user_id': str(u_child.id),
                                'parent_target_id': str(dept_annual_target.id),
                                'contribution_percentage': pct
                            })

                        self.stdout.write(f"    -> Cascading Department '{dp.name}' to {len(sec_users)} Sections and {len(direct_dept_staff)} Staff...")
                        cascader.cascade_from_organization(
                            org_target_id=str(org_target.id),
                            rule_id=str(rule.id),
                            targets=sec_targets,
                            user=u_dp
                        )

                        # Level 4: Section -> Units & Direct Section Staff
                        for s, u_sec in sec_users:
                            sec_annual_target = AnnualTarget.objects.filter(tenant_id=tenant_id, user=u_sec, kpi=org_target.kpi, year=org_target.year).first()
                            if not sec_annual_target:
                                continue

                            units = list(Unit.objects.filter(tenant_id=tenant_id, section=s, is_active=True, is_deleted=False))
                            unit_users = []
                            for un in units:
                                if un.unit_lead_id:
                                    u_un = User.objects.filter(id=un.unit_lead_id, tenant_id=tenant_id).first()
                                    if u_un:
                                        unit_users.append((un, u_un))

                            sec_staff_emps = Employment.objects.filter(
                                tenant_id=tenant_id, position__section=s, position__unit__isnull=True, is_current=True
                            ).exclude(user_id=u_sec.id)
                            sec_staff_uids = [emp.user_id for emp in sec_staff_emps if emp.user_id]
                            direct_sec_staff = list(User.objects.filter(tenant_id=tenant_id, id__in=sec_staff_uids))

                            all_sec_children = []
                            for un, u_un in unit_users:
                                all_sec_children.append(('UNIT', str(un.id), u_un))
                            for u_st in direct_sec_staff:
                                all_sec_children.append(('INDIVIDUAL', str(u_st.id), u_st))

                            if all_sec_children:
                                n_c = len(all_sec_children)
                                base_c = (Decimal('100.00') / n_c).quantize(Decimal('0.01'))
                                shares_c = [base_c] * n_c
                                shares_c[-1] = Decimal('100.00') - base_c * (n_c - 1)

                                c_targets = []
                                for (etype, eid, u_child), pct in zip(all_sec_children, shares_c):
                                    c_targets.append({
                                        'entity_type': etype,
                                        'entity_id': eid,
                                        'user_id': str(u_child.id),
                                        'parent_target_id': str(sec_annual_target.id),
                                        'contribution_percentage': pct
                                    })

                                self.stdout.write(f"      -> Cascading Section '{s.name}' to {len(unit_users)} Units and {len(direct_sec_staff)} Direct Staff...")
                                cascader.cascade_from_organization(
                                    org_target_id=str(org_target.id),
                                    rule_id=str(rule.id),
                                    targets=c_targets,
                                    user=u_sec
                                )

                                # Level 5: Unit -> Unit Members
                                for un, u_un in unit_users:
                                    unit_annual_target = AnnualTarget.objects.filter(tenant_id=tenant_id, user=u_un, kpi=org_target.kpi, year=org_target.year).first()
                                    if not unit_annual_target:
                                        continue

                                    unit_staff_emps = Employment.objects.filter(
                                        tenant_id=tenant_id, position__unit=un, is_current=True
                                    ).exclude(user_id=u_un.id)
                                    unit_staff_uids = [emp.user_id for emp in unit_staff_emps if emp.user_id]
                                    unit_staff = list(User.objects.filter(tenant_id=tenant_id, id__in=unit_staff_uids))

                                    if unit_staff:
                                        n_u = len(unit_staff)
                                        base_u = (Decimal('100.00') / n_u).quantize(Decimal('0.01'))
                                        shares_u = [base_u] * n_u
                                        shares_u[-1] = Decimal('100.00') - base_u * (n_u - 1)

                                        u_targets = []
                                        for u_st, pct in zip(unit_staff, shares_u):
                                            u_targets.append({
                                                'entity_type': 'INDIVIDUAL',
                                                'entity_id': str(u_st.id),
                                                'user_id': str(u_st.id),
                                                'parent_target_id': str(unit_annual_target.id),
                                                'contribution_percentage': pct
                                            })

                                        self.stdout.write(f"        -> Cascading Unit '{un.name}' to {n_u} Unit Staff...")
                                        cascader.cascade_from_organization(
                                            org_target_id=str(org_target.id),
                                            rule_id=str(rule.id),
                                            targets=u_targets,
                                            user=u_un
                                        )

        # Step 5: Execute repair_structural_cascade_maps to guarantee perfect downward hierarchy integrity & values
        res = cascader.repair_structural_cascade_maps(tenant_id=tenant_id, kpi_id=str(org_target.kpi_id), year=org_target.year)
        self.stdout.write(self.style.SUCCESS(f"  [OK] Structural maps aligned and calibrated: {res.get('maps_created', 0)} maps created/synchronized."))

        return list(CascadeMap.objects.filter(tenant_id=tenant_id, organization_target=org_target))

    def action_tree(self, tenant_id, options):
        kpi_ref = options.get('kpi_name')
        qs = AnnualTarget.objects.filter(tenant_id=tenant_id, year=options['year']).select_related('kpi', 'user')
        if kpi_ref:
            if is_valid_uuid(kpi_ref):
                qs = qs.filter(models.Q(kpi__id=kpi_ref) | models.Q(kpi__name__icontains=kpi_ref))
            else:
                qs = qs.filter(models.Q(kpi__name__icontains=kpi_ref))

        top_targets = list(qs)
        if not top_targets:
            self.stdout.write(self.style.WARNING("No targets found to build tree."))
            return

        self.stdout.write(self.style.SUCCESS(f"=== TARGET CASCADE HIERARCHY TREE ==="))
        # Filter top-level root targets (either org target or parents with no incoming parent map)
        root_parent_ids = set(CascadeMap.objects.filter(tenant_id=tenant_id, organization_target__isnull=False).values_list('organization_target_id', flat=True))
        if not root_parent_ids:
            root_parent_ids = {t.id for t in top_targets}

        for root in top_targets:
            if root.id in root_parent_ids or len(top_targets) == 1:
                self.stdout.write(self.style.MIGRATE_HEADING(f"[*] [Root Target] {root.kpi.name} ({root.user.email}) - Annual Target: KES {root.target_value:,.2f}"))
                self.print_tree_branches(root, indent=2)

    def print_tree_branches(self, parent_target, indent=2):
        child_maps = CascadeMap.objects.filter(parent_target=parent_target).select_related(
            'child_target__user', 'individual_target__user', 'department_target'
        )
        spaces = " " * indent
        for cm in child_maps:
            child_user = cm.child_target.user.email if cm.child_target and cm.child_target.user else "N/A"
            target_val = f"KES {cm.child_target.target_value:,.2f}" if cm.child_target else "N/A"
            self.stdout.write(f"{spaces}|-- [Cascaded Target] {child_user} - Target: {target_val} (Contrib: {cm.contribution_percentage}%)")
            if cm.child_target:
                self.print_tree_branches(cm.child_target, indent=indent + 4)


    def action_repair(self, tenant_id, actor, options):
        kpi_ref = options.get('kpi_name')
        year = options['year']
        cascader = TargetCascader()

        if kpi_ref:
            if is_valid_uuid(kpi_ref):
                kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
                    models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
                ).first()
            else:
                kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
                    models.Q(name__icontains=kpi_ref)
                ).first()
            if not kpi:
                raise CommandError(f"KPI '{kpi_ref}' not found for repair")
            res = cascader.repair_structural_cascade_maps(tenant_id=tenant_id, kpi_id=str(kpi.id), year=year)
            self.stdout.write(self.style.SUCCESS(
                f"Repaired structural cascade maps for KPI '{kpi.name}' (Year {year})!\n"
                f"  - Maps Repaired: {res.get('repaired_count', 0)}\n"
                f"  - Details: {res.get('details', '')}"
            ))
        else:
            kpis = KPI.objects.filter(tenant_id=tenant_id)
            total_repaired = 0
            for k in kpis:
                res = cascader.repair_structural_cascade_maps(tenant_id=tenant_id, kpi_id=str(k.id), year=year)
                total_repaired += res.get('repaired_count', 0)
            self.stdout.write(self.style.SUCCESS(f"Repaired structural cascade maps across tenant! Total maps created/repaired: {total_repaired}"))



    def action_rollback(self, tenant_id, actor, options):
        parent_target = self.get_parent_target(tenant_id, options)
        cascader = TargetCascader()
        result = cascader.rollback_cascade(str(parent_target.id), actor)

        self.stdout.write(self.style.ERROR(
            f"Successfully ROLLED BACK cascade for Parent Target '{parent_target.kpi.name}'!\n"
            f"  - Deleted Child Targets : {result.get('deleted_targets', 0)}\n"
            f"  - Deleted Cascade Maps  : {result.get('deleted_maps', 0)}"
        ))

    def action_history(self, tenant_id, options):
        parent_target = self.get_parent_target(tenant_id, options)
        history = list(CascadeHistory.objects.filter(parent_target=parent_target).select_related('performed_by').order_by('-performed_at'))

        if not history:
            self.stdout.write(self.style.WARNING(f"No cascade history audit logs found for Target '{parent_target.kpi.name}'."))
            return

        self.stdout.write(self.style.SUCCESS(f"Cascade Audit History for Target '{parent_target.kpi.name}' ({len(history)} entries):"))
        fmt = "{:<12} {:<24} {:<30} {:<30}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("ACTION", "PERFORMED BY", "PERFORMED AT", "NOTES")))
        self.stdout.write("-" * 100)
        for h in history:
            by_user = h.performed_by.email if h.performed_by else "System"
            at_time = h.performed_at.strftime('%Y-%m-%d %H:%M:%S')
            self.stdout.write(fmt.format(h.action, by_user[:23], at_time, (h.notes or '')[:29]))
