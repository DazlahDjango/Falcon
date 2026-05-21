from django.core.management.base import BaseCommand
from apps.accounts.services.policy import AccountsPolicyService


class Command(BaseCommand):
    help = 'Seed or refresh persisted accounts system settings with canonical defaults'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset system policy to defaults')
        parser.add_argument('--sync-tenants', action='store_true', help='Also sync all tenant preferences')

    def handle(self, *args, **options):
        if options['reset']:
            record = AccountsPolicyService.reset_system_policy()
            self.stdout.write(self.style.WARNING(f'System policy reset (v{record.version})'))
        else:
            record = AccountsPolicyService.get_system_record()
            AccountsPolicyService.get_system_policy(use_cache=False)
            self.stdout.write(self.style.SUCCESS(f'System policy ready (v{record.version})'))
        if options['sync_tenants']:
            synced = AccountsPolicyService.sync_all_tenants()
            self.stdout.write(self.style.SUCCESS(f'Synced {len(synced)} tenant(s)'))
