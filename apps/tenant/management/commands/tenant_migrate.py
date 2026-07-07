from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization
from apps.tenant.services import MigrationService
import traceback

class Command(BaseCommand):
    help = 'Manage multi-tenant schema database migrations (sync, status, preview, apply, rollback)'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['sync', 'status', 'preview', 'apply', 'rollback'],
            help='Action to perform: sync, status, preview, apply, rollback'
        )
        parser.add_argument(
            '--org-id',
            type=str,
            required=True,
            help='Organization UUID (required)'
        )
        parser.add_argument(
            '--app',
            type=str,
            help='App name (required for apply, rollback, preview)'
        )
        parser.add_argument(
            '--migration',
            type=str,
            help='Migration name (required for apply, rollback, preview)'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options['org_id']
        app_name = options['app']
        migration_name = options['migration']

        service = MigrationService()

        # Validate organization existence
        try:
            org = Organization.objects.get(id=org_id, is_deleted=False)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization with ID {org_id} does not exist or is deleted.")

        if action == 'sync':
            self.stdout.write(f"Syncing migrations for organization {org.name} ({org.id})...")
            try:
                res = service.sync_tenant_migrations(org.id)
                self.stdout.write(self.style.SUCCESS(f"Successfully synced migrations for {org.name}. Total: {res.count()}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Sync failed: {str(e)}"))
                self.stdout.write(traceback.format_exc())

        elif action == 'status':
            self.stdout.write(f"Checking migration status for organization {org.name} ({org.id})...")
            try:
                # Sync first to ensure DB records are fresh
                service.sync_tenant_migrations(org.id)
                migrations = service.get_migration_status(org.id)
                self.stdout.write("\nMigration Status Report:")
                self.stdout.write("-" * 60)
                for m in migrations:
                    status_style = self.style.SUCCESS if m.status == 'COMPLETED' else self.style.WARNING
                    self.stdout.write(f"{m.app_name}.{m.migration_name:<40} {status_style(m.status)}")
                self.stdout.write("-" * 60)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Status check failed: {str(e)}"))

        elif action == 'preview':
            if not app_name or not migration_name:
                raise CommandError("--app and --migration are required for SQL preview.")
            self.stdout.write(f"Previewing SQL for {app_name}.{migration_name} on {org.name}...")
            try:
                sql = service.preview_migration_sql(org.id, app_name, migration_name)
                self.stdout.write("\nSQL Preview Output:")
                self.stdout.write("=" * 80)
                self.stdout.write(sql)
                self.stdout.write("=" * 80)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Preview failed: {str(e)}"))

        elif action == 'apply':
            if not app_name or not migration_name:
                raise CommandError("--app and --migration are required for apply.")
            self.stdout.write(f"Applying migration {app_name}.{migration_name} to {org.name}...")
            try:
                res = service.apply_migration(org.id, app_name, migration_name)
                self.stdout.write(self.style.SUCCESS(f"Migration applied successfully: {res.app_name}.{res.migration_name} - {res.status}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Apply failed: {str(e)}"))

        elif action == 'rollback':
            if not app_name or not migration_name:
                raise CommandError("--app and --migration are required for rollback.")
            self.stdout.write(f"Rolling back migration {app_name}.{migration_name} on {org.name}...")
            try:
                res = service.rollback_migration(org.id, app_name, migration_name)
                self.stdout.write(self.style.SUCCESS(f"Migration rolled back successfully: {res.app_name}.{res.migration_name} - {res.status}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Rollback failed: {str(e)}"))
