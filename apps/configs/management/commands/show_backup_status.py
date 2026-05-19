from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.configs.models import RegisteredApp, BackupJob

class Command(BaseCommand):
    help = 'Display current backup status for all apps'

    def handle(self, *args, **options):
        apps = RegisteredApp.objects.filter(is_registered=True)
        
        self.stdout.write('\n📊 Backup Status Report')
        self.stdout.write('=' * 60)
        
        for app in apps:
            last_backup = BackupJob.objects.filter(
                app=app,
                status='completed'
            ).order_by('-completed_at').first()
            
            last_failed = BackupJob.objects.filter(
                app=app,
                status='failed',
                started_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            # Format last backup time
            if last_backup:
                hours_ago = (timezone.now() - last_backup.completed_at).total_seconds() / 3600
                if hours_ago < 24:
                    time_str = f'{hours_ago:.1f} hours ago'
                else:
                    time_str = f'{hours_ago/24:.1f} days ago'
                status = self.style.SUCCESS(f'✓ Last backup: {time_str}')
            else:
                status = self.style.ERROR('✗ No backups found')
            
            self.stdout.write(f'\n{app.display_name} ({app.name})')
            self.stdout.write(f'  {status}')
            self.stdout.write(f'  Failed last 7 days: {last_failed}')
            self.stdout.write(f'  Retention: {app.backup_retention_days} days')
            self.stdout.write(f'  RTO: {app.rto_minutes} min | RPO: {app.rpo_minutes} min')
        
        self.stdout.write('\n' + '=' * 60)