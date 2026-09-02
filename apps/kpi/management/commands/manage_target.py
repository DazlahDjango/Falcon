"""
Manage KPI Annual Targets, Monthly Phasing & Period Locking.

Usage Examples:
    # 1. List all annual targets for tenant
    python manage.py manage_target --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. Set an annual target for a user
    python manage.py manage_target --action set --kpi-name "Revenue Growth" \
        --assignee-email "paige.webb@globalapex.com" --year 2026 --target-value 120000.00

    # 3. Phase a target using Equal Split strategy
    python manage.py manage_target --action phase --kpi-name "Revenue Growth" \
        --assignee-email "paige.webb@globalapex.com" --year 2026 --strategy equal_split

    # 4. Phase a target using Seasonal strategy
    python manage.py manage_target --action phase --kpi-name "Revenue Growth" \
        --assignee-email "paige.webb@globalapex.com" --year 2026 --strategy seasonal

    # 5. Phase a target using Custom Pattern strategy
    python manage.py manage_target --action phase --kpi-name "Revenue Growth" \
        --assignee-email "victor.sullivan@globalapex.com" --year 2026 --strategy custom_pattern \
        --pattern "1,1,2,2,3,3,4,4,1,1,1,1"

    # 6. View monthly phasing breakdown for a target
    python manage.py manage_target --action phasings --kpi-name "Revenue Growth" \
        --assignee-email "paige.webb@globalapex.com" --year 2026

    # 7. Validate monthly phasing sum against annual target
    python manage.py manage_target --action validate --kpi-name "Revenue Growth" \
        --assignee-email "paige.webb@globalapex.com" --year 2026

    # 8. Lock individual month phasing
    python manage.py manage_target --action lock-month --phasing-id "MONTH_PHASING_UUID"

    # 9. Lock an entire performance cycle
    python manage.py manage_target --action lock-cycle --cycle FY2026

    # 10. Unlock an entire performance cycle
    python manage.py manage_target --action unlock-cycle --cycle FY2026
"""

from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.kpi.models.definition import KPI
from apps.kpi.models.target import AnnualTarget, MonthlyPhasing, PhasingLock
from apps.kpi.services.target import TargetSetter, TargetPhaser, TargetLocker, TargetValidator


class Command(BaseCommand):
    help = 'Manage annual targets, monthly distribution strategies, phasing validation, and performance cycle locks.'

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
            choices=['list', 'set', 'phase', 'phasings', 'validate', 'lock-month', 'lock-cycle', 'unlock-cycle'],
            default='list',
            help='Action: list, set, phase, phasings, validate, lock-month, lock-cycle, unlock-cycle'
        )

        # Action-specific arguments
        parser.add_argument('--target-id', type=str, default=None, help='AnnualTarget UUID')
        parser.add_argument('--phasing-id', type=str, default=None, help='MonthlyPhasing UUID')
        parser.add_argument('--kpi-name', '--kpi-code', '-k', type=str, default=None, dest='kpi_name', help='KPI Name or Code')
        parser.add_argument('--assignee-email', type=str, default=None, help='Email of user to whom annual target is assigned')
        parser.add_argument('--year', '-y', type=int, default=2026, help='Target year (default: 2026)')
        parser.add_argument('--month', '-m', type=int, default=1, help='Month (1-12) for single month operations')
        parser.add_argument('--target-value', type=str, default='100000.00', help='Annual target decimal value')
        parser.add_argument('--strategy', type=str, default='equal_split', choices=['equal_split', 'seasonal', 'custom_pattern'], help='Phasing strategy')
        parser.add_argument('--pattern', type=str, default=None, help='Comma-separated 12 weights for custom_pattern (e.g. 1,1,2,2,3,3,4,4,1,1,1,1)')
        parser.add_argument('--cycle', type=str, default='FY2026', help='Performance cycle identifier for locking (e.g. FY2026)')
        parser.add_argument('--notes', type=str, default='', help='Target setting notes')

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

        self.stdout.write(self.style.MIGRATE_HEADING(f"=== FALCON TARGET & PHASING MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {actor.email}")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'set':
            self.action_set(tenant_id, actor, options)
        elif action == 'phase':
            self.action_phase(tenant_id, actor, options)
        elif action == 'phasings':
            self.action_phasings(tenant_id, options)
        elif action == 'validate':
            self.action_validate(tenant_id, options)
        elif action == 'lock-month':
            self.action_lock_month(tenant_id, actor, options)
        elif action == 'lock-cycle':
            self.action_lock_cycle(tenant_id, actor, options)
        elif action == 'unlock-cycle':
            self.action_unlock_cycle(tenant_id, actor, options)

    def action_list(self, tenant_id, options):
        year = options['year']
        targets_qs = AnnualTarget.objects.filter(tenant_id=tenant_id, year=year).select_related('kpi', 'user')
        kpi_filter = options.get('kpi_name')
        if kpi_filter:
            targets_qs = targets_qs.filter(models.Q(kpi__name__icontains=kpi_filter) | models.Q(kpi__id__icontains=kpi_filter))

        targets = list(targets_qs.order_by('kpi__name'))
        self.stdout.write(self.style.SUCCESS(f"Found {len(targets)} Annual Targets for Year {year}:"))

        fmt = "{:<36} {:<25} {:<25} {:<15} {:<12}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("TARGET ID", "KPI NAME", "ASSIGNEE USER", "TARGET VALUE", "PHASED MONTHS")))
        self.stdout.write("-" * 120)
        for t in targets:
            phased_count = t.monthly_phasing.count()
            self.stdout.write(fmt.format(
                str(t.id),
                t.kpi.name[:24],
                t.user.email[:24],
                f"${t.target_value:,.2f}",
                f"{phased_count}/12"
            ))

    def action_set(self, tenant_id, actor, options):
        kpi_ref = options['kpi_name']
        if not kpi_ref:
            raise CommandError("--kpi-name is required to set target")

        assignee_email = options['assignee_email'] or actor.email
        assignee = User.objects.filter(email__iexact=assignee_email, tenant_id=tenant_id).first()
        if not assignee:
            raise CommandError(f"Assignee user '{assignee_email}' not found")

        kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
            models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
        ).first()

        if not kpi:
            raise CommandError(f"KPI '{kpi_ref}' not found")

        setter = TargetSetter()
        target = setter.set_annual_target(
            kpi_id=str(kpi.id),
            user_id=str(assignee.id),
            year=options['year'],
            target_value=Decimal(options['target_value']),
            user=actor
        )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully SET Annual Target!\n"
            f"  - Target ID: {target.id}\n"
            f"  - KPI      : {kpi.name}\n"
            f"  - Assignee : {assignee.email}\n"
            f"  - Year     : {target.year}\n"
            f"  - Value    : ${target.target_value:,.2f}"
        ))

    def get_target_by_options(self, tenant_id, options):
        target_id = options.get('target_id')
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

        raise CommandError("Could not locate Annual Target. Provide --target-id OR (--kpi-name and optionally --assignee-email and --year)")


    def action_phase(self, tenant_id, actor, options):
        target = self.get_target_by_options(tenant_id, options)
        strategy = options['strategy']
        strategy_params = {}

        if strategy == 'custom_pattern':
            pattern_str = options.get('pattern')
            if not pattern_str:
                raise CommandError("--pattern (12 comma-separated numbers) is required for custom_pattern strategy")
            try:
                pattern = [float(x.strip()) for x in pattern_str.split(',')]
                if len(pattern) != 12:
                    raise ValueError
                strategy_params['pattern'] = pattern
            except ValueError:
                raise CommandError("--pattern must contain exactly 12 comma-separated non-negative numbers")

        phaser = TargetPhaser()
        phasings = phaser.phase_target(
            annual_target_id=str(target.id),
            strategy=strategy,
            strategy_params=strategy_params,
            user=actor
        )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully PHASED Annual Target using '{strategy}' strategy ({len(phasings)} months created)!"
        ))
        for p in phasings[:4]:
            self.stdout.write(f"  - Month {p.month}: ${p.target_value:,.2f}")
        if len(phasings) > 4:
            self.stdout.write(f"  ... and {len(phasings) - 4} more months.")

    def action_phasings(self, tenant_id, options):
        target = self.get_target_by_options(tenant_id, options)
        phasings = list(target.monthly_phasing.all().order_by('month'))

        if not phasings:
            self.stdout.write(self.style.WARNING(f"No monthly phasing records found for Target '{target.kpi.name}' ({target.user.email})."))
            return

        self.stdout.write(self.style.SUCCESS(f"Monthly Phasing Breakdown for Target '{target.kpi.name}' ({target.user.email}, {target.year}):"))
        fmt = "{:<12} {:<12} {:<18} {:<12}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("MONTH", "MONTH NAME", "TARGET VALUE", "LOCKED STATUS")))
        self.stdout.write("-" * 65)
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        for p in phasings:
            m_name = month_names[p.month - 1] if 1 <= p.month <= 12 else str(p.month)
            self.stdout.write(fmt.format(f"Month {p.month}", m_name, f"${p.target_value:,.2f}", "LOCKED" if p.is_locked else "Unlocked"))

    def action_validate(self, tenant_id, options):
        target = self.get_target_by_options(tenant_id, options)
        validator = TargetValidator()
        summary = validator.validate_phasing_sum(str(target.id))

        self.stdout.write(self.style.SUCCESS(f"=== TARGET PHASING VALIDATION ==="))
        self.stdout.write(f" Annual Target ID   : {target.id}")
        self.stdout.write(f" KPI Name           : {target.kpi.name}")
        self.stdout.write(f" Assignee           : {target.user.email}")
        self.stdout.write(f" Annual Target Value: ${target.target_value:,.2f}")
        self.stdout.write(f" Total Phased Sum   : ${summary['total']:,.2f}")
        self.stdout.write(f" Validation Passed  : {summary['valid']}")

    def action_lock_month(self, tenant_id, actor, options):
        phasing_id = options.get('phasing_id')
        if not phasing_id:
            target = self.get_target_by_options(tenant_id, options)
            month = options['month']
            phasing = MonthlyPhasing.objects.filter(annual_target=target, month=month).first()
            if not phasing:
                raise CommandError(f"No phasing record found for month {month}")
        else:
            phasing = MonthlyPhasing.objects.filter(id=phasing_id, tenant_id=tenant_id).first()
            if not phasing:
                raise CommandError(f"Monthly Phasing '{phasing_id}' not found")

        phasing.lock(actor)
        self.stdout.write(self.style.SUCCESS(f"Successfully LOCKED Month {phasing.month} phasing for Target '{phasing.annual_target.kpi.name}'!"))

    def action_lock_cycle(self, tenant_id, actor, options):
        cycle = options['cycle']
        locker = TargetLocker()
        updated_count = locker.lock_phasing_for_cycle(tenant_id, cycle, actor)
        self.stdout.write(self.style.SUCCESS(f"Successfully LOCKED Performance Cycle '{cycle}' ({updated_count} monthly phasings locked)."))

    def action_unlock_cycle(self, tenant_id, actor, options):
        cycle = options['cycle']
        locker = TargetLocker()
        updated_count = locker.unlock_phasing_for_cycle(tenant_id, cycle, actor)
        self.stdout.write(self.style.SUCCESS(f"Successfully UNLOCKED Performance Cycle '{cycle}' ({updated_count} monthly phasings unlocked)."))
