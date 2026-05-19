from django.core.management.base import BaseCommand
from apps.configs.services.disaster_recovery.failover import FailoverService

class Command(BaseCommand):
    help = 'Emergency failover to standby system'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, required=True, help='App name to failover')
        parser.add_argument('--force', action='store_true', help='Skip confirmation prompt')

    def handle(self, *args, **options):
        service = FailoverService()
        system_user_id = '00000000-0000-0000-0000-000000000000'
        
        self.stdout.write(self.style.ERROR(f'⚠️ EMERGENCY FAILOVER for {options["app"]}'))
        self.stdout.write('This will switch traffic to standby systems.')
        
        if not options['force']:
            confirm = input('Type "EMERGENCY" to continue: ')
            if confirm != 'EMERGENCY':
                self.stdout.write('Failover cancelled.')
                return
        
        try:
            result = service.execute(options['app'], system_user_id, 'system')
            self.stdout.write(self.style.SUCCESS(f'  ✓ Failover completed!'))
            self.stdout.write(f'  Standby endpoint: {result["standby_endpoint"]}')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failover failed: {e}'))