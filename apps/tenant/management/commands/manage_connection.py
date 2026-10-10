"""
Comprehensive Management Command for Falcon PMS Tenant Database Connections.
Handles:
- Connection Status & Monitoring: status, metrics, ping/test
- Connection Lifecycle: close, recycle, pause, resume, prewarm, drain
- Cleanup & Process Termination: kill-idle, kill-all, delete-records, terminate-pg

Usage:
    python manage.py manage_connection status [--org-id <uuid>]
    python manage.py manage_connection metrics [--org-id <uuid>] [--json]
    python manage.py manage_connection ping --org-id <uuid>
    python manage.py manage_connection close --org-id <uuid>
    python manage.py manage_connection recycle
    python manage.py manage_connection pause --org-id <uuid>
    python manage.py manage_connection resume --org-id <uuid>
    python manage.py manage_connection prewarm [--all] [--org-id <uuid>]
    python manage.py manage_connection drain
    python manage.py manage_connection kill-idle [--idle-minutes 30] [--org-id <uuid>]
    python manage.py manage_connection kill-all [--org-id <uuid>]
    python manage.py manage_connection delete-records --status closed
    python manage.py manage_connection terminate-pg --idle-minutes 30
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
from django.db import connection, transaction
from django.utils import timezone

from apps.tenant.models import Organization, OrganizationConnection
from apps.tenant.services import ConnectionService
from apps.tenant.exceptions import OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant database connection pooling, lifecycle, and health.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- STATUS ----------------
        status_parser = subparsers.add_parser('status', help='View connection status for an org or overall pool')
        status_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        status_parser.add_argument('--json', action='store_true', help='Output status as JSON')

        # ---------------- METRICS ----------------
        metrics_parser = subparsers.add_parser('metrics', help='Display database connection pool metrics')
        metrics_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        metrics_parser.add_argument('--json', action='store_true', help='Output metrics as JSON')

        # ---------------- PING / TEST ----------------
        ping_parser = subparsers.add_parser('ping', help='Test tenant connection switching and query response')
        ping_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        # ---------------- CLOSE ----------------
        close_parser = subparsers.add_parser('close', help='Close active connection for a specific organization')
        close_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        # ---------------- RECYCLE ----------------
        subparsers.add_parser('recycle', help='Recycle all active local connection pool handles')

        # ---------------- PAUSE / RESUME ----------------
        pause_parser = subparsers.add_parser('pause', help='Pause connections for an organization (maintenance mode)')
        pause_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        resume_parser = subparsers.add_parser('resume', help='Resume connections for a paused organization')
        resume_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        # ---------------- PREWARM ----------------
        prewarm_parser = subparsers.add_parser('prewarm', help='Pre-warm connection pool for active organizations')
        prewarm_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        prewarm_parser.add_argument('--all', action='store_true', help='Pre-warm all active organizations')

        # ---------------- DRAIN ----------------
        subparsers.add_parser('drain', help='Gracefully drain connection pool')

        # ---------------- KILL IDLE ----------------
        kill_idle_parser = subparsers.add_parser('kill-idle', help='Close idle connections older than --idle-minutes')
        kill_idle_parser.add_argument('--idle-minutes', type=int, default=30, help='Idle timeout in minutes (default: 30)')
        kill_idle_parser.add_argument('--org-id', '-i', type=str, help='Target organization UUID')

        # ---------------- KILL ALL ----------------
        kill_all_parser = subparsers.add_parser('kill-all', help='Terminate all connections')
        kill_all_parser.add_argument('--org-id', '-i', type=str, help='Target organization UUID')

        # ---------------- DELETE RECORDS ----------------
        del_rec_parser = subparsers.add_parser('delete-records', help='Clean up connection tracking records in database')
        del_rec_parser.add_argument('--status', '-s', type=str, default='closed', choices=['closed', 'idle', 'error', 'active', 'all'], help='Status filter (default: closed)')
        del_rec_parser.add_argument('--org-id', '-i', type=str, help='Target organization UUID')

        # ---------------- TERMINATE PG ----------------
        term_pg_parser = subparsers.add_parser('terminate-pg', help='Terminate idle PostgreSQL backend server processes directly')
        term_pg_parser.add_argument('--idle-minutes', type=int, default=30, help='Idle timeout in minutes (default: 30)')

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
            self.stdout.write(self.style.ERROR(f"Connection Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    # ---------------- HANDLERS ----------------

    def handle_status(self, options):
        org_id = options.get('org_id')
        as_json = options.get('json', False)
        service = ConnectionService()

        if org_id:
            try:
                org = Organization.objects.get(id=org_id)
            except Organization.DoesNotExist:
                raise CommandError(f"Organization '{org_id}' not found.")

            status_info = service.get_status(org.id)
            if as_json:
                self.stdout.write(json.dumps(status_info, indent=2))
                return

            self.stdout.write("\n" + "=" * 60)
            self.stdout.write(self.style.SUCCESS(f" CONNECTION STATUS: {org.name} ({org.id})"))
            self.stdout.write("=" * 60)
            self.stdout.write(f"  Connected:    {status_info['is_connected']}")
            self.stdout.write(f"  Last Used:    {status_info['last_used_at']}")
            self.stdout.write(f"  Idle Minutes: {status_info['idle_minutes']}")
            self.stdout.write("=" * 60 + "\n")
        else:
            statuses = service.get_all_statuses()
            if as_json:
                self.stdout.write(json.dumps(statuses, indent=2))
                return

            self.stdout.write("\n" + "=" * 65)
            self.stdout.write(self.style.SUCCESS(" ACTIVE THREAD-LOCAL CONNECTION STATUSES"))
            self.stdout.write("=" * 65)
            if not statuses:
                self.stdout.write("  No active thread-local pool connections.")
            for key, info in statuses.items():
                status_color = self.style.SUCCESS if info['is_connected'] else self.style.WARNING
                self.stdout.write(f"  {key:<40} Connected: {status_color(str(info['is_connected']))}")
            self.stdout.write("=" * 65 + "\n")

    def handle_metrics(self, options):
        org_id = options.get('org_id')
        as_json = options.get('json', False)
        service = ConnectionService()
        metrics = service.get_connection_metrics(organization_id=org_id)

        if as_json:
            self.stdout.write(json.dumps(metrics, indent=2))
            return

        target_scope = f"Organization '{org_id}'" if org_id else "Full Database (All Organizations)"
        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS(f" CONNECTION POOL METRICS ({target_scope})"))
        self.stdout.write("=" * 65)
        self.stdout.write(f"  Total Tracked Connections:   {metrics['total_connections']}")
        self.stdout.write(f"  Active Connections:          {metrics['active_connections']}")
        self.stdout.write(f"  Idle Connections:            {metrics['idle_connections']}")
        self.stdout.write(f"  Error Connections:           {metrics['error_connections']}")
        self.stdout.write(f"  Closed Connections:          {metrics['closed_connections']}")
        self.stdout.write(f"  Local Acquisitions Count:    {metrics['local_acquisitions']}")
        self.stdout.write(f"  Local Failures Count:        {metrics['local_failures']}")
        self.stdout.write(f"  Local Recycles Count:        {metrics['local_recycles']}")
        self.stdout.write(f"  Avg Lock Wait Time (sec):    {metrics['avg_lock_wait_time_seconds']}")
        self.stdout.write("=" * 65 + "\n")

    def handle_ping(self, options):
        org_id = options['org_id']
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        service = ConnectionService()
        self.stdout.write(f"Pinging connection for '{org.name}' ({org.schema_name})...")
        try:
            start_time = timezone.now()
            conn = service.get_connection(org.id)
            with conn.cursor() as cursor:
                cursor.execute("SELECT current_schema(), 1")
                current_schema, result = cursor.fetchone()
            elapsed_ms = (timezone.now() - start_time).total_seconds() * 1000.0
            self.stdout.write(self.style.SUCCESS(
                f"Connection Healthy! Schema: '{current_schema}', Result: {result}, Latency: {elapsed_ms:.2f}ms"
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Ping failed: {str(e)}"))

    def handle_close(self, options):
        org_id = options['org_id']
        service = ConnectionService()
        service.close_connection(org_id)
        self.stdout.write(self.style.SUCCESS(f"Closed connection for organization '{org_id}'."))

    def handle_recycle(self, options):
        service = ConnectionService()
        service.recycle_connections()
        self.stdout.write(self.style.SUCCESS("All local thread-pool connections recycled successfully."))

    def handle_pause(self, options):
        org_id = options['org_id']
        service = ConnectionService()
        service.pause_connections(org_id)
        self.stdout.write(self.style.WARNING(f"Paused connections for organization '{org_id}' (Maintenance mode)."))

    def handle_resume(self, options):
        org_id = options['org_id']
        service = ConnectionService()
        service.resume_connections(org_id)
        self.stdout.write(self.style.SUCCESS(f"Resumed connections for organization '{org_id}'."))

    def handle_prewarm(self, options):
        org_id = options.get('org_id')
        run_all = options.get('all', False)
        service = ConnectionService()

        if org_id:
            org_ids = [org_id]
        elif run_all:
            org_ids = list(Organization.objects.filter(is_active=True, is_deleted=False).values_list('id', flat=True))
        else:
            raise CommandError("Please specify --org-id or --all.")

        self.stdout.write(f"Pre-warming connection pool for {len(org_ids)} organization(s)...")
        service.prewarm_pool(org_ids)
        self.stdout.write(self.style.SUCCESS(f"Pre-warmed pool for {len(org_ids)} organization(s)."))

    def handle_drain(self, options):
        service = ConnectionService()
        service.drain_pool()
        self.stdout.write(self.style.SUCCESS("Connection pool drained successfully."))

    def handle_kill_idle(self, options):
        idle_minutes = options['idle_minutes']
        org_id = options.get('org_id')
        service = ConnectionService()
        count = service.close_idle_connections(idle_minutes=idle_minutes, organization_id=org_id)
        self.stdout.write(self.style.SUCCESS(f"Closed {count} idle connection(s) older than {idle_minutes} minutes."))

    def handle_kill_all(self, options):
        org_id = options.get('org_id')
        service = ConnectionService()
        count = service.kill_all_connections(organization_id=org_id)
        self.stdout.write(self.style.WARNING(f"Killed {count} connection(s)."))

    def handle_delete_records(self, options):
        status_filter = options['status']
        org_id = options.get('org_id')
        service = ConnectionService()
        count = service.delete_connection_records(status_filter=status_filter, organization_id=org_id)
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} connection record(s) matching status '{status_filter}'."))

    def handle_terminate_pg(self, options):
        service = ConnectionService()
        count = service.terminate_pg_backends(idle_only=True)
        self.stdout.write(self.style.SUCCESS(f"Terminated {count} idle PostgreSQL backend processes."))
