import logging
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from apps.tenant.models import OrganizationDomain, Organization
from apps.tenant.services import DomainService

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Verify organization domains (with optional super-admin/user context).'

    def add_arguments(self, parser):
        parser.add_argument('--domain-id', type=str, help='Verify specific domain ID or domain name')
        parser.add_argument('--org-id', type=str, help='Verify all domains for organization ID')
        parser.add_argument('--all-pending', action='store_true', help='Verify all pending domains')
        parser.add_argument('--all-failed', action='store_true', help='Re-verify all failed domains')
        parser.add_argument('--user-id', type=str, help='User ID executing the domain verification')
        parser.add_argument('--user-email', type=str, default='admin@falcontech.com', help='User email executing the domain verification')
        parser.add_argument('--force', action='store_true', help='Force reset domain status to PENDING before verification')

    def handle(self, *args, **options):
        # 1. Resolve User Context (defaults to super_admin admin@falcontech.com)
        executor_user = None
        user_id = options.get('user_id')
        user_email = options.get('user_email')

        if user_id:
            executor_user = User.objects.filter(id=user_id, is_deleted=False).first()
            if not executor_user:
                self.stdout.write(self.style.WARNING(f"User ID '{user_id}' not found."))
        elif user_email:
            executor_user = User.objects.filter(email=user_email, is_deleted=False).first()

        if executor_user:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Executing context: User '{executor_user.email}' (Role: {getattr(executor_user, 'role', 'N/A')}, Tenant: {getattr(executor_user, 'tenant_id', 'N/A')})"
                )
            )
        else:
            self.stdout.write(self.style.WARNING("Running domain verification without active user context."))

        service = DomainService()

        # 2. Select domains to verify
        domains = []
        if options.get('domain_id'):
            target = options['domain_id']
            domain_obj = OrganizationDomain.objects.filter(is_deleted=False).filter(
                id=target if len(target) == 36 and '-' in target else None
            ).first() or OrganizationDomain.objects.filter(domain=target, is_deleted=False).first()

            if not domain_obj:
                raise CommandError(f"Domain '{target}' not found.")
            domains = [domain_obj]

        elif options.get('org_id'):
            domains = list(OrganizationDomain.objects.filter(organization_id=options['org_id'], is_deleted=False))
            if not domains:
                self.stdout.write(self.style.WARNING(f"No domains found for Organization ID: {options['org_id']}"))

        elif options.get('all_pending'):
            domains = list(OrganizationDomain.objects.filter(status='PENDING', is_deleted=False))

        elif options.get('all_failed'):
            domains = list(OrganizationDomain.objects.filter(status='FAILED', is_deleted=False))

        else:
            domains = list(OrganizationDomain.objects.filter(is_deleted=False))

        if not domains:
            self.stdout.write(self.style.WARNING("No matching domains found to verify."))
            return

        self.stdout.write(f"\nProcessing {len(domains)} domain(s)...")
        success_count = 0

        for domain in domains:
            # Force reset to PENDING if requested or if status is FAILED
            if options.get('force') or domain.status in ['FAILED', 'EXPIRED']:
                domain.status = 'PENDING'
                domain.verification_error = ''
                domain.save(update_fields=['status', 'verification_error'])
                self.stdout.write(f"  Reset domain '{domain.domain}' status to PENDING.")

            try:
                result = service.verify_domain(domain.id)
                if result.status == 'ACTIVE':
                    success_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  [SUCCESS] {domain.domain} -> Status: ACTIVE (Verified At: {result.verified_at})"))
                else:
                    self.stdout.write(self.style.WARNING(f"  [FAILED]  {domain.domain} -> Error: {result.verification_error}"))
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"  [ERROR]   {domain.domain} -> {exc}"))

        self.stdout.write(self.style.SUCCESS(f"\nCompleted: {success_count}/{len(domains)} domain(s) active."))