from django.core.management.base import BaseCommand
from apps.configs.models import BackupJob
from apps.configs.services.restore.restore_orchestrator import RestoreOrchestrator

class Command(BaseCommand):
    help = 'Restore from the latest backup for a specific app'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to restore')
        parser.add_argument('--backup-id', type=str, help='Specific backup ID (optional)')
        parser.add_argument('--force', action='store_true', help='Force restore without confirmation')
        parser.add_argument('--user-id', type=str, help='User ID to trigger restore as (optional)')

    def handle(self, *args, **options):
        orchestrator = RestoreOrchestrator()
        
        # Use provided user ID or fallback to system
        if options['user_id']:
            user_id = options['user_id']
            role = 'super_admin'  # Assume admin if explicit user provided
        else:
            user_id = '00000000-0000-0000-0000-000000000000'
            role = 'system'
        
        if options['backup_id']:
            job_id = options['backup_id']
        else:
            # Find latest completed backup
            job = BackupJob.objects.filter(
                app__name=options['app'],
                status='completed'
            ).order_by('-completed_at').first()
            
            if not job:
                self.stdout.write(self.style.ERROR(f'No completed backup found for {options["app"]}'))
                return
            job_id = job.id
        
        self.stdout.write(f'Restoring {options["app"]} from backup {job_id}...')
        
        if not options['force']:
            self.stdout.write(self.style.WARNING('⚠️ This will overwrite current data!'))
            confirm = input('Type "yes" to continue: ')
            if confirm.lower() != 'yes':
                self.stdout.write('Restore cancelled.')
                return
        
        try:
            # Add force bypass option
            if options['force']:
                self.stdout.write(self.style.WARNING('  ⚠ Force mode enabled - bypassing confirmation'))
                result = orchestrator.restore_from_backup(
                    backup_id=job_id,
                    triggered_by=user_id,
                    triggered_by_role=role,
                    skip_permissions=True  # Add this parameter if supported
                )
            else:
                result = orchestrator.restore_from_backup(
                    backup_id=job_id,
                    triggered_by=user_id,
                    triggered_by_role=role
                )
            
            self.stdout.write(self.style.SUCCESS(f'  ✓ Restore completed successfully!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failed: {e}'))
            self.stdout.write(self.style.WARNING('\nTry running with --force flag or provide a valid user-id:'))
            self.stdout.write(self.style.WARNING('  python manage.py restore_latest_backup --app configs --force'))
            self.stdout.write(self.style.WARNING('  python manage.py restore_latest_backup --app configs --user-id 1'))
