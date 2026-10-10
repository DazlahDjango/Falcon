"""
Comprehensive Management Command for Falcon PMS Tenant Provisioning Pipeline.
Handles:
- Pipeline Execution: provision, provision-all-pending, retry, rollback
- Step-by-Step Execution: step (schema, migrations, seeding, resources, admin_user)
- Monitoring: status

Usage:
    python manage.py manage_provisioning status [--org-id <uuid>]
    python manage.py manage_provisioning provision --org-id <uuid>
    python manage.py manage_provisioning provision --name "New Org" --slug neworg --tier professional --email admin@neworg.com
    python manage.py manage_provisioning provision-all-pending
    python manage.py manage_provisioning retry --org-id <uuid> [--force]
    python manage.py manage_provisioning step --org-id <uuid> --step migrations
    python manage.py manage_provisioning rollback --org-id <uuid> [--force]
"""

import sys
import json
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.tenant.models import Organization
from apps.tenant.services import ProvisioningService, OrganizationService
from apps.tenant.constants import OrganizationStatus


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant Provisioning Pipeline and onboarding workflow.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- STATUS ----------------
        status_parser = subparsers.add_parser('status', help='View provisioning pipeline status')
        status_parser.add_argument('--org-id', '-i', type=str, help='Filter by Organization UUID')
        status_parser.add_argument('--json', action='store_true', help='Output status as JSON')

        # ---------------- PROVISION ----------------
        prov_parser = subparsers.add_parser('provision', help='Run full end-to-end provisioning pipeline')
        prov_parser.add_argument('--org-id', '-i', type=str, help='Target existing Organization UUID')
        prov_parser.add_argument('--name', '-n', type=str, help='New organization name')
        prov_parser.add_argument('--slug', type=str, help='New organization slug')
        prov_parser.add_argument('--tier', '-t', type=str, default='professional', choices=['free', 'basic', 'professional', 'enterprise'], help='Subscription tier')
        prov_parser.add_argument('--email', '-e', type=str, help='Contact and initial admin email')
        prov_parser.add_argument('--admin-first-name', type=str, default='Client', help='Admin first name')
        prov_parser.add_argument('--admin-last-name', type=str, default='Admin', help='Admin last name')
        prov_parser.add_argument('--admin-password', type=str, help='Admin password (auto-generated if omitted)')
        prov_parser.add_argument('--force', action='store_true', help='Force re-provisioning even if already onboarded')

        # ---------------- PROVISION ALL PENDING ----------------
        subparsers.add_parser('provision-all-pending', help='Provision all pending organizations in batch')

        # ---------------- RETRY ----------------
        retry_parser = subparsers.add_parser('retry', help='Retry failed provisioning')
        retry_parser.add_argument('--org-id', '-i', type=str, help='Target Organization UUID')
        retry_parser.add_argument('--all-failed', action='store_true', help='Retry all failed organizations')
        retry_parser.add_argument('--force', action='store_true', help='Force retry')

        # ---------------- STEP ----------------
        step_parser = subparsers.add_parser('step', help='Execute an individual provisioning step')
        step_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        step_parser.add_argument('--step', '-s', type=str, required=True, choices=['schema', 'migrations', 'seeding', 'resources', 'admin_user'], help='Step to execute')

        # ---------------- ROLLBACK ----------------
        rb_parser = subparsers.add_parser('rollback', help='Rollback provisioning state and schema')
        rb_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        rb_parser.add_argument('--force', action='store_true', help='Bypass confirmation prompt')

    def handle(self, *args, **options):
        action = options['action']
        handler = getattr(self, f"handle_{action.replace('-', '_')}", None)
        if not handler:
            raise CommandError(f"Action '{action}' is not implemented.")
        handler(options)

    # ---------------- HANDLERS ----------------

    def handle_status(self, options):
        org_id = options.get('org_id')
        as_json = options.get('json', False)

        orgs = Organization.objects.filter(is_deleted=False).order_by('-created_at')
        if org_id:
            orgs = orgs.filter(id=org_id)

        if as_json:
            data = [
                {
                    'id': str(o.id),
                    'name': o.name,
                    'slug': o.slug,
                    'status': o.status,
                    'is_onboarded': o.is_onboarded,
                    'provisioning_state': o.provisioning_state,
                    'created_at': o.created_at.isoformat() if o.created_at else None,
                }
                for o in orgs
            ]
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 105)
        self.stdout.write(self.style.SUCCESS(" ORGANIZATION PROVISIONING STATUS PIPELINE"))
        self.stdout.write("=" * 105)
        header = f"{'Organization Name':<30} {'Status':<14} {'Onboarded':<12} {'Step':<20} {'Progress':<10} {'Error'}"
        self.stdout.write(header)
        self.stdout.write("-" * 105)

        for org in orgs:
            state = org.provisioning_state or {}
            step = state.get('step_name', 'N/A')
            progress = f"{state.get('progress', 0)}%"
            error_msg = state.get('error', '')
            if error_msg and len(error_msg) > 15:
                error_msg = error_msg[:12] + "..."

            status_style = self.style.SUCCESS if org.status == OrganizationStatus.ACTIVE else (self.style.ERROR if org.status == OrganizationStatus.FAILED else self.style.WARNING)
            onboarded_str = self.style.SUCCESS("YES") if org.is_onboarded else self.style.WARNING("NO")

            self.stdout.write(
                f"{org.name[:28]:<30} [{status_style(org.status):<12}] {onboarded_str:<21} "
                f"{step[:18]:<20} {progress:<10} {error_msg}"
            )

        self.stdout.write("-" * 105 + "\n")

    def handle_provision(self, options):
        org_id = options.get('org_id')
        name = options.get('name')
        email = options.get('email')
        tier = options.get('tier', 'professional')
        force = options.get('force', False)
        prov_service = ProvisioningService()

        if not org_id and name and email:
            # Create organization first
            org_service = OrganizationService()
            slug = options.get('slug')
            self.stdout.write(f"Creating organization '{name}'...")
            org = org_service.create_organization({
                'name': name,
                'slug': slug,
                'contact_email': email,
                'subscription_tier': tier.lower()
            })
            org_id = str(org.id)
            self.stdout.write(self.style.SUCCESS(f"Created organization '{org.name}' ({org.id})."))
        elif not org_id:
            raise CommandError("Please specify either --org-id or (--name and --email).")

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        if org.is_onboarded and not force:
            self.stdout.write(self.style.WARNING(f"Organization '{org.name}' is already onboarded. Use --force to re-provision."))
            return

        self.stdout.write(f"Provisioning pipeline starting for '{org.name}' ({org.id})...")

        admin_data = None
        if email or options.get('admin_password'):
            admin_data = {
                'email': email or org.contact_email,
                'first_name': options.get('admin_first_name', 'Client'),
                'last_name': options.get('admin_last_name', 'Admin'),
            }
            if options.get('admin_password'):
                admin_data['password'] = options['admin_password']

        try:
            res = prov_service.provision_organization(org.id, admin_user_data=admin_data)
            self.stdout.write(self.style.SUCCESS(f"Successfully provisioned organization '{res.name}' (Status: {res.status})!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Provisioning failed: {str(e)}"))

    def handle_provision_all_pending(self, options):
        prov_service = ProvisioningService()
        pending_orgs = list(Organization.objects.pending_provisioning())
        if not pending_orgs:
            self.stdout.write(self.style.SUCCESS("No pending organizations found to provision."))
            return

        self.stdout.write(f"Found {len(pending_orgs)} pending organization(s). Running provisioning pipeline...")
        success_count = 0
        for org in pending_orgs:
            try:
                self.stdout.write(f"Provisioning '{org.name}' ({org.id})...")
                res = prov_service.provision_organization(org.id)
                self.stdout.write(self.style.SUCCESS(f"  [OK] Provisioned '{res.name}'"))
                success_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  [FAILED] '{org.name}': {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"\nBatch Provisioning Complete: {success_count}/{len(pending_orgs)} successful."))

    def handle_retry(self, options):
        org_id = options.get('org_id')
        all_failed = options.get('all_failed', False)
        force = options.get('force', False)
        prov_service = ProvisioningService()

        if all_failed:
            failed_orgs = list(Organization.objects.failed_provisioning())
            if not failed_orgs:
                self.stdout.write(self.style.SUCCESS("No failed organizations found to retry."))
                return
            self.stdout.write(f"Retrying {len(failed_orgs)} failed organization(s)...")
            for org in failed_orgs:
                try:
                    res = prov_service.retry_failed_provisioning(org.id, force=force)
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Retry succeeded for '{res.name}'"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  [FAILED] Retry failed for '{org.name}': {str(e)}"))
        elif org_id:
            try:
                res = prov_service.retry_failed_provisioning(org_id, force=force)
                self.stdout.write(self.style.SUCCESS(f"Retry succeeded for organization '{res.name}'!"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Retry failed: {str(e)}"))
        else:
            raise CommandError("Please specify --org-id or --all-failed.")

    def handle_step(self, options):
        org_id = options['org_id']
        step = options['step']
        prov_service = ProvisioningService()

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        self.stdout.write(f"Executing step '{step}' for '{org.name}' ({org.id})...")

        if step == 'schema':
            schema = prov_service.create_schema_step(org)
            self.stdout.write(self.style.SUCCESS(f"Schema step completed: {schema.schema_name}"))
        elif step == 'migrations':
            schema = org.schema
            if not schema:
                raise CommandError("Organization has no schema record. Run 'schema' step first.")
            prov_service.apply_migrations_step(org, schema)
            self.stdout.write(self.style.SUCCESS(f"Migrations step completed for schema '{schema.schema_name}'."))
        elif step == 'seeding':
            prov_service.seed_initial_data_step(org)
            self.stdout.write(self.style.SUCCESS("Seeding step completed (roles, rating scales)."))
        elif step == 'resources':
            prov_service.initialize_resources_step(org)
            self.stdout.write(self.style.SUCCESS("Resources step completed (default quotas)."))
        elif step == 'admin_user':
            admin_data = {'email': org.contact_email, 'first_name': 'Client', 'last_name': 'Admin'}
            user = prov_service.create_client_admin_user(org, admin_data)
            self.stdout.write(self.style.SUCCESS(f"Admin user step completed: {user.email}"))

    def handle_rollback(self, options):
        org_id = options['org_id']
        force = options.get('force', False)

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        if not force:
            confirm = input(f"Are you sure you want to ROLLBACK provisioning for '{org.name}' (schema will be dropped)? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write("Operation cancelled.")
                return

        prov_service = ProvisioningService()
        prov_service.rollback_provisioning(org.id)
        self.stdout.write(self.style.SUCCESS(f"Rolled back provisioning state for '{org.name}'."))
