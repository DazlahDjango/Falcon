from django.core.management.base import BaseCommand
from apps.configs.models import BackupArtifact
from apps.configs.services.backup.backup_storage import BackupStorage

class Command(BaseCommand):
    help = 'Clean up orphaned backup artifacts'

    def handle(self, *args, **options):
        storage = BackupStorage()
        
        # Find artifacts with missing backup jobs
        orphans = BackupArtifact.objects.filter(backup_job__isnull=True)
        
        self.stdout.write(f'Found {orphans.count()} orphaned artifacts')
        
        deleted = 0
        for artifact in orphans:
            try:
                storage.delete(artifact.storage_path)
                artifact.delete()
                deleted += 1
                self.stdout.write(f'  ✓ Deleted orphan: {artifact.storage_path}')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Failed: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nDeleted {deleted} orphaned artifacts'))