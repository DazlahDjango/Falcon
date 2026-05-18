from django.core.management.base import BaseCommand
from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator

class Command(BaseCommand):
    help = 'Manually trigger a backup for a specific app'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to backup')
        parser.add_argument('--type', type=str, default='full', choices=['full', 'incremental', 'differential'], help='Backup type')

    def handle(self, *args, **options):
        orchestrator = BackupOrchestrator()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        
        self.stdout.write(f'Triggering {options["type"]} backup for {options["app"]}...')
        
        try:
            job = orchestrator.trigger_backup(
                app_name=options['app'],
                backup_type=options['type'],
                triggered_by=system_user_id,
                triggered_by_role='system'
            )
            self.stdout.write(self.style.SUCCESS(f'  ✓ Backup triggered! Job ID: {job.id}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failed: {e}'))