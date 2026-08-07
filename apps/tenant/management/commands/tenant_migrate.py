import traceback
from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization
from apps.tenant.services import MigrationService


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
            help='Organization UUID (required unless --all-tenants is provided)'
        )
        parser.add_argument(
            '--all-tenants',
            action='store_true',
            default=False,
            help='Run the action across all active organizations'
        )
        parser.add_argument(
            '--app',
            type=str,
            help='App name (optional for apply/sync/status; required for preview/rollback)'
        )
        parser.add_argument(
            '--migration',
            type=str,
            help='Migration name (optional for apply/sync/status; required for preview/rollback)'
        )
        parser.add_argument(
            '--fake',
            action='store_true',
            default=False,
            help='Mark migrations as applied without executing DDL SQL statements'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options.get('org_id')
        all_tenants = options.get('all-tenants', False) or options.get('all_tenants', False)
        app_name = options.get('app')
        migration_name = options.get('migration')
        fake = options.get('fake', False)

        service = MigrationService()

        # Validate arguments
        if not org_id and not all_tenants:
            raise CommandError("Either --org-id <uuid> or --all-tenants must be specified.")

        if org_id and all_tenants:
            raise CommandError("Cannot specify both --org-id and --all-tenants.")

        # Determine target organizations
        if all_tenants:
            target_orgs = list(Organization.objects.filter(is_active=True, is_deleted=False))
            if not target_orgs:
                self.stdout.write(self.style.WARNING("No active organizations found."))
                return
        else:
            try:
                org = Organization.objects.get(id=org_id, is_deleted=False)
                target_orgs = [org]
            except Organization.DoesNotExist:
                raise CommandError(f"Organization with ID '{org_id}' does not exist or is deleted.")

        # Dispatch actions
        if action == 'sync':
            for org in target_orgs:
                self.stdout.write(f"Syncing migrations for organization '{org.name}' ({org.id})...")
                try:
                    res = service.sync_tenant_migrations(org.id)
                    self.stdout.write(self.style.SUCCESS(f"  Successfully synced migrations for {org.name}. Total tracked: {res.count()}"))
                except Exception as e:
                    if "does not exist" in str(e).lower():
                        self.stdout.write(self.style.WARNING(f"  [SKIPPED] Organization '{org.name}' has no schema initialized yet: {e}"))
                    else:
                        self.stdout.write(self.style.ERROR(f"  Sync failed for {org.name}: {str(e)}"))

        elif action == 'status':
            for org in target_orgs:
                self.stdout.write(f"\nMigration Status Report for '{org.name}' ({org.id}):")
                self.stdout.write("-" * 70)
                try:
                    service.sync_tenant_migrations(org.id)
                    migrations = service.get_migration_status(org.id)
                    if app_name:
                        migrations = migrations.filter(app_name=app_name)
                    if not migrations.exists():
                        self.stdout.write("  No migration records found.")
                    for m in migrations:
                        status_style = self.style.SUCCESS if m.status == 'COMPLETED' else self.style.WARNING
                        if m.status == 'FAILED':
                            status_style = self.style.ERROR
                        self.stdout.write(f"  {m.app_name}.{m.migration_name:<45} [{status_style(m.status)}]")
                except Exception as e:
                    if "does not exist" in str(e).lower():
                        self.stdout.write(self.style.WARNING(f"  [SKIPPED] Organization '{org.name}' has no database schema initialized yet."))
                    else:
                        self.stdout.write(self.style.ERROR(f"  Status check failed for {org.name}: {str(e)}"))
                self.stdout.write("-" * 70)

        elif action == 'preview':
            if len(target_orgs) > 1:
                raise CommandError("SQL Preview can only be executed for a single tenant (--org-id).")
            if not app_name or not migration_name:
                raise CommandError("--app and --migration are required for SQL preview.")
            org = target_orgs[0]
            self.stdout.write(f"Previewing SQL for {app_name}.{migration_name} on '{org.name}'...")
            try:
                sql = service.preview_migration_sql(org.id, app_name, migration_name)
                self.stdout.write("\nSQL Preview Output:")
                self.stdout.write("=" * 80)
                self.stdout.write(sql)
                self.stdout.write("=" * 80)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Preview failed: {str(e)}"))

        elif action == 'apply':
            # Case 1: Apply single specific migration
            if app_name and migration_name:
                for org in target_orgs:
                    self.stdout.write(f"Applying migration {app_name}.{migration_name} to '{org.name}' (fake={fake})...")
                    try:
                        res = service.apply_migration(org.id, app_name, migration_name, fake=fake)
                        self.stdout.write(self.style.SUCCESS(f"Migration applied successfully to {org.name}: {res.app_name}.{res.migration_name} [{res.status}]"))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Apply failed for {org.name}: {str(e)}"))
            # Case 2: Apply ALL pending migrations
            else:
                for org in target_orgs:
                    self.stdout.write(f"\nScanning and applying all pending migrations for '{org.name}' (fake={fake})...")
                    try:
                        applied = service.apply_all_pending_migrations(org.id, fake=fake)
                        if not applied:
                            self.stdout.write(self.style.SUCCESS(f"  [OK] No pending migrations for '{org.name}'. Schema is up to date."))
                        else:
                            self.stdout.write(self.style.SUCCESS(f"  Successfully applied {len(applied)} migration(s) for '{org.name}':"))
                            for m in applied:
                                self.stdout.write(f"   -> Applied: {m.app_name}.{m.migration_name} ({m.execution_time_ms}ms)")
                    except Exception as e:
                        if "does not exist" in str(e).lower():
                            self.stdout.write(self.style.WARNING(f"  [SKIPPED] Organization '{org.name}' has no database schema initialized yet."))
                        else:
                            self.stdout.write(self.style.ERROR(f"  Batch apply failed for '{org.name}': {str(e)}"))

        elif action == 'rollback':
            if len(target_orgs) > 1:
                raise CommandError("Rollback can only be executed for a single tenant (--org-id).")
            if not app_name or not migration_name:
                raise CommandError("--app and --migration are required for rollback.")
            org = target_orgs[0]
            self.stdout.write(f"Rolling back migration {app_name}.{migration_name} on '{org.name}'...")
            try:
                res = service.rollback_migration(org.id, app_name, migration_name)
                self.stdout.write(self.style.SUCCESS(f"Migration rolled back successfully on {org.name}: {res.app_name}.{res.migration_name} [{res.status}]"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Rollback failed: {str(e)}"))
