from django.core.management.base import BaseCommand
from django.db import transaction
from apps.tenant.models import Organization
from apps.tenant.services import ProvisioningService
from apps.tenant.constants import OrganizationStatus


class Command(BaseCommand):
    help = 'Provision pending organizations.'

    def add_arguments(self, parser):
        parser.add_argument('--org-id', type=str, help='Provision specific organization only')
        parser.add_argument('--all-pending', action='store_true', help='Provision all pending organizations')
        parser.add_argument('--force', action='store_true', help='Force provision even if already provisioned')

    def handle(self, *args, **options):
        service = ProvisioningService()
        if options.get('org_id'):
            try:
                org = Organization.objects.get(id=options['org_id'], is_deleted=False)
                if org.is_onboarded and not options.get('force'):
                    self.stdout.write(self.style.WARNING(f'Organization {org.name} already onboarded. Use --force to reprovision.'))
                    return
                with transaction.atomic():
                    result = service.provision_organization(org.id)
                self.stdout.write(self.style.SUCCESS(f'Provisioned organization: {org.name}'))
            except Organization.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Organization {options["org_id"]} not found'))
        elif options.get('all_pending'):
            orgs = Organization.objects.pending_provisioning()
            count = 0
            for org in orgs:
                try:
                    with transaction.atomic():
                        service.provision_organization(org.id)
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f'Provisioned: {org.name}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Failed to provision {org.name}: {str(e)}'))
            self.stdout.write(self.style.SUCCESS(f'Provisioned {count} organizations'))
        else:
            self.stdout.write(self.style.WARNING('Please specify --org-id or --all-pending'))