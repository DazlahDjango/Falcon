from django.core.management.base import BaseCommand
from apps.tenant.services import ResourceService


class Command(BaseCommand):
    help = 'Sync organization resource counters from live data.'

    def add_arguments(self, parser):
        parser.add_argument('--org-id', type=str, help='Sync specific organization only')
        parser.add_argument('--all', action='store_true', help='Sync all organizations')

    def handle(self, *args, **options):
        service = ResourceService()
        if options.get('org_id'):
            result = service.sync_organization(options['org_id'])
            self.stdout.write(self.style.SUCCESS(f'Synced resources for organization {options["org_id"]}'))
        elif options.get('all'):
            count = service.sync_all_organizations()
            self.stdout.write(self.style.SUCCESS(f'Synced resources for {count} organizations'))
        else:
            self.stdout.write(self.style.WARNING('Please specify --org-id or --all'))