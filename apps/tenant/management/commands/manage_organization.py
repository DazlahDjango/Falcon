"""
Comprehensive Management Command for Falcon PMS Tenant Organizations.
Handles:
- Organization Lifecycle: list, info, create, update, activate, suspend, archive, restore, delete
- Tier Management: switch-tier, sync-resources
- Statistics & Health: stats, summary

Usage:
    python manage.py manage_organization list --status ACTIVE
    python manage.py manage_organization info --slug globalapex
    python manage.py manage_organization info --org-id <uuid>
    python manage.py manage_organization create --name "Acme Corp" --slug acme --tier professional --email admin@acme.com
    python manage.py manage_organization update --org-id <uuid> --tier enterprise
    python manage.py manage_organization activate --org-id <uuid>
    python manage.py manage_organization suspend --org-id <uuid> --reason "Billing past due"
    python manage.py manage_organization archive --org-id <uuid>
    python manage.py manage_organization restore --org-id <uuid>
    python manage.py manage_organization delete --org-id <uuid> [--hard]
    python manage.py manage_organization switch-tier --org-id <uuid> --tier enterprise --sync-resources
    python manage.py manage_organization stats [--org-id <uuid>] [--json]
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
from django.db.models import Q

from apps.tenant.models import Organization, OrganizationSector, OrganizationDomain, OrganizationSchema
from apps.tenant.services import OrganizationService, ResourceService, HealthCheckService
from apps.tenant.services.stats_service import OrganizationStatsService
from apps.tenant.constants import OrganizationStatus, SubscriptionTier
from apps.tenant.exceptions import OrganizationException
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant Organization operations.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List organizations with filters')
        list_parser.add_argument('--status', '-s', type=str, help='Filter by status (e.g. ACTIVE, PENDING, SUSPENDED, ARCHIVED, FAILED)')
        list_parser.add_argument('--tier', '-t', type=str, choices=['free', 'basic', 'professional', 'enterprise'], help='Filter by subscription tier')
        list_parser.add_argument('--sector', type=str, help='Filter by sector code or name')
        list_parser.add_argument('--search', '-q', type=str, help='Search term (name, slug, email)')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Maximum rows to show (default: 50)')
        list_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', help='Display detailed profile of a single organization')
        info_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        info_parser.add_argument('--slug', type=str, help='Organization Slug')
        info_parser.add_argument('--name', type=str, help='Organization Name')
        info_parser.add_argument('--email', '-e', type=str, help='Contact Email')
        info_parser.add_argument('--json', action='store_true', help='Output details as JSON')

        # ---------------- CREATE ----------------
        create_parser = subparsers.add_parser('create', help='Create a new organization')
        create_parser.add_argument('--name', '-n', type=str, required=True, help='Organization name')
        create_parser.add_argument('--slug', type=str, help='Unique slug (auto-generated if omitted)')
        create_parser.add_argument('--email', '-e', type=str, required=True, help='Primary contact email')
        create_parser.add_argument('--tier', '-t', type=str, default='professional', choices=['free', 'basic', 'professional', 'enterprise'], help='Subscription tier')
        create_parser.add_argument('--phone', type=str, default='', help='Contact phone')
        create_parser.add_argument('--sector', type=str, help='Sector code (e.g. CORP, NGO, GOV, CONS)')
        create_parser.add_argument('--max-users', type=int, help='Custom max users limit')
        create_parser.add_argument('--max-storage-mb', type=int, help='Custom max storage in MB')
        create_parser.add_argument('--auto-provision', action='store_true', help='Immediately initiate provisioning pipeline')

        # ---------------- UPDATE ----------------
        update_parser = subparsers.add_parser('update', help='Update organization properties')
        update_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        update_parser.add_argument('--name', '-n', type=str, help='New organization name')
        update_parser.add_argument('--email', '-e', type=str, help='New contact email')
        update_parser.add_argument('--phone', type=str, help='New contact phone')
        update_parser.add_argument('--tier', '-t', type=str, choices=['free', 'basic', 'professional', 'enterprise'], help='New subscription tier')
        update_parser.add_argument('--sector', type=str, help='Sector code')

        # ---------------- ACTIVATE / SUSPEND / ARCHIVE / RESTORE ----------------
        act_parser = subparsers.add_parser('activate', help='Activate an organization')
        act_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        sus_parser = subparsers.add_parser('suspend', help='Suspend an organization')
        sus_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        sus_parser.add_argument('--reason', '-r', type=str, default='Administrative suspension', help='Reason for suspension')

        arc_parser = subparsers.add_parser('archive', help='Archive an organization')
        arc_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        res_parser = subparsers.add_parser('restore', help='Restore an archived/suspended/soft-deleted organization')
        res_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        # ---------------- DELETE ----------------
        del_parser = subparsers.add_parser('delete', help='Delete an organization')
        del_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        del_parser.add_argument('--hard', action='store_true', help='Perform irreversible hard-deletion')
        del_parser.add_argument('--force', action='store_true', help='Bypass confirmation prompt')

        # ---------------- SWITCH TIER ----------------
        tier_parser = subparsers.add_parser('switch-tier', help='Switch subscription tier and optionally sync resource limits')
        tier_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        tier_parser.add_argument('--tier', '-t', type=str, required=True, choices=['free', 'basic', 'professional', 'enterprise'], help='Target subscription tier')
        tier_parser.add_argument('--sync-resources', action='store_true', default=True, help='Automatically sync resource quotas with tier limits')

        # ---------------- STATS ----------------
        stats_parser = subparsers.add_parser('stats', help='Display organization or platform statistics')
        stats_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID (if omitted, shows global platform stats)')
        stats_parser.add_argument('--json', action='store_true', help='Output stats as JSON')

    def handle(self, *args, **options):
        action = options['action']
        handler = getattr(self, f"handle_{action.replace('-', '_')}", None)
        if not handler:
            self.stdout.write(self.style.ERROR(f"Action '{action}' is not implemented."))
            return
        try:
            handler(options)
        except CommandError as e:
            self.stdout.write(self.style.ERROR(str(e)))
        except OrganizationException as e:
            self.stdout.write(self.style.ERROR(f"Organization Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    def _resolve_org(self, options) -> Organization:
        org_id = options.get('org_id')
        slug = options.get('slug')
        name = options.get('name')
        email = options.get('email')

        qs = Organization.objects.all_with_deleted()
        if org_id:
            try:
                return qs.get(id=org_id)
            except Organization.DoesNotExist:
                raise CommandError(f"Organization with ID '{org_id}' does not exist.")
        elif slug:
            try:
                return qs.get(slug=slug)
            except Organization.DoesNotExist:
                raise CommandError(f"Organization with slug '{slug}' does not exist.")
        elif name:
            org = qs.filter(name__iexact=name).first()
            if not org:
                raise CommandError(f"Organization with name '{name}' does not exist.")
            return org
        elif email:
            org = qs.filter(contact_email__iexact=email).first()
            if not org:
                raise CommandError(f"Organization with email '{email}' does not exist.")
            return org
        else:
            raise CommandError("Please specify --org-id, --slug, --name, or --email.")

    # ---------------- HANDLER IMPLEMENTATIONS ----------------

    def handle_list(self, options):
        status_filter = options.get('status')
        tier_filter = options.get('tier')
        sector_filter = options.get('sector')
        search_query = options.get('search')
        limit = options.get('limit', 50)
        as_json = options.get('json', False)

        qs = Organization.objects.filter(is_deleted=False).select_related('sector', 'schema').order_by('-created_at')

        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        if tier_filter:
            qs = qs.filter(subscription_tier=tier_filter.lower())
        if sector_filter:
            qs = qs.filter(Q(sector__code__iexact=sector_filter) | Q(sector__name__icontains=sector_filter))
        if search_query:
            qs = qs.filter(
                Q(name__icontains=search_query) |
                Q(slug__icontains=search_query) |
                Q(contact_email__icontains=search_query)
            )

        total_count = qs.count()
        orgs = list(qs[:limit])

        if as_json:
            data = [
                {
                    'id': str(o.id),
                    'name': o.name,
                    'slug': o.slug,
                    'status': o.status,
                    'is_active': o.is_active,
                    'is_onboarded': o.is_onboarded,
                    'subscription_tier': o.subscription_tier,
                    'contact_email': o.contact_email,
                    'schema_name': o.schema_name,
                    'sector': o.sector.code if o.sector else None,
                    'created_at': o.created_at.isoformat() if o.created_at else None,
                }
                for o in orgs
            ]
            self.stdout.write(json.dumps({'total': total_count, 'results': data}, indent=2))
            return

        total_width = 155
        self.stdout.write("\n" + "=" * total_width)
        self.stdout.write(self.style.SUCCESS(f" FALCON TENANT ORGANIZATIONS ({len(orgs)} of {total_count} total)"))
        self.stdout.write("=" * total_width)
        header = f"{'Org ID (Tenant ID)':<38} {'Name':<24} {'Slug':<18} {'Status':<12} {'Tier':<14} {'Schema':<22} {'Sector':<8} {'Email'}"
        self.stdout.write(header)
        self.stdout.write("-" * total_width)

        for org in orgs:
            raw_status = f"[{org.status}]"
            if org.status == OrganizationStatus.ACTIVE:
                status_str = self.style.SUCCESS(f"{raw_status:<12}")
            elif org.status in [OrganizationStatus.SUSPENDED, OrganizationStatus.ARCHIVED]:
                status_str = self.style.WARNING(f"{raw_status:<12}")
            elif org.status == OrganizationStatus.FAILED:
                status_str = self.style.ERROR(f"{raw_status:<12}")
            else:
                status_str = self.style.NOTICE(f"{raw_status:<12}")

            sector_code = org.sector.code if org.sector else "-"
            self.stdout.write(
                f"{str(org.id):<38} {org.name[:23]:<24} {org.slug[:17]:<18} {status_str} "
                f"{org.subscription_tier:<14} {org.schema_name[:21]:<22} {sector_code:<8} {org.contact_email}"
            )

        self.stdout.write("-" * total_width + "\n")

    def handle_info(self, options):
        org = self._resolve_org(options)
        as_json = options.get('json', False)

        users_count = User.objects.filter(tenant_id=org.id, is_active=True).count()
        domains = list(OrganizationDomain.objects.filter(organization=org, is_deleted=False))
        resources = ResourceService().get_all_usage(org.id)

        if as_json:
            data = {
                'id': str(org.id),
                'name': org.name,
                'slug': org.slug,
                'status': org.status,
                'is_active': org.is_active,
                'is_onboarded': org.is_onboarded,
                'subscription_tier': org.subscription_tier,
                'contact_email': org.contact_email,
                'contact_phone': org.contact_phone,
                'schema_name': org.schema_name,
                'sector': org.sector.name if org.sector else None,
                'max_users': org.max_users,
                'max_storage_mb': org.max_storage_mb,
                'users_count': users_count,
                'domains': [{'domain': d.domain, 'is_primary': d.is_primary, 'status': d.status} for d in domains],
                'resources': [
                    {
                        'type': r.resource_type,
                        'current': r.current_value,
                        'limit': r.limit_value,
                        'percentage': r.percentage_used,
                        'is_exceeded': r.is_exceeded
                    }
                    for r in resources
                ],
                'created_at': org.created_at.isoformat() if org.created_at else None,
                'updated_at': org.updated_at.isoformat() if org.updated_at else None,
            }
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS(f" ORGANIZATION PROFILE: {org.name} ({org.slug})"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"  Organization ID:   {org.id}")
        self.stdout.write(f"  Status:            {org.status} (Active: {org.is_active}, Onboarded: {org.is_onboarded})")
        self.stdout.write(f"  Subscription Tier: {org.subscription_tier.upper()}")
        self.stdout.write(f"  Schema Name:       {org.schema_name}")
        self.stdout.write(f"  Sector:            {org.sector.name if org.sector else 'None'}")
        self.stdout.write(f"  Contact Email:     {org.contact_email}")
        self.stdout.write(f"  Contact Phone:     {org.contact_phone or 'N/A'}")
        self.stdout.write(f"  Total Active Users:{users_count}")
        self.stdout.write(f"  Created At:        {org.created_at}")

        self.stdout.write("\n  Configured Domains:")
        if not domains:
            self.stdout.write("    (No domains configured)")
        for d in domains:
            primary_tag = " [PRIMARY]" if d.is_primary else ""
            self.stdout.write(f"    - {d.domain} ({d.status}){primary_tag}")

        self.stdout.write("\n  Resource Quotas & Utilization:")
        if not resources:
            self.stdout.write("    (No resource records tracked)")
        else:
            self.stdout.write(f"    {'Resource Type':<25} {'Current':<10} {'Limit':<10} {'Usage %':<10} {'Status'}")
            self.stdout.write("    " + "-" * 65)
            for r in resources:
                status_str = "EXCEEDED" if r.is_exceeded else ("WARNING" if r.is_warning_level else "OK")
                status_style = self.style.ERROR if r.is_exceeded else (self.style.WARNING if r.is_warning_level else self.style.SUCCESS)
                self.stdout.write(
                    f"    {r.resource_type:<25} {r.current_value:<10} {r.limit_value:<10} {r.percentage_used:.1f}%     [{status_style(status_str)}]"
                )

        self.stdout.write("=" * 80 + "\n")

    def handle_create(self, options):
        name = options['name']
        slug = options.get('slug')
        email = options['email']
        tier = options.get('tier', 'professional')
        phone = options.get('phone', '')
        sector_code = options.get('sector')
        max_users = options.get('max_users')
        max_storage_mb = options.get('max_storage_mb')
        auto_provision = options.get('auto_provision', False)

        service = OrganizationService()
        sector_id = None
        if sector_code:
            sector = OrganizationSector.objects.filter(code__iexact=sector_code).first()
            if not sector:
                raise CommandError(f"Sector with code '{sector_code}' not found.")
            sector_id = sector.id

        org_data = {
            'name': name,
            'contact_email': email,
            'subscription_tier': tier.lower(),
            'contact_phone': phone,
        }
        if slug:
            org_data['slug'] = slug
        if sector_id:
            org_data['sector_id'] = sector_id
        if max_users:
            org_data['max_users'] = max_users
        if max_storage_mb:
            org_data['max_storage_mb'] = max_storage_mb

        self.stdout.write(f"Creating organization '{name}'...")
        try:
            org = service.create_organization(org_data)
            self.stdout.write(self.style.SUCCESS(f"Organization created successfully: {org.name} (ID: {org.id}, Slug: {org.slug})"))

            if auto_provision:
                from apps.tenant.services import ProvisioningService
                self.stdout.write(f"Auto-provisioning pipeline initiated for '{org.name}'...")
                prov_res = ProvisioningService().provision_organization(org.id)
                self.stdout.write(self.style.SUCCESS(f"Organization '{prov_res.name}' fully provisioned and ready!"))
        except Exception as e:
            raise CommandError(f"Failed to create organization: {str(e)}")

    def handle_update(self, options):
        org = self._resolve_org(options)
        service = OrganizationService()

        update_data = {}
        for field in ['name', 'email', 'phone', 'tier']:
            if options.get(field):
                if field == 'email':
                    update_data['contact_email'] = options['email']
                elif field == 'phone':
                    update_data['contact_phone'] = options['phone']
                elif field == 'tier':
                    update_data['subscription_tier'] = options['tier'].lower()
                else:
                    update_data[field] = options[field]

        if options.get('sector'):
            sec = OrganizationSector.objects.filter(code__iexact=options['sector']).first()
            if not sec:
                raise CommandError(f"Sector '{options['sector']}' not found.")
            update_data['sector_id'] = sec.id

        if not update_data:
            self.stdout.write(self.style.WARNING("No update parameters specified."))
            return

        updated_org = service.update_organization(org.id, update_data)
        self.stdout.write(self.style.SUCCESS(f"Organization '{updated_org.name}' ({updated_org.id}) updated successfully."))

    def handle_activate(self, options):
        org = self._resolve_org(options)
        service = OrganizationService()
        res = service.activate_organization(org.id)
        self.stdout.write(self.style.SUCCESS(f"Organization '{res.name}' ({res.id}) activated."))

    def handle_suspend(self, options):
        org = self._resolve_org(options)
        reason = options.get('reason', 'Administrative suspension')
        service = OrganizationService()
        res = service.suspend_organization(org.id, reason=reason)
        self.stdout.write(self.style.WARNING(f"Organization '{res.name}' ({res.id}) suspended: {reason}"))

    def handle_archive(self, options):
        org = self._resolve_org(options)
        service = OrganizationService()
        res = service.archive_organization(org.id)
        self.stdout.write(self.style.WARNING(f"Organization '{res.name}' ({res.id}) archived."))

    def handle_restore(self, options):
        org = self._resolve_org(options)
        service = OrganizationService()
        res = service.restore_organization(org.id)
        self.stdout.write(self.style.SUCCESS(f"Organization '{res.name}' ({res.id}) restored."))

    def handle_delete(self, options):
        org = self._resolve_org(options)
        hard = options.get('hard', False)
        force = options.get('force', False)

        if not force:
            mode = "HARD (permanent data loss)" if hard else "SOFT"
            confirm = input(f"Are you sure you want to perform {mode} delete on organization '{org.name}' ({org.id})? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write("Operation cancelled.")
                return

        service = OrganizationService()
        service.delete_organization(org.id, hard=hard)
        msg_type = "Permanently deleted" if hard else "Soft-deleted"
        self.stdout.write(self.style.SUCCESS(f"{msg_type} organization '{org.name}' ({org.id})."))

    def handle_switch_tier(self, options):
        org = self._resolve_org(options)
        new_tier = options['tier'].lower()
        sync_res = options.get('sync_resources', True)

        old_tier = org.subscription_tier
        org.subscription_tier = new_tier
        org.save(update_fields=['subscription_tier', 'updated_at'])

        self.stdout.write(self.style.SUCCESS(f"Organization '{org.name}' tier switched: {old_tier.upper()} -> {new_tier.upper()}"))

        if sync_res:
            res_service = ResourceService()
            synced = res_service.sync_with_plan(org.id, new_tier)
            self.stdout.write(self.style.SUCCESS(f"Synced {len(synced)} resource quotas to {new_tier.upper()} plan specifications."))

    def handle_stats(self, options):
        org_id = options.get('org_id')
        as_json = options.get('json', False)
        stats_service = OrganizationStatsService()

        if org_id:
            data = stats_service.get_client_admin_stats(org_id)
            if as_json:
                self.stdout.write(json.dumps(data, indent=2))
                return
            self.stdout.write("\n" + "=" * 60)
            self.stdout.write(self.style.SUCCESS(f" TENANT STATISTICS: {data.get('organization', {}).get('name', org_id)}"))
            self.stdout.write("=" * 60)
            self.stdout.write(f"  Total Active Users:  {data.get('total_users', 0)}")
            self.stdout.write(f"  Configured Domains:  {data.get('total_domains', 0)}")
            domains_st = data.get('domains_status', {})
            self.stdout.write(f"    - Active: {domains_st.get('active', 0)}, Pending: {domains_st.get('pending', 0)}, Failed: {domains_st.get('failed', 0)}")
            self.stdout.write("=" * 60 + "\n")
        else:
            data = stats_service.get_super_admin_stats()
            if as_json:
                self.stdout.write(json.dumps(data, indent=2))
                return
            self.stdout.write("\n" + "=" * 70)
            self.stdout.write(self.style.SUCCESS(" FALCON MULTI-TENANT PLATFORM OVERVIEW"))
            self.stdout.write("=" * 70)
            orgs_st = data.get('organizations', {})
            self.stdout.write(f"  Organizations Total: {orgs_st.get('total', 0)}")
            self.stdout.write(f"    - Active:    {orgs_st.get('active', 0)}")
            self.stdout.write(f"    - Pending:   {orgs_st.get('pending', 0)}")
            self.stdout.write(f"    - Suspended: {orgs_st.get('suspended', 0)}")
            self.stdout.write(f"    - Archived:  {orgs_st.get('archived', 0)}")
            self.stdout.write(f"  Total Users:         {data.get('total_users', 0)}")
            dom_st = data.get('domains', {})
            self.stdout.write(f"  Domains Total:       {dom_st.get('total', 0)} (Active: {dom_st.get('active', 0)})")
            res_st = data.get('resources', {})
            self.stdout.write(f"  Quota Warnings:      {res_st.get('warning', 0)} | Exceeded: {res_st.get('exceeded', 0)}")
            self.stdout.write("=" * 70 + "\n")
