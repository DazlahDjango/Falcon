from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization
from apps.tenant.services import ConnectionService


class Command(BaseCommand):
    help = (
        'Manage multi-tenant database connection pools: '
        'status, metrics, close, recycle, pause, resume, prewarm, drain, '
        'kill_idle, kill_all, delete_records, terminate_pg'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=[
                'status', 'metrics', 'close', 'recycle', 'pause', 'resume',
                'prewarm', 'drain', 'kill_idle', 'kill_all', 'delete_records', 'terminate_pg'
            ],
            help=(
                'Action to perform:\n'
                '  status: View pool connection status for an org or overall pool.\n'
                '  metrics: Display database connection pool statistics.\n'
                '  close: Close active connection for a specific organization.\n'
                '  recycle: Close and recycle all active connections in local pool.\n'
                '  pause: Pause connections for an organization (maintenance mode).\n'
                '  resume: Resume connections for a paused organization.\n'
                '  prewarm: Pre-warm connection pool for active organizations.\n'
                '  drain: Gracefully drain connection pool on shutdown.\n'
                '  kill_idle: Close idle connections older than --idle-minutes (for --org-id or full database).\n'
                '  kill_all: Kill all active/idle connections (for --org-id or full database).\n'
                '  delete_records: Delete connection tracking records from DB (--status filter, for --org-id or full database).\n'
                '  terminate_pg: Terminate idle PostgreSQL backend processes directly on DB server.\n'
            )
        )
        parser.add_argument(
            '--org-id',
            type=str,
            help='Organization UUID (optional; if omitted, targets full database across all organizations)'
        )
        parser.add_argument(
            '--idle-minutes',
            type=int,
            default=30,
            help='Idle timeout in minutes for kill_idle action (default: 30)'
        )
        parser.add_argument(
            '--status',
            type=str,
            default='closed',
            choices=['closed', 'idle', 'error', 'active', 'all'],
            help='Status filter for delete_records action: closed, idle, error, active, all (default: closed)'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options.get('org_id')
        idle_minutes = options.get('idle_minutes', 30)
        status_filter = options.get('status', 'closed')

        service = ConnectionService()

        if action == 'status':
            if org_id:
                try:
                    org = Organization.objects.get(id=org_id, is_deleted=False)
                    status_info = service.get_status(org.id)
                    self.stdout.write(f"\nConnection Status for '{org.name}' ({org.id}):")
                    self.stdout.write("-" * 60)
                    self.stdout.write(f"  Connected:    {status_info['is_connected']}")
                    self.stdout.write(f"  Last Used At: {status_info['last_used_at']}")
                    self.stdout.write(f"  Idle Minutes: {status_info['idle_minutes']}")
                    self.stdout.write("-" * 60)
                except Organization.DoesNotExist:
                    raise CommandError(f"Organization '{org_id}' not found.")
            else:
                statuses = service.get_all_statuses()
                self.stdout.write("\nActive Thread-Local Pool Statuses:")
                self.stdout.write("-" * 60)
                if not statuses:
                    self.stdout.write("  No active thread-local pool connections.")
                for key, info in statuses.items():
                    self.stdout.write(f"  {key:<45} Connected: {info['is_connected']}")
                self.stdout.write("-" * 60)

        elif action == 'metrics':
            metrics = service.get_connection_metrics(organization_id=org_id)
            target_scope = f"Organization '{org_id}'" if org_id else "Full Database (All Organizations)"
            self.stdout.write(f"\nConnection Pool Metrics ({target_scope}):")
            self.stdout.write("-" * 60)
            self.stdout.write(f"  Total Database Connections Recorded: {metrics['total_connections']}")
            self.stdout.write(f"  Active Connections:                  {metrics['active_connections']}")
            self.stdout.write(f"  Idle Connections:                    {metrics['idle_connections']}")
            self.stdout.write(f"  Error Connections:                   {metrics['error_connections']}")
            self.stdout.write(f"  Closed Connections:                  {metrics['closed_connections']}")
            self.stdout.write(f"  Local Acquisitions Count:            {metrics['local_acquisitions']}")
            self.stdout.write(f"  Local Failures Count:                {metrics['local_failures']}")
            self.stdout.write(f"  Local Recycles Count:                {metrics['local_recycles']}")
            self.stdout.write(f"  Avg Lock Wait Time (sec):            {metrics['avg_lock_wait_time_seconds']}")
            self.stdout.write("-" * 60)

        elif action == 'close':
            if not org_id:
                raise CommandError("--org-id is required for close action.")
            service.close_connection(org_id)
            self.stdout.write(self.style.SUCCESS(f"Connection for organization {org_id} closed."))

        elif action == 'recycle':
            count = service.close_all()
            self.stdout.write(self.style.SUCCESS(f"Successfully recycled {count} connections."))

        elif action == 'pause':
            if not org_id:
                raise CommandError("--org-id is required for pause action.")
            ConnectionService.pause_connection(org_id)
            self.stdout.write(self.style.WARNING(f"Database connections paused for organization {org_id} (Maintenance Mode)."))

        elif action == 'resume':
            if not org_id:
                raise CommandError("--org-id is required for resume action.")
            ConnectionService.resume_connection(org_id)
            self.stdout.write(self.style.SUCCESS(f"Database connections resumed for organization {org_id}."))

        elif action == 'prewarm':
            count = service.prewarm_connections()
            self.stdout.write(self.style.SUCCESS(f"Pre-warmed {count} tenant database connections."))

        elif action == 'drain':
            count = service.drain_connections()
            self.stdout.write(self.style.WARNING(f"Drained connection pool. Closed {count} local connections."))

        elif action == 'kill_idle':
            closed = service.close_idle_connections(idle_minutes=idle_minutes, organization_id=org_id)
            scope = f"organization '{org_id}'" if org_id else "full database"
            self.stdout.write(
                self.style.SUCCESS(
                    f"Killed/Closed {closed} idle connection record(s) for {scope} older than {idle_minutes} minute(s)."
                )
            )

        elif action == 'kill_all':
            closed = service.kill_all_connections(organization_id=org_id)
            scope = f"organization '{org_id}'" if org_id else "full database (all organizations)"
            self.stdout.write(
                self.style.WARNING(
                    f"Killed/Closed all {closed} active and idle connection(s) for {scope}."
                )
            )

        elif action == 'delete_records':
            deleted = service.delete_connection_records(organization_id=org_id, status_filter=status_filter)
            scope = f"organization '{org_id}'" if org_id else "full database"
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully deleted {deleted} connection record(s) with status '{status_filter}' for {scope}."
                )
            )

        elif action == 'terminate_pg':
            terminated = service.terminate_pg_backends(organization_id=org_id, idle_only=True)
            scope = f"organization '{org_id}'" if org_id else "full database"
            self.stdout.write(
                self.style.WARNING(
                    f"Terminated {terminated} idle PostgreSQL backend process(es) on server for {scope}."
                )
            )
