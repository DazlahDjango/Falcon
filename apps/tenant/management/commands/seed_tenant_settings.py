from django.core.management.base import BaseCommand
from apps.tenant.services.settings import TenantSettingsService
from apps.tenant.services.monitoring.resource_sync import ResourceSyncService


class Command(BaseCommand):
    help = 'Seed tenant platform system settings and optionally reconcile resource counts.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset settings to defaults')
        parser.add_argument('--sync-resources', action='store_true', help='Reconcile all tenant resource counters')

    def handle(self, *args, **options):
        if options['reset']:
            record = TenantSettingsService.reset_to_defaults()
            self.stdout.write(self.style.SUCCESS(f'Reset tenant settings (v{record.version})'))
        else:
            record = TenantSettingsService.get_record()
            self.stdout.write(self.style.SUCCESS(f'Tenant settings ready (v{record.version})'))

        if options['sync_resources']:
            count = ResourceSyncService.sync_all_tenants()
            self.stdout.write(self.style.SUCCESS(f'Synced resources for {count} tenants'))
