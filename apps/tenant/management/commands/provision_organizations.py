import traceback
from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization
from apps.tenant.services import ProvisioningService, OrganizationService
from apps.tenant.constants import OrganizationStatus


class Command(BaseCommand):
    help = 'Manage organization provisioning lifecycle (status, provision, retry, rollback)'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            nargs='?',
            default='provision',
            choices=['status', 'provision', 'retry', 'rollback'],
            help='Action to perform: status, provision, retry, rollback (default: provision)'
        )
        parser.add_argument(
            '--org-id',
            type=str,
            help='Target specific organization UUID'
        )
        parser.add_argument(
            '--all-pending',
            action='store_true',
            help='Target all PENDING organizations'
        )
        parser.add_argument(
            '--all-failed',
            action='store_true',
            help='Target all FAILED organizations for retry'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force action execution even if organization is provisioned'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options.get('org_id')
        all_pending = options.get('all_pending', False)
        all_failed = options.get('all_failed', False)
        force = options.get('force', False)

        prov_service = ProvisioningService()
        org_service = OrganizationService()

        if action == 'status':
            self.stdout.write("\nOrganization Provisioning Pipeline Health Status:")
            self.stdout.write("-" * 85)
            self.stdout.write(f"{'Organization Name':<30} {'Status':<15} {'Onboarded':<12} {'Step':<20} {'Progress'}")
            self.stdout.write("-" * 85)
            orgs = Organization.objects.filter(is_deleted=False).order_by('-created_at')
            if org_id:
                orgs = orgs.filter(id=org_id)
            for org in orgs:
                state = org.provisioning_state
                step = state.get('step_name', 'N/A')
                progress = f"{state.get('progress', 0)}%"
                status_style = self.style.SUCCESS if org.status == OrganizationStatus.ACTIVE else self.style.WARNING
                if org.status == OrganizationStatus.FAILED:
                    status_style = self.style.ERROR
                self.stdout.write(
                    f"{org.name:<30} [{status_style(org.status):<13}] {str(org.is_onboarded):<12} {step:<20} {progress}"
                )
            self.stdout.write("-" * 85)

        elif action == 'provision':
            if org_id:
                try:
                    org = Organization.objects.get(id=org_id, is_deleted=False)
                    if org.is_onboarded and not force:
                        self.stdout.write(self.style.WARNING(f"Organization '{org.name}' is already onboarded. Use --force to re-provision."))
                        return
                    self.stdout.write(f"Provisioning organization '{org.name}' ({org.id})...")
                    res = prov_service.provision_organization(org.id)
                    self.stdout.write(self.style.SUCCESS(f"Successfully provisioned organization '{res.name}'."))
                except Organization.DoesNotExist:
                    raise CommandError(f"Organization with ID '{org_id}' not found.")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Provisioning failed: {str(e)}"))

            elif all_pending:
                pending_orgs = list(Organization.objects.pending_provisioning())
                if not pending_orgs:
                    self.stdout.write(self.style.SUCCESS("No pending organizations found to provision."))
                    return
                self.stdout.write(f"Provisioning {len(pending_orgs)} pending organization(s)...")
                for org in pending_orgs:
                    try:
                        res = prov_service.provision_organization(org.id)
                        self.stdout.write(self.style.SUCCESS(f"  [OK] Provisioned '{res.name}'"))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"  [FAILED] '{org.name}': {str(e)}"))
            else:
                raise CommandError("Please specify --org-id <uuid> or --all-pending")

        elif action == 'retry':
            if org_id:
                try:
                    self.stdout.write(f"Retrying provisioning for organization ID '{org_id}'...")
                    org_service.retry_provisioning(org_id)
                    self.stdout.write(self.style.SUCCESS("Provisioning retry dispatched successfully."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Retry failed: {str(e)}"))
            elif all_failed:
                failed_orgs = list(Organization.objects.failed())
                if not failed_orgs:
                    self.stdout.write(self.style.SUCCESS("No failed organizations found to retry."))
                    return
                for org in failed_orgs:
                    try:
                        org_service.retry_provisioning(org.id)
                        self.stdout.write(self.style.SUCCESS(f"Dispatched provisioning retry for '{org.name}'"))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Failed to retry '{org.name}': {str(e)}"))
            else:
                raise CommandError("Please specify --org-id <uuid> or --all-failed for retry action.")

        elif action == 'rollback':
            if not org_id:
                raise CommandError("--org-id <uuid> is required for rollback action.")
            try:
                self.stdout.write(self.style.WARNING(f"Force rolling back provisioning for organization ID '{org_id}'..."))
                org_service.rollback_provisioning(org_id, reason="CLI manual rollback")
                self.stdout.write(self.style.SUCCESS(f"Successfully rolled back provisioning for '{org_id}'."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Rollback failed: {str(e)}"))