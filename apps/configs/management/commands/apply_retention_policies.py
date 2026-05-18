from django.core.management.base import BaseCommand
from apps.configs.services.backup.backup_retention import BackupRetention

class Command(BaseCommand):
    help = 'Apply retention policies to clean up old backups'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, help='Specific app (optional)')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be deleted without actually deleting')

    def handle(self, *args, **options):
        retention = BackupRetention()
        
        self.stdout.write('Applying retention policies...')
        
        if options['dry_run']:
            self.stdout.write('DRY RUN MODE - No actual deletions')
            
        try:
            deleted = retention.apply_retention_policy(options.get('app'))
            
            if deleted > 0:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Deleted {deleted} old backups'))
            else:
                self.stdout.write('  ○ No backups to delete')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failed: {e}'))