from django.core.management.base import BaseCommand
from apps.tenant.models import OrganizationDomain
from apps.tenant.services import DomainService


class Command(BaseCommand):
    help = 'Verify pending organization domains.'

    def add_arguments(self, parser):
        parser.add_argument('--domain-id', type=str, help='Verify specific domain')
        parser.add_argument('--org-id', type=str, help='Verify all domains for organization')
        parser.add_argument('--all-pending', action='store_true', help='Verify all pending domains')

    def handle(self, *args, **options):
        service = DomainService()
        if options.get('domain_id'):
            try:
                domain = OrganizationDomain.objects.get(id=options['domain_id'], is_deleted=False)
                result = service.verify_domain(domain.id)
                if result.status == 'ACTIVE':
                    self.stdout.write(self.style.SUCCESS(f'Domain verified: {domain.domain}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Domain verification failed: {domain.domain}'))
            except OrganizationDomain.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Domain {options["domain_id"]} not found'))
        elif options.get('org_id'):
            domains = OrganizationDomain.objects.filter(organization_id=options['org_id'], is_deleted=False)
            count = 0
            for domain in domains:
                result = service.verify_domain(domain.id)
                if result.status == 'ACTIVE':
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f'Verified: {domain.domain}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Failed: {domain.domain}'))
            self.stdout.write(self.style.SUCCESS(f'Verified {count}/{domains.count()} domains'))
        elif options.get('all_pending'):
            domains = OrganizationDomain.objects.filter(status='PENDING', is_deleted=False)
            count = 0
            for domain in domains:
                result = service.verify_domain(domain.id)
                if result.status == 'ACTIVE':
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f'Verified: {domain.domain}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Failed: {domain.domain}'))
            self.stdout.write(self.style.SUCCESS(f'Verified {count}/{domains.count()} domains'))
        else:
            self.stdout.write(self.style.WARNING('Please specify --domain-id, --org-id, or --all-pending'))