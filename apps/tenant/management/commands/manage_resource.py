"""
Comprehensive Management Command for Falcon PMS Tenant Resource Quotas and Usage.
Handles:
- Quota Management: list, info, set-limit, sync-plan-limits
- Usage Tracking & Modifications: increment, decrement, reset-daily
- Historical Snapshots: snapshot, history

Usage:
    python manage.py manage_resource list --org-id <uuid>
    python manage.py manage_resource list --exceeded-only
    python manage.py manage_resource info --org-id <uuid> --type users
    python manage.py manage_resource set-limit --org-id <uuid> --type users --limit 200 --burst-allowed true
    python manage.py manage_resource increment --org-id <uuid> --type api_calls_per_day --amount 50
    python manage.py manage_resource sync-plan-limits --all-orgs
    python manage.py manage_resource sync-plan-limits --org-id <uuid> --tier enterprise
    python manage.py manage_resource reset-daily --all-orgs
    python manage.py manage_resource snapshot --all-orgs --notes "End-of-month snapshot"
    python manage.py manage_resource history --org-id <uuid> --days 30
"""

import sys
import json
from datetime import timedelta
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

from apps.tenant.models import Organization, OrganizationResource, ResourceUsageSnapshot
from apps.tenant.services import ResourceService
from apps.tenant.constants import ResourceType, SubscriptionTier
from apps.tenant.exceptions import OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant Resource Quotas, tracking, and daily cycles.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List resource quotas and current usage')
        list_parser.add_argument('--org-id', '-i', type=str, help='Filter by Organization UUID')
        list_parser.add_argument('--type', '-t', type=str, help='Filter by ResourceType (users, storage_mb, api_calls_per_day, departments, kpis, concurrent_sessions)')
        list_parser.add_argument('--exceeded-only', action='store_true', help='Show only quotas that are exceeded (>=100%)')
        list_parser.add_argument('--warning-only', action='store_true', help='Show only quotas in warning zone (>=80%)')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Max rows to display (default: 50)')
        list_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', help='Display detailed quota status for a specific resource')
        info_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        info_parser.add_argument('--type', '-t', type=str, required=True, help='Resource Type')
        info_parser.add_argument('--json', action='store_true', help='Output details as JSON')

        # ---------------- SET LIMIT ----------------
        set_lim_parser = subparsers.add_parser('set-limit', help='Update quota limit and burst allowance')
        set_lim_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        set_lim_parser.add_argument('--type', '-t', type=str, required=True, help='Resource Type')
        set_lim_parser.add_argument('--limit', type=int, required=True, help='New maximum limit value')
        set_lim_parser.add_argument('--burst-allowed', type=str, choices=['true', 'false'], help='Allow temporary burst above limit')

        # ---------------- INCREMENT / DECREMENT ----------------
        inc_parser = subparsers.add_parser('increment', help='Increment resource usage')
        inc_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        inc_parser.add_argument('--type', '-t', type=str, required=True, help='Resource Type')
        inc_parser.add_argument('--amount', '-a', type=int, default=1, help='Amount to increment (default: 1)')

        dec_parser = subparsers.add_parser('decrement', help='Decrement resource usage')
        dec_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        dec_parser.add_argument('--type', '-t', type=str, required=True, help='Resource Type')
        dec_parser.add_argument('--amount', '-a', type=int, default=1, help='Amount to decrement (default: 1)')

        # ---------------- SYNC PLAN LIMITS ----------------
        sync_parser = subparsers.add_parser('sync-plan-limits', help='Sync resource limits from subscription plan definitions')
        sync_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        sync_parser.add_argument('--all-orgs', action='store_true', help='Sync for all active organizations')
        sync_parser.add_argument('--tier', '-t', type=str, choices=['free', 'basic', 'professional', 'enterprise'], help='Explicit tier override')

        # ---------------- RESET DAILY ----------------
        rst_parser = subparsers.add_parser('reset-daily', help='Reset daily counter resources (e.g. api_calls_per_day)')
        rst_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        rst_parser.add_argument('--all-orgs', action='store_true', help='Reset for all active organizations')

        # ---------------- SNAPSHOT ----------------
        snap_parser = subparsers.add_parser('snapshot', help='Capture point-in-time usage snapshot records')
        snap_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        snap_parser.add_argument('--all-orgs', action='store_true', help='Snapshot for all active organizations')
        snap_parser.add_argument('--notes', type=str, default='', help='Snapshot notes or trigger description')

        # ---------------- HISTORY ----------------
        hist_parser = subparsers.add_parser('history', help='View historical usage snapshots')
        hist_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        hist_parser.add_argument('--type', '-t', type=str, help='Filter by Resource Type')
        hist_parser.add_argument('--days', '-d', type=int, default=30, help='Days of history (default: 30)')
        hist_parser.add_argument('--json', action='store_true', help='Output history as JSON')

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
            self.stdout.write(self.style.ERROR(f"Resource Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    # ---------------- HANDLERS ----------------

    def handle_list(self, options):
        org_id = options.get('org_id')
        rtype = options.get('type')
        exceeded_only = options.get('exceeded_only', False)
        warning_only = options.get('warning_only', False)
        limit = options.get('limit', 50)
        as_json = options.get('json', False)

        qs = OrganizationResource.objects.filter(is_deleted=False).select_related('organization').order_by('organization__name', 'resource_type')

        if org_id:
            qs = qs.filter(organization_id=org_id)
        if rtype:
            qs = qs.filter(resource_type=rtype.lower())

        total_count = qs.count()
        resources = list(qs)

        if exceeded_only:
            resources = [r for r in resources if r.is_exceeded]
        elif warning_only:
            resources = [r for r in resources if r.is_warning_level]

        resources = resources[:limit]

        if as_json:
            data = [
                {
                    'id': str(r.id),
                    'organization_id': str(r.organization_id),
                    'organization_name': r.organization.name if r.organization else None,
                    'resource_type': r.resource_type,
                    'current_value': r.current_value,
                    'limit_value': r.limit_value,
                    'percentage_used': r.percentage_used,
                    'burst_allowed': r.burst_allowed,
                    'is_exceeded': r.is_exceeded,
                    'is_warning': r.is_warning_level,
                    'last_reset_at': r.last_reset_at.isoformat() if r.last_reset_at else None,
                }
                for r in resources
            ]
            self.stdout.write(json.dumps({'total': len(resources), 'results': data}, indent=2))
            return

        self.stdout.write("\n" + "=" * 105)
        self.stdout.write(self.style.SUCCESS(f" RESOURCE QUOTAS & USAGE ({len(resources)} displayed)"))
        self.stdout.write("=" * 105)
        header = f"{'Organization':<26} {'Resource Type':<22} {'Current':<10} {'Limit':<10} {'Usage %':<10} {'Status':<12} {'Burst'}"
        self.stdout.write(header)
        self.stdout.write("-" * 105)

        for r in resources:
            org_name = r.organization.name if r.organization else "Unassigned"
            status_str = "EXCEEDED" if r.is_exceeded else ("WARNING" if r.is_warning_level else "OK")
            status_style = self.style.ERROR if r.is_exceeded else (self.style.WARNING if r.is_warning_level else self.style.SUCCESS)
            burst_str = "YES" if r.burst_allowed else "NO"

            self.stdout.write(
                f"{org_name[:24]:<26} {r.resource_type[:20]:<22} {r.current_value:<10} "
                f"{r.limit_value:<10} {r.percentage_used:<9.1f}% [{status_style(status_str):<10}] {burst_str}"
            )

        self.stdout.write("-" * 105 + "\n")

    def handle_info(self, options):
        org_id = options['org_id']
        rtype = options['type'].lower()
        as_json = options.get('json', False)

        try:
            r = OrganizationResource.objects.select_related('organization').get(organization_id=org_id, resource_type=rtype)
        except OrganizationResource.DoesNotExist:
            raise CommandError(f"Resource '{rtype}' not configured for organization '{org_id}'.")

        if as_json:
            data = {
                'id': str(r.id),
                'organization_id': str(r.organization_id),
                'organization_name': r.organization.name if r.organization else None,
                'resource_type': r.resource_type,
                'current_value': r.current_value,
                'limit_value': r.limit_value,
                'percentage_used': r.percentage_used,
                'burst_allowed': r.burst_allowed,
                'warning_threshold': r.warning_threshold,
                'is_exceeded': r.is_exceeded,
                'is_warning': r.is_warning_level,
                'last_reset_at': r.last_reset_at.isoformat() if r.last_reset_at else None,
                'created_at': r.created_at.isoformat() if r.created_at else None,
            }
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS(f" RESOURCE QUOTA: {r.organization.name} - {r.resource_type.upper()}"))
        self.stdout.write("=" * 65)
        self.stdout.write(f"  Current Usage:       {r.current_value}")
        self.stdout.write(f"  Quota Limit:         {r.limit_value}")
        self.stdout.write(f"  Percentage Used:     {r.percentage_used:.2f}%")
        self.stdout.write(f"  Warning Threshold:   {r.warning_threshold}%")
        self.stdout.write(f"  Burst Allowed:       {'YES' if r.burst_allowed else 'NO'}")
        self.stdout.write(f"  Exceeded:            {'YES' if r.is_exceeded else 'NO'}")
        self.stdout.write(f"  In Warning Zone:     {'YES' if r.is_warning_level else 'NO'}")
        self.stdout.write(f"  Last Reset At:       {r.last_reset_at or 'N/A'}")
        self.stdout.write("=" * 65 + "\n")

    def handle_set_limit(self, options):
        org_id = options['org_id']
        rtype = options['type'].lower()
        new_limit = options['limit']
        burst_opt = options.get('burst_allowed')

        res_obj, _ = OrganizationResource.objects.get_or_create(
            organization_id=org_id,
            resource_type=rtype,
            defaults={'limit_value': new_limit, 'current_value': 0}
        )
        res_obj.limit_value = new_limit
        if burst_opt is not None:
            res_obj.burst_allowed = (burst_opt.lower() == 'true')
        res_obj.save()

        self.stdout.write(self.style.SUCCESS(
            f"Updated quota '{rtype}' for org '{org_id}': limit={new_limit}, burst_allowed={res_obj.burst_allowed}"
        ))

    def handle_increment(self, options):
        org_id = options['org_id']
        rtype = options['type'].lower()
        amount = options.get('amount', 1)

        service = ResourceService()
        allowed = service.increment_usage(org_id, rtype, amount)
        if allowed:
            self.stdout.write(self.style.SUCCESS(f"Incremented usage for '{rtype}' by {amount}."))
        else:
            self.stdout.write(self.style.WARNING(f"Usage updated, but quota limit exceeded for '{rtype}'!"))

    def handle_decrement(self, options):
        org_id = options['org_id']
        rtype = options['type'].lower()
        amount = options.get('amount', 1)

        service = ResourceService()
        service.decrement_usage(org_id, rtype, amount)
        self.stdout.write(self.style.SUCCESS(f"Decremented usage for '{rtype}' by {amount}."))

    def handle_sync_plan_limits(self, options):
        org_id = options.get('org_id')
        all_orgs = options.get('all_orgs', False)
        tier_override = options.get('tier')
        service = ResourceService()

        if all_orgs:
            orgs = Organization.objects.filter(is_active=True, is_deleted=False)
            self.stdout.write(f"Syncing resource plan limits for {orgs.count()} organization(s)...")
            for o in orgs:
                tier = tier_override or o.subscription_tier
                synced = service.sync_with_plan(o.id, tier)
                self.stdout.write(self.style.SUCCESS(f"  [OK] {o.name}: synced {len(synced)} resources to {tier.upper()}"))
            self.stdout.write(self.style.SUCCESS("All organizations synchronized."))
        elif org_id:
            try:
                org = Organization.objects.get(id=org_id)
            except Organization.DoesNotExist:
                raise CommandError(f"Organization '{org_id}' not found.")
            tier = tier_override or org.subscription_tier
            synced = service.sync_with_plan(org.id, tier)
            self.stdout.write(self.style.SUCCESS(f"Synced {len(synced)} resources for '{org.name}' to {tier.upper()} plan."))
        else:
            raise CommandError("Please specify --org-id or --all-orgs.")

    def handle_reset_daily(self, options):
        org_id = options.get('org_id')
        all_orgs = options.get('all_orgs', False)
        service = ResourceService()

        if all_orgs:
            count = service.reset_daily_limits()
            self.stdout.write(self.style.SUCCESS(f"Reset daily usage counters across {count} organization(s)."))
        elif org_id:
            OrganizationResource.objects.filter(organization_id=org_id, resource_type='api_calls_per_day').update(
                current_value=0,
                last_reset_at=timezone.now()
            )
            self.stdout.write(self.style.SUCCESS(f"Reset daily counters for organization '{org_id}'."))
        else:
            raise CommandError("Please specify --org-id or --all-orgs.")

    def handle_snapshot(self, options):
        org_id = options.get('org_id')
        all_orgs = options.get('all_orgs', False)
        notes = options.get('notes', 'Manual management command snapshot')

        org_ids = []
        if all_orgs:
            org_ids = list(Organization.objects.filter(is_active=True, is_deleted=False).values_list('id', flat=True))
        elif org_id:
            org_ids = [org_id]
        else:
            raise CommandError("Please specify --org-id or --all-orgs.")

        created_count = 0
        for oid in org_ids:
            resources = OrganizationResource.objects.filter(organization_id=oid, is_deleted=False)
            for r in resources:
                ResourceUsageSnapshot.objects.create(
                    organization_id=oid,
                    resource_type=r.resource_type,
                    value=r.current_value,
                    limit_value=r.limit_value,
                    percentage=r.percentage_used,
                    notes=notes
                )
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Captured {created_count} usage snapshot records across {len(org_ids)} organization(s)."))

    def handle_history(self, options):
        org_id = options['org_id']
        rtype = options.get('type')
        days = options.get('days', 30)
        as_json = options.get('json', False)

        cutoff = timezone.now() - timedelta(days=days)
        qs = ResourceUsageSnapshot.objects.filter(organization_id=org_id, recorded_at__gte=cutoff).order_by('-recorded_at')
        if rtype:
            qs = qs.filter(resource_type=rtype.lower())

        snapshots = list(qs[:100])

        if as_json:
            data = [
                {
                    'id': str(s.id),
                    'resource_type': s.resource_type,
                    'value': s.value,
                    'limit_value': s.limit_value,
                    'percentage': float(s.percentage or 0),
                    'recorded_at': s.recorded_at.isoformat() if s.recorded_at else None,
                    'notes': s.notes,
                }
                for s in snapshots
            ]
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS(f" USAGE SNAPSHOT HISTORY (Last {days} days - {len(snapshots)} records)"))
        self.stdout.write("=" * 80)
        header = f"{'Recorded At':<22} {'Resource Type':<22} {'Usage':<10} {'Limit':<10} {'Usage %'}"
        self.stdout.write(header)
        self.stdout.write("-" * 80)

        for s in snapshots:
            self.stdout.write(
                f"{s.recorded_at.strftime('%Y-%m-%d %H:%M:%S'):<22} {s.resource_type:<22} "
                f"{s.value:<10} {s.limit_value:<10} {s.percentage:.1f}%"
            )

        self.stdout.write("-" * 80 + "\n")
