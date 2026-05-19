from django.utils import timezone
from datetime import timedelta
from django.core.management.base import BaseCommand
from apps.configs.models import BackupArtifact
from apps.configs.services.backup.backup_verification import BackupVerification

class Command(BaseCommand):
    help = 'Verify integrity of backups'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, help='Specific app (optional)')
        parser.add_argument('--days', type=int, default=7, help='Only verify backups from last N days')

    def handle(self, *args, **options):
        verifier = BackupVerification()
        
        artifacts = BackupArtifact.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=options['days']),
            status__in=['uploaded', 'verifying']
        )
        
        if options['app']:
            artifacts = artifacts.filter(backup_job__app__name=options['app'])
        
        self.stdout.write(f'Verifying {artifacts.count()} backups...')
        
        verified = 0
        failed = 0
        
        for artifact in artifacts:
            try:
                verifier.verify_and_update_status(artifact.id)
                verified += 1
                self.stdout.write(f'  ✓ {artifact.backup_job.app.name} - {artifact.created_at.date()}')
            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f'  ✗ {artifact.backup_job.app.name}: {str(e)[:50]}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nComplete: {verified} verified, {failed} failed'))