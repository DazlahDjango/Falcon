from django.core.management.base import BaseCommand
from apps.accounts.services.policy import AccountsPolicyService


class Command(BaseCommand):
    help = 'Sync tenant security preferences from canonical accounts policy defaults'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Sync a single tenant client_id (UUID)',
        )

    def handle(self, *args, **options):
        tenant_id = options.get('tenant_id')
        AccountsPolicyService.get_system_record()
        if tenant_id:
            pref = AccountsPolicyService.sync_tenant(tenant_id)
            self.stdout.write(self.style.SUCCESS(
                f'Synced tenant {tenant_id} (policy v{pref.policy_version})',
            ))
        else:
            synced = AccountsPolicyService.sync_all_tenants()
            self.stdout.write(self.style.SUCCESS(
                f'Synced {len(synced)} tenant(s) from system policy',
            ))
