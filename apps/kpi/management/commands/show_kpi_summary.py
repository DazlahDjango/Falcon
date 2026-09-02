"""
Inspect KPI Definitions, Target Cascading, Phasings, Weights, and Overall KPI Metrics for a tenant.
Usage:
    python manage.py show_kpi_summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action overall
    python manage.py show_kpi_summary --action list
    python manage.py show_kpi_summary --action cascading
    python manage.py show_kpi_summary --action cascading --kpi-name "Revenue Growth"
    python manage.py show_kpi_summary --action cascading --limit 80
    python manage.py show_kpi_summary --action weights
    python manage.py show_kpi_summary --action repair-cascade --kpi-name "Revenue Growth"
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from apps.accounts.models import User
from apps.kpi.models.definition import KPI, KPIWeight
from apps.kpi.models.target import AnnualTarget, MonthlyPhasing
from apps.kpi.models.cascade import CascadeMap
from apps.kpi.models.actual import MonthlyActual


class Command(BaseCommand):
    help = 'Inspect KPI definitions, target cascading, weights, monthly phasings, and overall system metrics.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant ID to inspect KPIs for'
        )
        parser.add_argument(
            '--action',
            '-a',
            type=str,
            choices=['overall', 'list', 'cascading', 'tree', 'weights', 'phasings', 'repair-cascade'],
            default='overall',
            help='Specific KPI inspection action (overall, list, cascading, tree, weights, phasings, repair-cascade)'
        )
        parser.add_argument(
            '--kpi-name',
            '--kpi-code',
            '-k',
            type=str,
            default=None,
            dest='kpi_name',
            help='Optional filter by specific KPI Name'
        )
        parser.add_argument(
            '--year',
            '-y',
            type=int,
            default=2026,
            help='Filter targets and actuals by year (default: 2026)'
        )
        parser.add_argument(
            '--limit',
            '-l',
            type=int,
            default=0,
            help='Max cascade rows to print for --action cascading (0 = print all)'
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        action = options['action']
        kpi_name = options['kpi_name']
        year = options['year']
        limit = options.get('limit') or 0

        from apps.tenant.models import Organization, OrganizationSchema
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

        all_users = {u.id: u for u in User.objects.filter(tenant_id=tenant_id, is_deleted=False)}

        kpis_qs = KPI.objects.filter(tenant_id=tenant_id)
        if kpi_name:
            kpis_qs = kpis_qs.filter(name__icontains=kpi_name)

        kpis = list(kpis_qs.select_related('owner', 'department'))

        if action == 'overall':
            self.show_overall(tenant_id, schema_name, year, kpis, all_users)
        elif action == 'list':
            self.show_list(tenant_id, year, kpis, all_users)
        elif action == 'cascading':
            self.show_cascading(tenant_id, year, kpis, all_users, limit=limit)
        elif action == 'tree':
            self.show_tree(tenant_id, year, kpis, all_users)
        elif action == 'weights':
            self.show_weights(tenant_id, kpis, all_users)
        elif action == 'phasings':
            self.show_phasings(tenant_id, year, kpis, all_users)
        elif action == 'repair-cascade':
            self.repair_cascade(tenant_id, year, kpis)

    def show_overall(self, tenant_id, schema_name, year, kpis, all_users):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" OVERALL KPI SYSTEM SUMMARY REPORT FOR TENANT: {tenant_id}"))
        self.stdout.write(f" Schema: {schema_name} | Target Year: {year}")
        self.stdout.write("=" * 85 + "\n")

        targets_qs = AnnualTarget.objects.filter(tenant_id=tenant_id, year=year)
        cascade_qs = CascadeMap.objects.filter(tenant_id=tenant_id)
        actuals_qs = MonthlyActual.objects.filter(tenant_id=tenant_id, year=year)
        weights_qs = KPIWeight.objects.filter(tenant_id=tenant_id, is_active=True)

        users_with_targets = targets_qs.values('user_id').distinct().count()
        total_target_value = targets_qs.aggregate(total=models.Sum('target_value'))['total'] or 0
        total_actual_value = actuals_qs.aggregate(total=models.Sum('actual_value'))['total'] or 0

        self.stdout.write(self.style.WARNING("[SYSTEM LEVEL METRICS]:"))
        self.stdout.write(f"   - Master KPI Definitions: {len(kpis)}")
        self.stdout.write(f"   - Total Issued Annual Targets ({year}): {targets_qs.count()}")
        self.stdout.write(f"   - Total Active Users Issued Targets: {users_with_targets} / {len(all_users)}")
        self.stdout.write(f"   - Total Cascading Connections (CascadeMap): {cascade_qs.count()}")
        self.stdout.write(f"   - Total Monthly Performance Actuals ({year}): {actuals_qs.count()}")
        self.stdout.write(f"   - Total Configured KPI Weights: {weights_qs.count()}\n")

        self.stdout.write(self.style.WARNING("[FINANCIAL & VOLUME TOTALS]:"))
        self.stdout.write(f"   - Total Sum of Annual Targets ({year}): {total_target_value:,.2f}")
        self.stdout.write(f"   - Total Sum of Monthly Actuals Recorded: {total_actual_value:,.2f}\n")

        self.stdout.write(self.style.WARNING("[MASTER KPIS BREAKDOWN]:"))
        for k in kpis:
            target_count = targets_qs.filter(kpi=k).count()
            owner_name = f"{k.owner.first_name} {k.owner.last_name}" if k.owner else "No Owner"
            dept_name = k.department.name if k.department else "Corporate Wide"
            self.stdout.write(f"   - [{k.code}] {k.name}")
            self.stdout.write(f"     * Type: {k.kpi_type} | Unit: {k.unit or 'N/A'} | Logic: {k.calculation_logic}")
            self.stdout.write(f"     * Owner: {owner_name} | Scope: {dept_name}")
            self.stdout.write(f"     * Issued Targets: {target_count} employees\n")

        self.stdout.write("=" * 85)

    def show_list(self, tenant_id, year, kpis, all_users):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" KPI DEFINITIONS LIST FOR TENANT: {tenant_id}"))
        self.stdout.write("=" * 85 + "\n")

        for k in kpis:
            t_qs = AnnualTarget.objects.filter(tenant_id=tenant_id, kpi=k, year=year)
            target_users_count = t_qs.values('user_id').distinct().count()
            target_sum = t_qs.aggregate(total=models.Sum('target_value'))['total'] or 0
            owner_str = f"{k.owner.first_name} {k.owner.last_name} ({k.owner.email})" if k.owner else "N/A"

            self.stdout.write(self.style.WARNING(f"KPI NAME: {k.name}"))
            self.stdout.write(f"  - Description: {k.description}")
            self.stdout.write(f"  - Type: {k.get_kpi_type_display()} ({k.kpi_type})")
            self.stdout.write(f"  - Calculation Logic: {k.get_calculation_logic_display()}")
            self.stdout.write(f"  - Unit: {k.unit or 'N/A'} | Decimal Places: {k.decimal_places}")
            self.stdout.write(f"  - Owner: {owner_str}")
            self.stdout.write(f"  - Active: {'Yes' if k.is_active else 'No'}")
            self.stdout.write(f"  - Employees Assigned Targets ({year}): {target_users_count}")
            self.stdout.write(f"  - Total Target Value ({year}): {target_sum:,.2f} {k.unit or ''}")
            self.stdout.write("-" * 85 + "\n")

    def show_cascading(self, tenant_id, year, kpis, all_users, limit=0):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" TARGET CASCADING MAP FOR TENANT: {tenant_id} (Year: {year})"))
        self.stdout.write("=" * 85 + "\n")

        def person_label(user, fallback="Unknown"):
            if not user:
                return fallback
            name = f"{user.first_name or ''} {user.last_name or ''}".strip()
            email = getattr(user, 'email', None)
            if name and email:
                return f"{name} ({email})"
            return name or email or fallback

        for k in kpis:
            self.stdout.write(self.style.WARNING(f"MASTER KPI: {k.name}\n"))
            cascades = list(CascadeMap.objects.filter(
                tenant_id=tenant_id,
                parent_target__kpi=k,
                parent_target__year=year,
            ).select_related(
                'parent_target', 'child_target', 'cascade_rule',
                'parent_target__user', 'child_target__user',
            ).order_by('parent_target_id', 'child_target_id'))

            if not cascades:
                self.stdout.write("   (No CascadeMap entries found for this KPI)\n")
                continue

            issues = []
            seen_child = {}
            parent_totals = {}
            grouped = {}
            for c in cascades:
                p_id = str(c.parent_target_id) if c.parent_target_id else None
                c_id = str(c.child_target_id) if c.child_target_id else None
                if p_id and c_id and p_id == c_id:
                    issues.append(f"self-loop on target {c_id}")
                if c_id in seen_child:
                    issues.append(f"child {c_id} has multiple parents")
                elif c_id:
                    seen_child[c_id] = p_id
                parent_totals.setdefault(p_id, 0)
                parent_totals[p_id] += float(c.contribution_percentage or 0)
                grouped.setdefault(p_id, []).append(c)

            for p_id, total in parent_totals.items():
                if abs(total - 100) > 0.05:
                    issues.append(f"parent {p_id} contribution sums to {total:.2f}% (expected 100%)")

            self.stdout.write(f"   Found {len(cascades)} cascaded relationships under {len(grouped)} parents.")
            if issues:
                self.stdout.write(self.style.ERROR(f"   Integrity issues: {len(issues)}"))
                for issue in issues:
                    self.stdout.write(self.style.ERROR(f"     - {issue}"))
            else:
                self.stdout.write(self.style.SUCCESS("   Integrity: one parent per child, no self-loops, sibling % sums to 100."))
            self.stdout.write("")

            def parent_sort_key(item):
                p_id, rows = item
                sample = rows[0]
                p_user = all_users.get(sample.parent_target.user_id) if sample.parent_target else None
                return person_label(p_user, "Organization").lower()

            shown = 0
            truncated = False
            for p_id, rows in sorted(grouped.items(), key=parent_sort_key):
                if limit and shown >= limit:
                    truncated = True
                    break
                sample = rows[0]
                p_user = all_users.get(sample.parent_target.user_id) if sample.parent_target else None
                p_str = person_label(p_user, "Organization")
                total = parent_totals.get(p_id, 0)
                self.stdout.write(f"   PARENT: {p_str}  (children {len(rows)}, share {total:.2f}%)")
                for c in rows:
                    if limit and shown >= limit:
                        truncated = True
                        break
                    c_user = all_users.get(c.child_target.user_id) if c.child_target else None
                    c_str = person_label(c_user, "Child Target")
                    role = (
                        'DIVISION' if c.division_target_id else
                        'DEPARTMENT' if c.department_target_id else
                        'SECTION' if c.section_target_id else
                        'UNIT' if c.unit_target_id else
                        'INDIVIDUAL'
                    )
                    self.stdout.write(f"      -> [{role}] {c.contribution_percentage}%  {c_str}")
                    shown += 1
                if truncated:
                    break
            if truncated:
                self.stdout.write(f"   ... {len(cascades) - shown} more relationships not listed (omit --limit or use --limit 0 to print all).")
            else:
                self.stdout.write(f"\n   Listed all {shown} relationships.")
            self.stdout.write("-" * 85 + "\n")

    def repair_cascade(self, tenant_id, year, kpis):
        from apps.kpi.services.cascade import TargetCascader

        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" REPAIR STRUCTURAL CASCADE MAPS FOR TENANT: {tenant_id} (Year: {year})"))
        self.stdout.write("=" * 85 + "\n")

        if not kpis:
            self.stdout.write("No KPIs matched. Pass --kpi-name to limit, or omit it to repair all.")
            return

        cascader = TargetCascader()
        for k in kpis:
            self.stdout.write(self.style.WARNING(f"KPI: {k.name}"))
            try:
                result = cascader.repair_structural_cascade_maps(tenant_id, str(k.id), year)
                self.stdout.write(
                    f"   rebuilt {result['maps_created']} maps across {result['parents']} parents "
                    f"(skipped {result['skipped_no_parent']}, rule={result['rule']})"
                )
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"   failed: {exc}"))
            self.stdout.write("")

    def show_weights(self, tenant_id, kpis, all_users):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" KPI WEIGHTS REPORT FOR TENANT: {tenant_id}"))
        self.stdout.write("=" * 85 + "\n")

        weights = KPIWeight.objects.filter(tenant_id=tenant_id).select_related('kpi', 'user', 'approved_by')
        if not weights.exists():
            self.stdout.write("No explicit KPIWeight records configured for this tenant yet.")
            self.stdout.write("(KPI targets currently use default headcount weighting rule in CascadeMap).\n")
            return

        for w in weights:
            user = all_users.get(w.user_id)
            user_str = f"{user.first_name} {user.last_name} ({user.email})" if user else str(w.user_id)
            self.stdout.write(f"- User: {user_str}")
            self.stdout.write(f"  KPI: {w.kpi.name}")
            self.stdout.write(f"  Weight: {w.weight}% | Active: {'Yes' if w.is_active else 'No'}")
            self.stdout.write(f"  Effective: {w.effective_from} to {w.effective_to or 'Ongoing'}\n")

    def show_phasings(self, tenant_id, year, kpis, all_users):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" MONTHLY TARGET PHASINGS & ACTUALS FOR TENANT: {tenant_id} (Year: {year})"))
        self.stdout.write("=" * 85 + "\n")

        actuals = MonthlyActual.objects.filter(tenant_id=tenant_id, year=year).select_related('kpi', 'user')

        if not actuals.exists():
            self.stdout.write(f"No MonthlyActual records found for year {year}.\n")
            return

        sample_actuals = actuals.order_by('user_id', 'month')[:60]
        current_user_id = None

        for act in sample_actuals:
            if act.user_id != current_user_id:
                current_user_id = act.user_id
                u = all_users.get(current_user_id)
                u_name = f"{u.first_name} {u.last_name} ({u.email})" if u else str(current_user_id)
                self.stdout.write(self.style.WARNING(f"\n[USER]: {u_name}"))

            self.stdout.write(f"   - Month {act.month:02d}: Actual = ${act.actual_value:,.2f} | Status = {act.status}")

        self.stdout.write("\n" + "=" * 85)

    def show_tree(self, tenant_id, year, kpis, all_users):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" TARGET CASCADE TREE HIERARCHY FOR TENANT: {tenant_id} (Year: {year})"))
        self.stdout.write("=" * 85 + "\n")

        from apps.kpi.services.cascade import TargetCascader

        for k in kpis:
            k_code = getattr(k, 'code', getattr(k, 'kpi_code', 'N/A'))
            self.stdout.write(self.style.WARNING(f"MASTER KPI: {k.name} ({k_code})\n"))

            root_target = AnnualTarget.objects.filter(
                kpi=k,
                tenant_id=tenant_id,
                year=year
            ).order_by('-target_value').first()

            if not root_target:
                self.stdout.write("   (No AnnualTarget found for this KPI)\n\n")
                continue

            cascader = TargetCascader()
            tree_data = cascader.get_cascade_tree(str(root_target.id), tenant_id)

            if not tree_data:
                self.stdout.write("   (No cascade tree data returned)\n\n")
                continue

            def print_tree_node(node, prefix="", is_last=True, depth=0):
                if not node:
                    return

                level = node.get('level', 'TARGET')
                node_name = node.get('name', 'Unassigned Node')
                lead_name = node.get('lead_name', node.get('user_name', 'Executive'))
                target_val = node.get('target_value', 0.0)
                unit_str = f"{k.unit} " if (k and k.unit) else ""
                val_str = f"{unit_str}{target_val:,.2f}"

                connector = "\\-- " if is_last else "|-- "
                branch = prefix + connector if depth > 0 else ""

                if level in ['ORGANIZATION', 'DIVISION', 'DEPARTMENT', 'SECTION', 'UNIT']:
                    title_display = f"{node_name} (Lead: {lead_name})"
                else:
                    title_display = lead_name

                self.stdout.write(f"{branch}[{level}] {title_display} | Target: {val_str}")

                children = node.get('children', [])
                count = len(children)
                for idx, child in enumerate(children):
                    child_is_last = (idx == count - 1)
                    new_prefix = prefix + ("    " if is_last else "|   ") if depth > 0 else ""
                    print_tree_node(child, prefix=new_prefix, is_last=child_is_last, depth=depth + 1)

            print_tree_node(tree_data)
            self.stdout.write("")
            self.stdout.write("-" * 85 + "\n")

