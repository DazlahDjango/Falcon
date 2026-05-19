from django.core.management.base import BaseCommand
from apps.configs.models import BackupJob
from apps.configs.services.restore.restore_orchestrator import RestoreOrchestrator

class Command(BaseCommand):
    help = 'Restore from the latest backup for a specific app'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to restore')
        parser.add_argument('--backup-id', type=str, help='Specific backup ID (optional)')

    def handle(self, *args, **options):
        orchestrator = RestoreOrchestrator()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        
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
        self.stdout.write(self.style.WARNING('⚠️ This will overwrite current data!'))
        
        confirm = input('Type "yes" to continue: ')
        if confirm.lower() != 'yes':
            self.stdout.write('Restore cancelled.')
            return
        
        try:
            result = orchestrator.restore_from_backup(job_id, system_user_id, 'system')
            self.stdout.write(self.style.SUCCESS(f'  ✓ Restore completed successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Restore failed: {e}'))