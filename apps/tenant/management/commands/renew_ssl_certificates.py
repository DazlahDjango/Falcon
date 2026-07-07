from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.tenant.models import OrganizationDomain
from apps.tenant.services import DomainService


class Command(BaseCommand):
    help = 'Renew expiring SSL certificates.'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=30, help='Renew certificates expiring within N days (default: 30)')
        parser.add_argument('--domain-id', type=str, help='Renew specific domain')
        parser.add_argument('--org-id', type=str, help='Renew all domains for organization')

    def handle(self, *args, **options):
        service = DomainService()
        days = options.get('days', 30)
        if options.get('domain_id'):
            try:
                domain = OrganizationDomain.objects.get(id=options['domain_id'], is_deleted=False)
                if domain.status != 'ACTIVE':
                    self.stdout.write(self.style.WARNING(f'Domain {domain.domain} is not active'))
                    return
                result = service.renew_ssl(domain.id)
                self.stdout.write(self.style.SUCCESS(f'Renewed SSL for: {domain.domain} (expires: {result.ssl_expires_at})'))
            except OrganizationDomain.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Domain {options["domain_id"]} not found'))
        elif options.get('org_id'):
            domains = OrganizationDomain.objects.filter(organization_id=options['org_id'], status='ACTIVE', is_deleted=False)
            cutoff = timezone.now() + timezone.timedelta(days=days)
            expiring = domains.filter(ssl_expires_at__lte=cutoff, ssl_expires_at__gt=timezone.now())
            count = 0
            for domain in expiring:
                result = service.renew_ssl(domain.id)
                count += 1
                self.stdout.write(self.style.SUCCESS(f'Renewed: {domain.domain}'))
            self.stdout.write(self.style.SUCCESS(f'Renewed {count} certificates'))
        else:
            domains = OrganizationDomain.objects.filter(status='ACTIVE', is_deleted=False)
            cutoff = timezone.now() + timezone.timedelta(days=days)
            expiring = domains.filter(ssl_expires_at__lte=cutoff, ssl_expires_at__gt=timezone.now())
            count = 0
            for domain in expiring:
                result = service.renew_ssl(domain.id)
                count += 1
                self.stdout.write(self.style.SUCCESS(f'Renewed: {domain.domain}'))
            self.stdout.write(self.style.SUCCESS(f'Renewed {count} certificates'))