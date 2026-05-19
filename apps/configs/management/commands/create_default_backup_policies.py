from django.core.management.base import BaseCommand
from apps.configs.models import RegisteredApp, BackupPolicy

class Command(BaseCommand):
    help = 'Create default backup policies for all registered apps'

    def handle(self, *args, **options):
        apps = RegisteredApp.objects.filter(is_registered=True)
        
        self.stdout.write(f'Creating backup policies for {apps.count()} apps...')
        
        for app in apps:
            policy, created = BackupPolicy.objects.get_or_create(
                app=app,
                defaults={
                    'backup_type': 'full',
                    'status': 'enabled',
                    'retention_days': app.backup_retention_days,
                    'encryption_enabled': True,
                    'compression_enabled': True,
                    'schedule_cron': '0 2 * * *',
                    'schedule_weekdays_only': True,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created policy for {app.name}'))
            else:
                self.stdout.write(f'  ○ Policy already exists for {app.name}')
        
        self.stdout.write(self.style.SUCCESS('\nBackup policies created successfully!'))