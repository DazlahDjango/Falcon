from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization
from apps.tenant.services import OrganizationService, ResourceService
from apps.tenant.constants import OrganizationStatus


class Command(BaseCommand):
    help = 'Manage tenant organizations lifecycle and resource quotas (list, activate, suspend, archive, quota)'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['list', 'activate', 'suspend', 'archive', 'quota'],
            help='Action to perform: list, activate, suspend, archive, quota'
        )
        parser.add_argument(
            '--org-id',
            type=str,
            help='Organization UUID (required for activate/suspend/archive/quota)'
        )
        parser.add_argument(
            '--status',
            type=str,
            help='Filter list by status (ACTIVE, PENDING, SUSPENDED, FAILED, ARCHIVED)'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options.get('org_id')
        status_filter = options.get('status')

        service = OrganizationService()

        if action == 'list':
            qs = Organization.objects.filter(is_deleted=False).order_by('-created_at')
            if status_filter:
                qs = qs.filter(status=status_filter.upper())
            
            self.stdout.write(f"\nOrganization Summary ({qs.count()} total):")
            self.stdout.write("-" * 90)
            self.stdout.write(f"{'Name':<28} {'Slug':<22} {'Status':<12} {'Tier':<10} {'Email':<25}")
            self.stdout.write("-" * 90)
            for org in qs:
                status_style = self.style.SUCCESS if org.status == OrganizationStatus.ACTIVE else self.style.WARNING
                if org.status == OrganizationStatus.FAILED:
                    status_style = self.style.ERROR
                self.stdout.write(
                    f"{org.name:<28} {org.slug:<22} [{status_style(org.status):<10}] {org.subscription_tier:<10} {org.contact_email:<25}"
                )
            self.stdout.write("-" * 90)

        elif action == 'activate':
            if not org_id:
                raise CommandError("--org-id is required for activate action.")
            org = service.activate_organization(org_id)
            self.stdout.write(self.style.SUCCESS(f"Organization '{org.name}' ({org.id}) activated successfully."))

        elif action == 'suspend':
            if not org_id:
                raise CommandError("--org-id is required for suspend action.")
            org = service.suspend_organization(org_id)
            self.stdout.write(self.style.WARNING(f"Organization '{org.name}' ({org.id}) suspended successfully."))

        elif action == 'archive':
            if not org_id:
                raise CommandError("--org-id is required for archive action.")
            org = service.archive_organization(org_id)
            self.stdout.write(self.style.WARNING(f"Organization '{org.name}' ({org.id}) archived successfully."))

        elif action == 'quota':
            if not org_id:
                raise CommandError("--org-id is required for quota action.")
            org = service.get_organization(org_id)
            res_service = ResourceService()
            resources = res_service.get_all_usage(org.id)
            self.stdout.write(f"\nResource Quotas & Usage for '{org.name}' ({org.id}):")
            self.stdout.write("-" * 75)
            self.stdout.write(f"{'Resource Type':<25} {'Current':<10} {'Limit':<10} {'Usage %':<10} {'Status'}")
            self.stdout.write("-" * 75)
            for r in resources:
                status_str = "EXCEEDED" if r.is_exceeded else ("WARNING" if r.is_warning_level else "OK")
                status_style = self.style.ERROR if r.is_exceeded else (self.style.WARNING if r.is_warning_level else self.style.SUCCESS)
                self.stdout.write(
                    f"{r.resource_type:<25} {r.current_value:<10} {r.limit_value:<10} {r.percentage_used:.1f}%     [{status_style(status_str)}]"
                )
            self.stdout.write("-" * 75)
