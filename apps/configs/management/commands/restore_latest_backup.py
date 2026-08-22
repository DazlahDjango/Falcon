from django.core.management.base import BaseCommand, CommandError
from apps.accounts.models import User
from apps.configs.models import BackupJob
from apps.configs.services.restore.restore_orchestrator import RestoreOrchestrator

class Command(BaseCommand):
    help = 'Restore from the latest backup for a specific app'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to restore')
        parser.add_argument('--admin-email', type=str, help='Super Admin email authorizing restore (optional)')
        parser.add_argument('--backup-id', type=str, help='Specific backup ID (optional)')
        parser.add_argument('--force', action='store_true', help='Force restore without confirmation prompt')

    def handle(self, *args, **options):
        orchestrator = RestoreOrchestrator()
        
        user_id = '00000000-0000-0000-0000-000000000000'
        role = 'super_admin'

        if options.get('admin_email'):
            user = User.objects.filter(email=options['admin_email']).first()
            if not user:
                raise CommandError(f"User with email '{options['admin_email']}' not found.")
            user_id = str(user.id)
            role = getattr(user, 'role', 'super_admin')

        if options.get('backup_id'):
            job_id = options['backup_id']
        else:
            job = BackupJob.objects.filter(
                app__name=options['app'],
                status='completed'
            ).order_by('-completed_at').first()
            
            if not job:
                raise CommandError(f"No completed backup found for app '{options['app']}'")
            job_id = str(job.id)
        
        self.stdout.write(f'Restoring \'{options["app"]}\' from backup job {job_id}...')
        
        if not options['force']:
            self.stdout.write(self.style.WARNING('⚠️  WARNING: Restoring will overwrite existing application data!'))
            confirm = input('Type "YES" to continue: ')
            if confirm.strip() != 'YES':
                self.stdout.write('Restore cancelled.')
                return
        
        try:
            result = orchestrator.restore_from_backup(
                backup_job_id=job_id,
                triggered_by=user_id,
                triggered_by_role=role
            )
            
            self.stdout.write(self.style.SUCCESS(f'  ✓ Restore completed successfully! Result: {result}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Restoration failed: {e}'))
            raise CommandError(f"Restoration failed: {e}")
