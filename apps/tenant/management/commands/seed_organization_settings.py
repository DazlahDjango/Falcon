from django.core.management.base import BaseCommand
from apps.tenant.services import OrganizationSettingsService
from apps.tenant.services import ResourceService


class Command(BaseCommand):
    help = 'Seed organization platform system settings and optionally reconcile resource counts.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset settings to defaults')
        parser.add_argument('--sync-resources', action='store_true', help='Reconcile all organization resource counters')
        parser.add_argument('--org-id', type=str, help='Sync resources for specific organization only')

    def handle(self, *args, **options):
        if options['reset']:
            record = OrganizationSettingsService.reset_to_defaults()
            self.stdout.write(self.style.SUCCESS(f'Reset organization settings (v{record.version})'))
        else:
            record = OrganizationSettingsService.get_record()
            self.stdout.write(self.style.SUCCESS(f'Organization settings ready (v{record.version})'))

        if options['sync_resources']:
            service = ResourceService()
            if options.get('org_id'):
                result = service.sync_organization(options['org_id'])
                self.stdout.write(self.style.SUCCESS(f'Synced resources for organization {options["org_id"]}'))
            else:
                count = service.sync_all_organizations()
                self.stdout.write(self.style.SUCCESS(f'Synced resources for {count} organizations'))