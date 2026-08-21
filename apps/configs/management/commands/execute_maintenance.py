from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.configs.models import RegisteredApp, MaintenanceWindow, MaintenanceLog, ConfigAuditLog
from apps.configs.services.maintenance.maintenance_orchestrator import MaintenanceOrchestrator
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode

class Command(BaseCommand):
    help = 'Comprehensive management command to execute Maintenance actions: schedule, start, stop, cancel, and status.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-email',
            type=str,
            required=True,
            help='Super Admin email authorizing maintenance execution (Required).'
        )
        parser.add_argument(
            '--action',
            type=str,
            choices=['all', 'schedule', 'start', 'stop', 'cancel', 'status'],
            default='all',
            help='Maintenance action to execute (Choices: all, schedule, start, stop, cancel, status. Default: all).'
        )
        parser.add_argument(
            '--maintenance-type',
            type=str,
            choices=['full', 'partial'],
            default='partial',
            help='Type of maintenance (Choices: full, partial. Default: partial).'
        )
        parser.add_argument(
            '--app',
            type=str,
            default='configs',
            help='Target application name for partial maintenance (Default: configs).'
        )
        parser.add_argument(
            '--window-id',
            type=str,
            help='Specific MaintenanceWindow UUID (optional).'
        )
        parser.add_argument(
            '--reason',
            type=str,
            default='Routine maintenance via management command',
            help='Reason for maintenance execution.'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Bypass confirmation prompt.'
        )

    def handle(self, *args, **options):
        admin_email = options['admin_email']
        action = options['action']
        m_type = options['maintenance_type']
        app_name = options['app']
        window_id = options.get('window_id')
        reason = options['reason']
        force = options['force']

        # ---------------------------------------------------------
        # 1. VERIFY SUPER ADMIN USER
        # ---------------------------------------------------------
        user = User.objects.filter(email=admin_email).first()
        if not user:
            raise CommandError(f"User with email '{admin_email}' not found.")

        user_role = getattr(user, 'role', None)
        if not (user.is_superuser or user_role == 'super_admin'):
            raise CommandError(f"Permission Denied: User '{admin_email}' must have 'super_admin' role (Current role: '{user_role}').")

        self.stdout.write(self.style.SUCCESS(f"  [OK] Authenticated Super Admin: {user.email} (ID: {user.id})"))

        # Target app resolution
        app = None
        if m_type == 'partial':
            app, _ = RegisteredApp.objects.get_or_create(
                name=app_name,
                defaults={'display_name': app_name.title(), 'is_registered': True}
            )

        orchestrator = MaintenanceOrchestrator()
        mode = MaintenanceMode()

        # Confirmation prompt if force flag is not set for start or full maintenance
        if action in ['all', 'start', 'schedule'] and m_type == 'full' and not force:
            self.stdout.write(self.style.WARNING(f"\n  [WARNING] You are about to initiate FULL SYSTEM MAINTENANCE for all applications."))
            confirm = input("Type 'YES' to proceed: ")
            if confirm.strip() != 'YES':
                self.stdout.write(self.style.NOTICE("Maintenance command cancelled."))
                return

        # ---------------------------------------------------------
        # ACTION DISPATCHER
        # ---------------------------------------------------------
        if action == 'status':
            self._display_status(mode)

        elif action == 'schedule':
            self._schedule_window(orchestrator, user, m_type, app, reason)

        elif action == 'start':
            w = self._get_or_create_target_window(orchestrator, user, window_id, m_type, app, reason)
            self._start_window(orchestrator, user, w)

        elif action == 'stop':
            w = self._get_active_window(window_id)
            self._stop_window(orchestrator, user, w)

        elif action == 'cancel':
            self._cancel_window(user, window_id)

        elif action == 'all':
            self.stdout.write(self.style.MIGRATE_HEADING("\n" + "=" * 80))
            self.stdout.write(self.style.MIGRATE_HEADING("  EXECUTING ALL MAINTENANCE LIFECYCLE ACTIONS"))
            self.stdout.write(self.style.MIGRATE_HEADING("=" * 80))

            # Step 1: Schedule Window
            w = self._schedule_window(orchestrator, user, m_type, app, reason)

            # Step 2: Start Maintenance
            self._start_window(orchestrator, user, w)

            # Step 3: Check Active Status
            self._display_status(mode)

            # Step 4: Stop Maintenance
            self._stop_window(orchestrator, user, w)

            # Step 5: Check Reset Status
            self._display_status(mode)

            # Step 6: Display Audit Summary
            self._display_audit_summary()

            self.stdout.write(self.style.SUCCESS("\n========================================================================="))
            self.stdout.write(self.style.SUCCESS("  [OK] ALL MAINTENANCE ACTIONS COMPLETED SUCCESSFULLY!"))
            self.stdout.write(self.style.SUCCESS("=========================================================================\n"))

    def _schedule_window(self, orchestrator, user, m_type, app, reason):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Scheduling {m_type.upper()} Maintenance Window..."))
        now = timezone.now()
        # Clean up past active windows to prevent overlap conflicts during tests
        MaintenanceWindow.objects.filter(status__in=['scheduled', 'in_progress']).update(status='completed')

        window = orchestrator.schedule_maintenance(
            title=f"CLI {m_type.title()} Maintenance Window",
            maintenance_type=m_type,
            scheduled_start=now + timedelta(minutes=5),
            scheduled_end=now + timedelta(hours=2),
            triggered_by=user.id,
            triggered_by_role=getattr(user, 'role', 'super_admin'),
            reason=reason,
            affected_app_ids=[app.id] if (app and m_type == 'partial') else None
        )
        self.stdout.write(self.style.SUCCESS(f"  [OK] Window Scheduled: ID {window.id} | Status: {window.status}"))
        self.stdout.write(f"     Scheduled Start: {window.scheduled_start}")
        self.stdout.write(f"     Scheduled End:   {window.scheduled_end}")
        return window

    def _start_window(self, orchestrator, user, window):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Starting Maintenance Window (ID: {window.id})..."))
        started_window = orchestrator.start_maintenance(
            window.id, user.id, getattr(user, 'role', 'super_admin')
        )
        self.stdout.write(self.style.SUCCESS(f"  [OK] Maintenance Activated! Status: {started_window.status}"))
        self.stdout.write(f"     Actual Start: {started_window.actual_start}")

    def _stop_window(self, orchestrator, user, window):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Stopping Maintenance Window (ID: {window.id})..."))
        stopped_window = orchestrator.stop_maintenance(
            window.id, user.id, getattr(user, 'role', 'super_admin')
        )
        self.stdout.write(self.style.SUCCESS(f"  [OK] Maintenance Deactivated! Status: {stopped_window.status}"))
        self.stdout.write(f"     Actual End: {stopped_window.actual_end}")

    def _cancel_window(self, user, window_id):
        if not window_id:
            raise CommandError("Argument --window-id is required for cancel action.")
        window = MaintenanceWindow.objects.filter(id=window_id).first()
        if not window:
            raise CommandError(f"MaintenanceWindow with ID '{window_id}' not found.")
        window.status = 'cancelled'
        window.save(update_fields=['status'])
        self.stdout.write(self.style.SUCCESS(f"  [OK] Maintenance Window {window.id} status updated to 'cancelled'."))

    def _display_status(self, mode):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Current Maintenance Mode Status:"))
        is_active = mode.is_active()
        m_type = mode.get_type()
        message = mode.get_message()
        apps = mode.get_affected_apps()

        self.stdout.write(f"  - Active State:   {is_active}")
        self.stdout.write(f"  - Scope Type:     {m_type}")
        self.stdout.write(f"  - Notice Message: {message}")
        self.stdout.write(f"  - Affected Apps:  {apps if apps else 'None (System Wide / Inactive)'}")

    def _get_or_create_target_window(self, orchestrator, user, window_id, m_type, app, reason):
        if window_id:
            w = MaintenanceWindow.objects.filter(id=window_id).first()
            if not w:
                raise CommandError(f"MaintenanceWindow '{window_id}' not found.")
            return w
        return self._schedule_window(orchestrator, user, m_type, app, reason)

    def _get_active_window(self, window_id):
        if window_id:
            w = MaintenanceWindow.objects.filter(id=window_id).first()
            if not w:
                raise CommandError(f"MaintenanceWindow '{window_id}' not found.")
            return w
        w = MaintenanceWindow.objects.filter(status='in_progress').order_by('-actual_start').first()
        if not w:
            w = MaintenanceWindow.objects.order_by('-created_at').first()
        if not w:
            raise CommandError("No active or scheduled maintenance window found to stop.")
        return w

    def _display_audit_summary(self):
        self.stdout.write(self.style.MIGRATE_LABEL(f"\n[+] Recent Maintenance Audit Logs:"))
        recent_logs = ConfigAuditLog.objects.filter(
            action__contains='maintenance'
        ).order_by('-performed_at')[:5]

        for log in recent_logs:
            time_str = log.performed_at.strftime('%Y-%m-%d %H:%M:%S')
            self.stdout.write(f"  - [{time_str}] Action: {log.action:<18} | By Role: {log.performed_by_role:<11} | Result: {log.result}")
