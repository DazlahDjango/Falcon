from django.core.management.base import BaseCommand, CommandError
from apps.accounts.models import User
from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator

class Command(BaseCommand):
    help = 'Manually trigger a backup for a specific app'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to backup')
        parser.add_argument('--type', type=str, default='full', choices=['full', 'incremental', 'differential', 'synthetic', 'cdp'], help='Backup type')
        parser.add_argument('--admin-email', type=str, help='Email of user triggering backup')
        parser.add_argument('--user-id', type=str, help='User ID triggering backup (optional)')

    def handle(self, *args, **options):
        orchestrator = BackupOrchestrator()
        
        user_id = '00000000-0000-0000-0000-000000000000'
        role = 'system'
        tenant_id = None

        if options.get('admin_email'):
            user = User.objects.filter(email=options['admin_email']).first()
            if not user:
                raise CommandError(f"User with email '{options['admin_email']}' not found.")
            user_id = str(user.id)
            role = getattr(user, 'role', 'super_admin')
            tenant_id = getattr(user, 'tenant_id', None)
        elif options.get('user_id'):
            user_id = options['user_id']
            role = 'super_admin'

        self.stdout.write(f'Triggering {options["type"]} backup for app \'{options["app"]}\' as role \'{role}\'...')
        
        try:
            job = orchestrator.trigger_backup(
                app_name=options['app'],
                backup_type=options['type'],
                triggered_by=user_id,
                triggered_by_role=role,
                tenant_id=tenant_id
            )
            
            self.stdout.write(self.style.SUCCESS(f'  ✓ Backup triggered successfully! Job ID: {job.id} (Status: {job.status})'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failed to trigger backup: {e}'))
            raise CommandError(f"Backup trigger failed: {e}")