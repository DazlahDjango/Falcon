from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization
from apps.tenant.services import ConnectionService


class Command(BaseCommand):
    help = 'Manage multi-tenant database connection pools (status, metrics, close, recycle, pause, resume, prewarm, drain)'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['status', 'metrics', 'close', 'recycle', 'pause', 'resume', 'prewarm', 'drain'],
            help='Action to perform: status, metrics, close, recycle, pause, resume, prewarm, drain'
        )
        parser.add_argument(
            '--org-id',
            type=str,
            help='Organization UUID (required for close/pause/resume/status)'
        )
        parser.add_argument(
            '--idle-minutes',
            type=int,
            default=30,
            help='Idle timeout in minutes for close_idle action (default: 30)'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options.get('org_id')
        idle_minutes = options.get('idle_minutes', 30)

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
                for key, info in statuses.items():
                    self.stdout.write(f"  {key:<45} Connected: {info['is_connected']}")
                self.stdout.write("-" * 60)

        elif action == 'metrics':
            metrics = service.get_connection_metrics(organization_id=org_id)
            self.stdout.write("\nConnection Pool Metrics:")
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
