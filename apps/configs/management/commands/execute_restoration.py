from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from dateutil.parser import parse as parse_datetime
from apps.accounts.models import User
from apps.configs.models import BackupJob, RegisteredApp
from apps.configs.services.restore.restore_orchestrator import RestoreOrchestrator
from apps.configs.services.restore.restore_validator import RestoreValidator

class Command(BaseCommand):
    help = 'Execute system or app restoration with mandatory Super Admin authentication.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-email',
            type=str,
            required=True,
            help='Super Admin email authorizing the restoration action (REQUIRED)'
        )
        parser.add_argument(
            '--action',
            type=str,
            default='single_app',
            choices=['single_app', 'full_system', 'pitr', 'validate'],
            help='Restoration action type: single_app, full_system, pitr, or validate'
        )
        parser.add_argument(
            '--app',
            type=str,
            help='Target app name (Required for single_app and pitr actions)'
        )
        parser.add_argument(
            '--backup-id',
            type=str,
            help='Specific BackupJob UUID to restore from'
        )
        parser.add_argument(
            '--timestamp',
            type=str,
            help='ISO 8601 timestamp string for full_system or pitr actions (e.g. 2026-08-21T10:00:00Z)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Bypass interactive confirmation prompt'
        )

    def handle(self, *args, **options):
        admin_email = options['admin_email']
        action = options['action']
        force = options['force']

        # 1. VALIDATE SUPER ADMIN AUTHORITY
        user = User.objects.filter(email=admin_email).first()
        if not user:
            raise CommandError(f"Super Admin validation failed: No user found with email '{admin_email}'.")
        if not (user.is_superuser or getattr(user, 'role', None) == 'super_admin'):
            raise CommandError(
                f"Access Denied: User '{admin_email}' is not a Super Admin. "
                "Restorations mutate full database state and require Super Admin privileges."
            )

        self.stdout.write(self.style.SUCCESS(f"✓ Super Admin authenticated: {user.email} (ID: {user.id})"))
        orchestrator = RestoreOrchestrator()

        # 2. INTERACTIVE CONFIRMATION SAFEGUARD
        if not force and action != 'validate':
            self.stdout.write(self.style.WARNING(
                "\n⚠️  CRITICAL WARNING: Restoration will overwrite existing database records!"
            ))
            self.stdout.write(self.style.WARNING(f"Action: {action.upper()} | Authorized By: {admin_email}"))
            confirm = input("Type 'YES' to proceed with restoration: ")
            if confirm.strip() != 'YES':
                self.stdout.write(self.style.NOTICE("Restoration cancelled by user."))
                return

        # 3. EXECUTE ACTION
        try:
            if action == 'single_app':
                app_name = options.get('app')
                if not app_name:
                    raise CommandError("--app parameter is required for 'single_app' restoration.")

                job_id = options.get('backup_id')
                if not job_id:
                    latest_job = BackupJob.objects.filter(
                        app__name=app_name,
                        status='completed'
                    ).order_by('-completed_at').first()
                    if not latest_job:
                        raise CommandError(f"No completed backup job found for app '{app_name}'.")
                    job_id = str(latest_job.id)

                self.stdout.write(f"Executing single app restore for '{app_name}' using backup job {job_id}...")
                result = orchestrator.restore_from_backup(
                    backup_job_id=job_id,
                    triggered_by=user.id,
                    triggered_by_role='super_admin'
                )
                self.stdout.write(self.style.SUCCESS(f"✓ Single app restoration succeeded: {result}"))

            elif action == 'full_system':
                ts_str = options.get('timestamp')
                if ts_str:
                    target_time = parse_datetime(ts_str)
                else:
                    target_time = timezone.now()

                self.stdout.write(f"Executing full system restore to timestamp: {target_time}...")
                result = orchestrator.full_system_restore(
                    backup_timestamp=target_time,
                    triggered_by=user.id,
                    triggered_by_role='super_admin'
                )
                self.stdout.write(self.style.SUCCESS(f"✓ Full system restoration completed: {result}"))

            elif action == 'pitr':
                app_name = options.get('app')
                ts_str = options.get('timestamp')
                if not app_name or not ts_str:
                    raise CommandError("Both --app and --timestamp parameters are required for 'pitr' action.")
                target_time = parse_datetime(ts_str)

                self.stdout.write(f"Executing Point-In-Time Restore for '{app_name}' at {target_time}...")
                result = orchestrator.pitr_restore(
                    app_name=app_name,
                    target_time=target_time,
                    triggered_by=user.id,
                    triggered_by_role='super_admin'
                )
                self.stdout.write(self.style.SUCCESS(f"✓ PITR completed: {result}"))

            elif action == 'validate':
                self.stdout.write("Running post-restoration health check validations...")
                validator = RestoreValidator()
                app_name = options.get('app')
                if app_name:
                    res = validator.validate_restore(app_name)
                    if res['valid']:
                        self.stdout.write(self.style.SUCCESS(f"✓ App '{app_name}' is healthy: {res['message']}"))
                    else:
                        self.stdout.write(self.style.ERROR(f"✗ App '{app_name}' health check failed: {res['message']}"))
                else:
                    res = validator.validate_all_restored()
                    if res['valid']:
                        self.stdout.write(self.style.SUCCESS("✓ All registered apps passed health validation!"))
                    else:
                        self.stdout.write(self.style.ERROR(f"✗ Health validation failed for some apps: {res['results']}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Restoration Action Failed: {str(e)}"))
            raise CommandError(f"Restoration failed: {str(e)}")
