"""
Inspect KPI Definitions, Target Cascading, Phasings, Weights, and Overall KPI Metrics for a tenant.
Usage:
    python manage.py show_kpi_summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action overall
    python manage.py show_kpi_summary --action list
    python manage.py show_kpi_summary --action cascading
    python manage.py show_kpi_summary --action weights
    python manage.py show_kpi_summary --action phasings
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
            choices=['overall', 'list', 'cascading', 'tree', 'weights', 'phasings'],
            default='overall',
            help='Specific KPI inspection action to run (overall, list, cascading, tree, weights, phasings)'
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

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        action = options['action']
        kpi_name = options['kpi_name']
        year = options['year']

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
            self.show_cascading(tenant_id, year, kpis, all_users)
        elif action == 'tree':
            self.show_tree(tenant_id, year, kpis, all_users)
        elif action == 'weights':
            self.show_weights(tenant_id, kpis, all_users)
        elif action == 'phasings':
            self.show_phasings(tenant_id, year, kpis, all_users)

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
        self.stdout.write(f"   - Total Sum of Annual Targets ({year}): ${total_target_value:,.2f}")
        self.stdout.write(f"   - Total Sum of Monthly Actuals Recorded: ${total_actual_value:,.2f}\n")

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

    def show_cascading(self, tenant_id, year, kpis, all_users):
        self.stdout.write("=" * 85)
        self.stdout.write(self.style.SUCCESS(f" TARGET CASCADING MAP FOR TENANT: {tenant_id} (Year: {year})"))
        self.stdout.write("=" * 85 + "\n")

        for k in kpis:
            self.stdout.write(self.style.WARNING(f"MASTER KPI: {k.name}\n"))
            cascades = CascadeMap.objects.filter(
                tenant_id=tenant_id,
                parent_target__kpi=k
            ).select_related('parent_target', 'child_target', 'cascade_rule', 'parent_target__user', 'child_target__user')

            if not cascades.exists():
                self.stdout.write("   (No CascadeMap entries found for this KPI)\n")
                continue

            self.stdout.write(f"   Found {cascades.count()} cascaded target relationships:\n")
            for c in cascades[:50]:
                p_user = all_users.get(c.parent_target.user_id) if c.parent_target else None
                c_user = all_users.get(c.child_target.user_id) if c.child_target else None

                p_role = (getattr(p_user, 'role', 'ORG') or 'ORG').upper()
                c_role = (getattr(c_user, 'role', 'CHILD') or 'CHILD').upper()

                p_str = f"[{p_role}] {p_user.first_name} {p_user.last_name}" if p_user else "[ORG] Organization Target"
                c_str = f"[{c_role}] {c_user.first_name} {c_user.last_name} ({c_user.email})" if c_user else "[CHILD] Child Target"

                c_val = c.child_target.target_value if c.child_target else 0

                self.stdout.write(f"   - {p_str}  ==[{c.contribution_percentage}% / Rule: {c.cascade_rule.name}]==>  {c_str}")
                self.stdout.write(f"     Target Value: ${c_val:,.2f}")

            if cascades.count() > 50:
                self.stdout.write(f"   ... and {cascades.count() - 50} more cascaded relationships.")
            self.stdout.write("-" * 85 + "\n")

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
                val_str = f"${target_val:,.2f}"

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

