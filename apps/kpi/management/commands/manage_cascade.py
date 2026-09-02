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


class Command(BaseCommand):
    help = 'Manage target cascading, multi-level hierarchy trees, structural map repair, and rollback operations.'


    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id', '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant Organization ID (default: 275adb1f-8e12-46ee-b394-ea42d41b10c9)'
        )
        parser.add_argument(
            '--user-email', '-u',
            type=str,
            default='emily.clark@globalapex.com',
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

        actor = User.objects.filter(email__iexact=user_email, tenant_id=tenant_id).first()
        if not actor:
            actor = User.objects.filter(tenant_id=tenant_id).first()
        if not actor:
            raise CommandError(f"No user found for email '{user_email}' under tenant '{tenant_id}'")

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
                models.Q(parent_target__kpi__id__icontains=kpi_filter)
            )

        maps = list(maps_qs.order_by('-created_at'))
        self.stdout.write(self.style.SUCCESS(f"Found {len(maps)} Cascade Maps:"))

        fmt = "{:<36} {:<22} {:<24} {:<24} {:<12} {:<12}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("MAP ID", "KPI NAME", "PARENT USER", "CHILD USER / LEVEL", "RULE TYPE", "WEIGHT/VAL")))
        self.stdout.write("-" * 135)
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

            self.stdout.write(fmt.format(
                str(m.id),
                m.parent_target.kpi.name[:21] if m.parent_target and m.parent_target.kpi else "N/A",
                parent_user[:23],
                child_desc[:23],
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
            qs = qs.filter(models.Q(kpi__id=kpi_ref) | models.Q(kpi__name__icontains=kpi_ref))
            if assignee_email:
                qs = qs.filter(user__email__iexact=assignee_email)
            target = qs.first()
            if target:
                return target

        raise CommandError("Could not locate Parent Annual Target. Provide --parent-target-id OR (--kpi-name and optionally --assignee-email and --year)")

    def action_cascade(self, tenant_id, actor, options):
        parent_target = self.get_parent_target(tenant_id, options)
        child_users_str = options.get('child_users')
        if not child_users_str:
            raise CommandError("--child-users (comma-separated email list) is required for cascading target")

        emails = [e.strip() for e in child_users_str.split(',') if e.strip()]
        child_users = list(User.objects.filter(tenant_id=tenant_id, email__in=emails))
        if not child_users:
            raise CommandError(f"No valid child users found for emails: {child_users_str}")

        rule_type = options['rule_type']
        rule = CascadeRule.objects.create(
            tenant_id=tenant_id,
            kpi=parent_target.kpi,
            rule_type=rule_type,
            created_by=actor
        )

        cascader = TargetCascader()
        cascade_data = {
            'rule_id': str(rule.id),
            'parent_target_id': str(parent_target.id),
            'target_level': 'INDIVIDUAL',
            'entities': [{'user_id': str(u.id)} for u in child_users]
        }

        result = cascader.cascade_target(cascade_data, actor)
        self.stdout.write(self.style.SUCCESS(
            f"Successfully CASCADED Parent Target '{parent_target.kpi.name}' (${parent_target.target_value:,.2f}) to {len(child_users)} child users!\n"
            f"  - Created Maps: {len(result.get('created_maps', []))}\n"
            f"  - Created Child Targets: {len(result.get('created_targets', []))}"
        ))

    def action_tree(self, tenant_id, options):
        kpi_ref = options.get('kpi_name')
        qs = AnnualTarget.objects.filter(tenant_id=tenant_id, year=options['year']).select_related('kpi', 'user')
        if kpi_ref:
            qs = qs.filter(models.Q(kpi__id=kpi_ref) | models.Q(kpi__name__icontains=kpi_ref))

        top_targets = list(qs)
        if not top_targets:
            self.stdout.write(self.style.WARNING("No targets found to build tree."))
            return

        self.stdout.write(self.style.SUCCESS(f"=== TARGET CASCADE HIERARCHY TREE ==="))
        for root in top_targets:
            self.stdout.write(self.style.MIGRATE_HEADING(f"📌 [Root Target] {root.kpi.name} ({root.user.email}) - Annual Target: ${root.target_value:,.2f}"))
            self.print_tree_branches(root, indent=2)

    def print_tree_branches(self, parent_target, indent=2):
        child_maps = CascadeMap.objects.filter(parent_target=parent_target).select_related(
            'child_target__user', 'individual_target__user', 'department_target'
        )
        spaces = " " * indent
        for cm in child_maps:
            child_user = cm.child_target.user.email if cm.child_target and cm.child_target.user else "N/A"
            target_val = f"${cm.child_target.target_value:,.2f}" if cm.child_target else "N/A"
            self.stdout.write(f"{spaces}└── 🎯 [Cascaded Target] {child_user} - Target: {target_val} (Contrib: {cm.contribution_percentage}%)")
            if cm.child_target:
                self.print_tree_branches(cm.child_target, indent=indent + 4)


    def action_repair(self, tenant_id, actor, options):
        kpi_ref = options.get('kpi_name')
        year = options['year']
        cascader = TargetCascader()

        if kpi_ref:
            kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
                models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
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
