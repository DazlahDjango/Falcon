"""
Manage KPI Definitions & Sub-KPI Approval Workflows.

Usage Examples:
    # 1. List all KPIs for tenant
    python manage.py manage_kpi --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. Show KPI summary metrics
    python manage.py manage_kpi --action summary

    # 3. Create a Master KPI
    python manage.py manage_kpi --action create --name "Annual Revenue 2026" --code "REV_2026" \
        --user-email "emily.clark@globalapex.com" --type FINANCIAL --unit USD --target-min 10000 --target-max 500000

    # 4. Create a Staff Sub-KPI proposed by an employee
    python manage.py manage_kpi --action create --name "Regional Q3 Ad Campaign" \
        --user-email "paige.webb@globalapex.com" --parent-kpi "REV_2026"

    # 5. List all pending sub-KPI approvals
    python manage.py manage_kpi --action pending

    # 6. Approve a staff proposed sub-KPI
    python manage.py manage_kpi --action approve --kpi-name "Regional Q3 Ad Campaign" \
        --user-email "emily.clark@globalapex.com" --notes "Approved after strategy review"

    # 7. Reject a staff proposed sub-KPI
    python manage.py manage_kpi --action reject --kpi-name "Regional Q3 Ad Campaign" \
        --user-email "emily.clark@globalapex.com" --reason "Overlaps with Q2 initiative"

    # 8. View child sub-KPIs linked under a master KPI
    python manage.py manage_kpi --action sub-kpis --kpi-name "REV_2026"

    # 9. View full details of a specific KPI
    python manage.py manage_kpi --action details --kpi-name "REV_2026"
"""

from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.kpi.models.definition import KPI, KPICategory
from apps.kpi.services.kpi import KPICreator, KPIApprovalService


class Command(BaseCommand):
    help = 'Manage KPI definitions, staff sub-KPI proposals, approvals, rejections, and hierarchy.'

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
            help='Email of user performing the management command action'
        )
        parser.add_argument(
            '--action', '-a',
            type=str,
            choices=['list', 'summary', 'create', 'pending', 'approve', 'reject', 'sub-kpis', 'details'],
            default='list',
            help='Action to perform: list, summary, create, pending, approve, reject, sub-kpis, details'
        )

        # Action-specific arguments
        parser.add_argument('--kpi-id', type=str, default=None, help='KPI UUID')
        parser.add_argument('--kpi-name', '--kpi-code', '-k', type=str, default=None, dest='kpi_name', help='KPI Name or Code')
        parser.add_argument('--parent-kpi', type=str, default=None, help='Parent KPI Name or Code for creating sub-KPIs')
        parser.add_argument('--name', type=str, default=None, help='KPI Name for creation')
        parser.add_argument('--code', type=str, default=None, help='KPI Code for creation')
        parser.add_argument('--description', type=str, default='', help='KPI Description')
        parser.add_argument('--type', type=str, default='FINANCIAL', choices=['FINANCIAL', 'OPERATIONAL', 'CUSTOMER', 'PEOPLE', 'STRATEGIC'], help='KPI Type')
        parser.add_argument('--measure-type', type=str, default='CUMULATIVE', choices=['CUMULATIVE', 'AVERAGE', 'LAST_VALUE', 'SNAPSHOT'], help='Measure Type')
        parser.add_argument('--calculation-logic', type=str, default='HIGHER_IS_BETTER', choices=['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_IS_BEST'], help='Calculation Logic')
        parser.add_argument('--unit', type=str, default='USD', help='KPI Unit (e.g. USD, %, count)')
        parser.add_argument('--target-min', type=str, default='0.00', help='Target Minimum Value')
        parser.add_argument('--target-max', type=str, default='100.00', help='Target Maximum Value')
        parser.add_argument('--notes', type=str, default='', help='Notes for approval action')
        parser.add_argument('--reason', type=str, default='', help='Rejection reason for reject action')

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

        user = User.objects.filter(email__iexact=user_email, tenant_id=tenant_id).first()
        if not user:
            user = User.objects.filter(tenant_id=tenant_id).first()
        if not user:
            raise CommandError(f"No user found for email '{user_email}' under tenant '{tenant_id}'")

        self.stdout.write(self.style.MIGRATE_HEADING(f"=== FALCON KPI MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {user.email} (Role: {getattr(user, 'role', 'N/A')})")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'summary':
            self.action_summary(tenant_id)
        elif action == 'create':
            self.action_create(tenant_id, user, options)
        elif action == 'pending':
            self.action_pending(tenant_id)
        elif action == 'approve':
            self.action_approve(tenant_id, user, options)
        elif action == 'reject':
            self.action_reject(tenant_id, user, options)
        elif action == 'sub-kpis':
            self.action_sub_kpis(tenant_id, options)
        elif action == 'details':
            self.action_details(tenant_id, options)

    def action_list(self, tenant_id, options):
        kpis_qs = KPI.objects.filter(tenant_id=tenant_id).select_related('owner', 'department', 'parent_kpi')
        kpi_filter = options.get('kpi_name')
        if kpi_filter:
            kpis_qs = kpis_qs.filter(models.Q(name__icontains=kpi_filter) | models.Q(id__icontains=kpi_filter))

        kpis = list(kpis_qs.order_by('name'))
        self.stdout.write(self.style.SUCCESS(f"Found {len(kpis)} KPIs:"))

        fmt = "{:<36} {:<32} {:<12} {:<25} {:<18} {:<16}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("KPI ID", "NAME", "TYPE", "OWNER", "APPROVAL STATUS", "LEVEL")))
        self.stdout.write("-" * 140)
        for k in kpis:
            owner_name = k.owner.email if k.owner else "Unassigned"
            level = "Sub-KPI" if k.parent_kpi_id else "Master KPI"
            self.stdout.write(fmt.format(
                str(k.id),
                k.name[:31],
                k.kpi_type[:11],
                owner_name[:24],
                k.approval_status,
                level
            ))


    def action_summary(self, tenant_id):
        total = KPI.objects.filter(tenant_id=tenant_id).count()
        masters = KPI.objects.filter(tenant_id=tenant_id, parent_kpi__isnull=True).count()
        staff_subs = KPI.objects.filter(tenant_id=tenant_id, parent_kpi__isnull=False).count()
        approved = KPI.objects.filter(tenant_id=tenant_id, approval_status='APPROVED').count()
        pending = KPI.objects.filter(tenant_id=tenant_id, approval_status='PENDING_APPROVAL').count()
        rejected = KPI.objects.filter(tenant_id=tenant_id, approval_status='REJECTED').count()
        active = KPI.objects.filter(tenant_id=tenant_id, is_active=True).count()

        self.stdout.write(self.style.SUCCESS("=== KPI SYSTEM SUMMARY METRICS ==="))
        self.stdout.write(f" Total Defined KPIs       : {total}")
        self.stdout.write(f" Master (Top-level) KPIs  : {masters}")
        self.stdout.write(f" Staff Sub-KPIs           : {staff_subs}")
        self.stdout.write(f" Active KPIs              : {active}")
        self.stdout.write(f" Approved KPIs            : {approved}")
        self.stdout.write(f" Pending Approval Sub-KPIs: {pending}")
        self.stdout.write(f" Rejected Sub-KPIs        : {rejected}")

    def action_create(self, tenant_id, user, options):
        name = options['name']
        if not name:
            raise CommandError("--name is required for creating a KPI")

        parent_identifier = options['parent_kpi']
        parent_kpi = None
        if parent_identifier:
            parent_kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
                models.Q(id=parent_identifier) | models.Q(name__icontains=parent_identifier)
            ).first()
            if not parent_kpi:
                raise CommandError(f"Parent KPI '{parent_identifier}' not found")

        creator = KPICreator()
        kpi_data = {
            'name': name,
            'description': options['description'],
            'kpi_type': options['type'],
            'measure_type': options['measure_type'],
            'calculation_logic': options['calculation_logic'],
            'unit': options['unit'],
            'target_min': Decimal(options['target_min']),
            'target_max': Decimal(options['target_max']),
            'parent_kpi': parent_kpi,
            'owner': user
        }

        kpi = creator.create_kpi(kpi_data, user)
        self.stdout.write(self.style.SUCCESS(
            f"Successfully created KPI '{kpi.name}' (ID: {kpi.id})\n"
            f"  - Status: {kpi.approval_status}\n"
            f"  - Active: {kpi.is_active}\n"
            f"  - Parent: {kpi.parent_kpi.name if kpi.parent_kpi else 'None (Master KPI)'}"
        ))

    def action_pending(self, tenant_id):
        pending_kpis = list(KPI.objects.filter(tenant_id=tenant_id, approval_status='PENDING_APPROVAL').select_related('owner', 'parent_kpi'))
        if not pending_kpis:
            self.stdout.write(self.style.SUCCESS("No pending sub-KPI approvals found."))
            return

        self.stdout.write(self.style.WARNING(f"Found {len(pending_kpis)} Pending Approval Sub-KPIs:"))
        fmt = "{:<36} {:<25} {:<25} {:<25}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("SUB-KPI ID", "SUB-KPI NAME", "PROPOSED BY", "PARENT KPI")))
        self.stdout.write("-" * 115)
        for k in pending_kpis:
            proposer = k.owner.email if k.owner else "Unknown"
            parent_name = k.parent_kpi.name if k.parent_kpi else "None"
            self.stdout.write(fmt.format(str(k.id), k.name[:24], proposer[:24], parent_name[:24]))

    def action_approve(self, tenant_id, approver_user, options):
        kpi_ref = options['kpi_id'] or options['kpi_name']
        if not kpi_ref:
            raise CommandError("Please specify --kpi-id or --kpi-name to approve")

        kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
            models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
        ).first()

        if not kpi:
            raise CommandError(f"KPI '{kpi_ref}' not found")

        service = KPIApprovalService()
        approved_kpi = service.approve_sub_kpi(kpi.id, approver_user, notes=options['notes'])
        self.stdout.write(self.style.SUCCESS(
            f"Successfully APPROVED Sub-KPI '{approved_kpi.name}'!\n"
            f"  - Approval Status: {approved_kpi.approval_status}\n"
            f"  - Active Status  : {approved_kpi.is_active}\n"
            f"  - Approved By    : {approved_kpi.approved_by.email if approved_kpi.approved_by else 'N/A'}"
        ))

    def action_reject(self, tenant_id, rejector_user, options):
        kpi_ref = options['kpi_id'] or options['kpi_name']
        if not kpi_ref:
            raise CommandError("Please specify --kpi-id or --kpi-name to reject")

        reason = options['reason'] or "Did not align with strategic targets"

        kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
            models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
        ).first()

        if not kpi:
            raise CommandError(f"KPI '{kpi_ref}' not found")

        service = KPIApprovalService()
        rejected_kpi = service.reject_sub_kpi(kpi.id, rejector_user, reason=reason)
        self.stdout.write(self.style.ERROR(
            f"Successfully REJECTED Sub-KPI '{rejected_kpi.name}'!\n"
            f"  - Approval Status: {rejected_kpi.approval_status}\n"
            f"  - Active Status  : {rejected_kpi.is_active}\n"
            f"  - Rejection Reason: {rejected_kpi.rejection_reason}"
        ))

    def action_sub_kpis(self, tenant_id, options):
        kpi_ref = options['kpi_id'] or options['kpi_name']
        if not kpi_ref:
            raise CommandError("Please specify parent KPI via --kpi-id or --kpi-name")

        parent = KPI.objects.filter(tenant_id=tenant_id).filter(
            models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
        ).first()

        if not parent:
            raise CommandError(f"Parent KPI '{kpi_ref}' not found")

        subs = list(parent.sub_kpis.all().select_related('owner'))
        self.stdout.write(self.style.SUCCESS(f"Sub-KPIs linked under Master KPI '{parent.name}' ({len(subs)} found):"))
        fmt = "{:<36} {:<30} {:<18} {:<15} {:<10}"
        self.stdout.write(self.style.SQL_FIELD(fmt.format("SUB-KPI ID", "NAME", "STATUS", "OWNER", "ACTIVE")))
        self.stdout.write("-" * 115)
        for s in subs:
            owner_email = s.owner.email if s.owner else "Unassigned"
            self.stdout.write(fmt.format(str(s.id), s.name[:29], s.approval_status, owner_email[:14], str(s.is_active)))

    def action_details(self, tenant_id, options):
        kpi_ref = options['kpi_id'] or options['kpi_name']
        if not kpi_ref:
            raise CommandError("Please specify --kpi-id or --kpi-name to view details")

        kpi = KPI.objects.filter(tenant_id=tenant_id).filter(
            models.Q(id=kpi_ref) | models.Q(name__icontains=kpi_ref)
        ).select_related('owner', 'department', 'parent_kpi', 'approved_by').first()

        if not kpi:
            raise CommandError(f"KPI '{kpi_ref}' not found")

        self.stdout.write(self.style.SUCCESS(f"=== KPI DETAILS: {kpi.name} ==="))
        self.stdout.write(f" ID              : {kpi.id}")
        self.stdout.write(f" Description     : {kpi.description or 'N/A'}")
        self.stdout.write(f" Type            : {kpi.kpi_type}")
        self.stdout.write(f" Measure Type    : {kpi.measure_type}")
        self.stdout.write(f" Logic           : {kpi.calculation_logic}")
        self.stdout.write(f" Unit            : {kpi.unit}")
        self.stdout.write(f" Target Range    : {kpi.target_min} - {kpi.target_max}")
        self.stdout.write(f" Owner           : {kpi.owner.email if kpi.owner else 'Unassigned'}")
        self.stdout.write(f" Approval Status : {kpi.approval_status}")
        self.stdout.write(f" Is Active       : {kpi.is_active}")
        self.stdout.write(f" Parent KPI      : {kpi.parent_kpi.name if kpi.parent_kpi else 'None (Master KPI)'}")
        self.stdout.write(f" Approved By     : {kpi.approved_by.email if kpi.approved_by else 'N/A'}")
        if kpi.rejection_reason:
            self.stdout.write(f" Rejection Reason: {kpi.rejection_reason}")

