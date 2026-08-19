from django.core.management.base import BaseCommand
from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator

class Command(BaseCommand):
    help = 'Manually trigger a backup for a specific app'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to backup')
        parser.add_argument('--type', type=str, default='full', choices=['full', 'incremental', 'differential'], help='Backup type')
        parser.add_argument('--force', action='store_true', help='Force backup even if permissions would normally block')
        parser.add_argument('--user-id', type=str, help='User ID to trigger backup as (optional)')

    def handle(self, *args, **options):
        orchestrator = BackupOrchestrator()
        
        # Use provided user ID or fallback to system
        if options['user_id']:
            user_id = options['user_id']
            role = 'super_admin'  # Assume admin if explicit user provided
        else:
            user_id = '00000000-0000-0000-0000-000000000000'
            role = 'system'
        
        self.stdout.write(f'Triggering {options["type"]} backup for {options["app"]}...')
        
        try:
            # Add force bypass option
            if options['force']:
                self.stdout.write(self.style.WARNING('  ⚠ Force mode enabled - bypassing permission checks'))
                # Option 1: Temporarily disable permissions
                from django.core.management import call_command
                # Or modify the orchestrator call
                job = orchestrator.trigger_backup(
                    app_name=options['app'],
                    backup_type=options['type'],
                    triggered_by=user_id,
                    triggered_by_role=role,
                    skip_permissions=True  # Add this parameter if supported
                )
            else:
                job = orchestrator.trigger_backup(
                    app_name=options['app'],
                    backup_type=options['type'],
                    triggered_by=user_id,
                    triggered_by_role=role
                )
            
            self.stdout.write(self.style.SUCCESS(f'  [+] Backup triggered! Job ID: {job.id}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [X] Failed: {e}'))
            self.stdout.write(self.style.WARNING('\nTry running with --force flag or provide a valid user-id:'))
            self.stdout.write(self.style.WARNING('  python manage.py trigger_backup --app configs --type full --force'))
            self.stdout.write(self.style.WARNING('  python manage.py trigger_backup --app configs --type full --user-id 1'))