# apps/reportplt/management/commands/manage_schedules.py
"""
Falcon PMS - Reporting Platform (reportplt)
Manage Report Schedules, Automated Recurring Deliveries & Trigger Run-Now.

Usage Examples:
    # 1. List all schedules for tenant
    python manage.py manage_schedules --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --action list

    # 2. View summary metrics
    python manage.py manage_schedules --action summary

    # 3. Create a Schedule
    python manage.py manage_schedules --action create --report-name "Executive Performance Review" \
        --name "Weekly Monday Digest" --frequency weekly --recipients "careen@falcontech.com,sarah.jenkins@globalapex.com"

    # 4. View due and overdue schedules
    python manage.py manage_schedules --action due
    python manage.py manage_schedules --action overdue

    # 5. Pause / Resume / Activate / Deactivate
    python manage.py manage_schedules --action pause --schedule-name "Weekly Monday Digest"
    python manage.py manage_schedules --action resume --schedule-name "Weekly Monday Digest"

    # 6. Trigger Immediate Run-Now
    python manage.py manage_schedules --action run_now --schedule-name "Weekly Monday Digest"

    # 7. Delete schedule
    python manage.py manage_schedules --action delete --schedule-name "Weekly Monday Digest"
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, models
from django.utils import timezone

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.models import Report, ReportSchedule
from apps.reportplt.constants import ScheduleFrequency
from apps.reportplt.services.scheduler.schedule_manager import ScheduleManager


class Command(BaseCommand):
    help = 'Manage report schedules, recurring triggers, due queries, and run-now execution.'

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
            default='careen@falcontech.com',
            help='Email of actor user performing the action'
        )
        parser.add_argument(
            '--action', '-a',
            type=str,
            choices=['list', 'summary', 'details', 'create', 'pause', 'resume', 'activate', 'deactivate', 'run_now', 'due', 'overdue', 'delete'],
            default='list',
            help='Action to perform'
        )

        parser.add_argument('--schedule-id', type=str, default=None, help='Schedule UUID')
        parser.add_argument('--schedule-name', '-s', type=str, default=None, help='Schedule Name')
        parser.add_argument('--report-id', type=str, default=None, help='Target Report UUID')
        parser.add_argument('--report-name', '-r', type=str, default=None, help='Target Report Name')
        parser.add_argument('--name', type=str, default=None, help='Name for creation')
        parser.add_argument('--frequency', type=str, default='weekly', choices=['hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom'], help='Frequency')
        parser.add_argument('--recipients', type=str, default='careen@falcontech.com', help='Comma-separated email recipients')

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
            user = User.objects.filter(email__iexact=user_email).first()

        self.stdout.write(self.style.MIGRATE_HEADING("=== FALCON SCHEDULE MANAGEMENT COMMAND ==="))
        self.stdout.write(f"Tenant ID : {tenant_id} (Schema: {schema_name})")
        self.stdout.write(f"Actor User: {user.email if user else 'System'} (Role: {getattr(user, 'role', 'N/A')})")
        self.stdout.write(f"Action    : {action.upper()}\n" + "-" * 70)

        if action == 'list':
            self.action_list(tenant_id, options)
        elif action == 'summary':
            self.action_summary(tenant_id)
        elif action == 'details':
            self.action_details(tenant_id, options)
        elif action == 'create':
            self.action_create(tenant_id, user, options)
        elif action == 'pause':
            self.action_set_state(tenant_id, user, options, 'pause')
        elif action == 'resume':
            self.action_set_state(tenant_id, user, options, 'resume')
        elif action == 'activate':
            self.action_set_state(tenant_id, user, options, 'activate')
        elif action == 'deactivate':
            self.action_set_state(tenant_id, user, options, 'deactivate')
        elif action == 'run_now':
            self.action_run_now(tenant_id, user, options)
        elif action == 'due':
            self.action_due(tenant_id)
        elif action == 'overdue':
            self.action_overdue(tenant_id)
        elif action == 'delete':
            self.action_delete(tenant_id, options)

    def _find_schedule(self, tenant_id, options):
        sched_id = options.get('schedule_id')
        sched_name = options.get('schedule_name')
        if sched_id:
            return ReportSchedule.objects.filter(id=sched_id, is_deleted=False).first()
        if sched_name:
            return ReportSchedule.objects.filter(name__icontains=sched_name, is_deleted=False).first()
        return ReportSchedule.objects.filter(is_deleted=False).first()

    def action_list(self, tenant_id, options):
        schedules = ReportSchedule.objects.filter(is_deleted=False).order_by('-created_at')
        count = schedules.count()
        self.stdout.write(f"Total Schedules Found: {count}\n")
        if not count:
            self.stdout.write(self.style.WARNING("  No schedules found in this tenant schema."))
            return

        self.stdout.write(f"{'ID':<38} {'Name':<30} {'Frequency':<12} {'Active':<8} {'Next Run':<20}")
        self.stdout.write("-" * 115)
        for s in schedules[:40]:
            name_disp = (s.name[:27] + '...') if len(s.name) > 30 else s.name
            next_run = str(s.next_run_at)[:19] if s.next_run_at else 'N/A'
            self.stdout.write(f"{str(s.id):<38} {name_disp:<30} {s.frequency:<12} {str(s.is_active):<8} {next_run:<20}")

    def action_summary(self, tenant_id):
        total = ReportSchedule.objects.filter(is_deleted=False).count()
        active = ReportSchedule.objects.filter(is_deleted=False, is_active=True).count()
        paused = ReportSchedule.objects.filter(is_deleted=False, is_paused=True).count()
        due = ReportSchedule.objects.filter(is_deleted=False, is_active=True, is_paused=False, next_run_at__lte=timezone.now()).count()

        self.stdout.write("REPORT SCHEDULES SUMMARY:")
        self.stdout.write(f"  * Total Schedules       : {total}")
        self.stdout.write(f"  * Active Schedules      : {active}")
        self.stdout.write(f"  * Paused Schedules      : {paused}")
        self.stdout.write(f"  * Currently Due Runs    : {due}")

    def action_details(self, tenant_id, options):
        schedule = self._find_schedule(tenant_id, options)
        if not schedule:
            raise CommandError("Schedule not found.")

        self.stdout.write(f"ID            : {schedule.id}")
        self.stdout.write(f"Name          : {schedule.name}")
        self.stdout.write(f"Report        : {schedule.report.name if schedule.report else 'N/A'}")
        self.stdout.write(f"Frequency     : {schedule.frequency} ({schedule.get_frequency_display()})")
        self.stdout.write(f"Status        : {schedule.status}")
        self.stdout.write(f"Is Active     : {schedule.is_active}")
        self.stdout.write(f"Is Paused     : {schedule.is_paused}")
        self.stdout.write(f"Next Run At   : {schedule.next_run_at}")
        self.stdout.write(f"Last Run At   : {schedule.last_run_at}")
        self.stdout.write(f"Last Status   : {schedule.last_run_status}")
        self.stdout.write(f"Recipients    : {schedule.recipients}")
        self.stdout.write(f"Delivery      : {schedule.delivery_method}")
        self.stdout.write(f"Created At    : {schedule.created_at}")

    def action_create(self, tenant_id, user, options):
        report_id = options.get('report_id')
        report_name = options.get('report_name')
        report = None
        if report_id:
            report = Report.objects.filter(id=report_id, is_deleted=False).first()
        elif report_name:
            report = Report.objects.filter(name__icontains=report_name, is_deleted=False).first()
        else:
            report = Report.objects.filter(is_deleted=False).first()

        if not report:
            raise CommandError("Target report not found. Create a report first or pass --report-name.")

        name = options.get('name') or options.get('schedule_name') or f"Automated Schedule for {report.name}"
        recipients = [r.strip() for r in options.get('recipients', '').split(',') if r.strip()]

        manager = ScheduleManager(user)
        schedule = manager.create_schedule({
            'tenant_id': tenant_id,
            'report': report,
            'name': name,
            'frequency': options.get('frequency', 'weekly'),
            'recipients': recipients,
            'delivery_method': ['email'],
            'is_active': True,
            'created_by': user,
            'owner': user
        })
        self.stdout.write(self.style.SUCCESS(f"Successfully created schedule '{schedule.name}' (ID: {schedule.id})"))

    def action_set_state(self, tenant_id, user, options, state_action):
        schedule = self._find_schedule(tenant_id, options)
        if not schedule:
            raise CommandError("Schedule not found.")

        manager = ScheduleManager(user)
        if state_action == 'pause':
            manager.pause_schedule(str(schedule.id))
            self.stdout.write(self.style.SUCCESS(f"Schedule '{schedule.name}' paused."))
        elif state_action == 'resume':
            manager.resume_schedule(str(schedule.id))
            self.stdout.write(self.style.SUCCESS(f"Schedule '{schedule.name}' resumed."))
        elif state_action == 'activate':
            manager.activate_schedule(str(schedule.id))
            self.stdout.write(self.style.SUCCESS(f"Schedule '{schedule.name}' activated."))
        elif state_action == 'deactivate':
            manager.deactivate_schedule(str(schedule.id))
            self.stdout.write(self.style.SUCCESS(f"Schedule '{schedule.name}' deactivated."))

    def action_run_now(self, tenant_id, user, options):
        schedule = self._find_schedule(tenant_id, options)
        if not schedule:
            raise CommandError("Schedule not found.")

        self.stdout.write(f"Executing immediate run-now for schedule: {schedule.name}...")
        manager = ScheduleManager(user)
        result = manager.trigger_schedule_now(str(schedule.id))
        self.stdout.write(self.style.SUCCESS(f"Schedule triggered successfully: {result}"))

    def action_due(self, tenant_id):
        due = ReportSchedule.objects.filter(is_deleted=False, is_active=True, is_paused=False, next_run_at__lte=timezone.now())
        self.stdout.write(f"Due Schedules: {due.count()}")
        for s in due:
            self.stdout.write(f"  * {s.name} (ID: {s.id}) - Next Run: {s.next_run_at}")

    def action_overdue(self, tenant_id):
        threshold = timezone.now() - timezone.timedelta(hours=1)
        overdue = ReportSchedule.objects.filter(is_deleted=False, is_active=True, is_paused=False, next_run_at__lte=threshold)
        self.stdout.write(f"Overdue Schedules (>1hr): {overdue.count()}")
        for s in overdue:
            self.stdout.write(f"  * {s.name} (ID: {s.id}) - Next Run: {s.next_run_at}")

    def action_delete(self, tenant_id, options):
        schedule = self._find_schedule(tenant_id, options)
        if not schedule:
            raise CommandError("Schedule not found.")

        name = schedule.name
        schedule.soft_delete()
        self.stdout.write(self.style.SUCCESS(f"Schedule '{name}' deleted."))
