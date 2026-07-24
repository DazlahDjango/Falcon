import logging
import time
from django.db import transaction, connection
from django.utils import timezone
from django.core.management import call_command
from django.db.migrations.executor import MigrationExecutor
from apps.tenant.models import OrganizationMigration
from apps.tenant.exceptions import MigrationError

logger = logging.getLogger(__name__)


class MigrationService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def _get_schema_name(self, organization_id):
        from apps.tenant.models import OrganizationSchema
        try:
            schema_obj = OrganizationSchema.objects.get(organization_id=organization_id)
            return schema_obj.schema_name
        except OrganizationSchema.DoesNotExist:
            return f"org_{str(organization_id).replace('-', '_')}"

    def sync_tenant_migrations(self, organization_id):
        """
        Scans all migrations for ORG_APPS and synchronizes/creates
        OrganizationMigration records for the tenant based on the schema's state.
        """
        from apps.tenant.services.router_service import OrganizationDatabaseRouter
        has_orig = hasattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration')
        orig_val = getattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration', False)
        OrganizationDatabaseRouter._thread_local.is_tenant_migration = True
        try:
            schema_name = self._get_schema_name(organization_id)
            
            with connection.cursor() as cursor:
                # Check if schema exists
                cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema_name])
                if not cursor.fetchone()[0]:
                    raise MigrationError(f"Schema {schema_name} does not exist")
                
                # Switch search path
                cursor.execute(f'SET search_path TO "{schema_name}", public')
                
                # Ensure django_migrations table exists in the tenant schema to prevent fallback to public
                cursor.execute(f"""
                    CREATE TABLE IF NOT EXISTS "{schema_name}".django_migrations (
                        id bigserial PRIMARY KEY,
                        app varchar(255) NOT NULL,
                        name varchar(255) NOT NULL,
                        applied timestamptz NOT NULL
                    )
                """)
                
                # Check if django_migrations table exists in the schema
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT 1 
                        FROM information_schema.tables 
                        WHERE table_schema = %s AND table_name = 'django_migrations'
                    )
                """, [schema_name])
                table_exists = cursor.fetchone()[0]
                
                applied_migrations = set()
                if table_exists:
                    cursor.execute("SELECT app, name FROM django_migrations")
                    applied_migrations = {(row[0], row[1]) for row in cursor.fetchall()}

            # Load all available migrations topologically
            executor = MigrationExecutor(connection)
            executor.loader.build_graph()
            
            org_apps = ['kpi', 'dashboard', 'reviews', 'structure', 'reportplt', 'tasks_module']
            org_nodes = {key: node for key, node in executor.loader.graph.node_map.items() if key[0] in org_apps}
            
            # Simple topological sort
            visited = {}
            sorted_keys = []
            
            def visit(key):
                if key in visited:
                    if visited[key] == 'visiting':
                        raise MigrationError("Cycle detected in migrations")
                    return
                
                visited[key] = 'visiting'
                node = org_nodes[key]
                for parent in node.parents:
                    if parent.key in org_nodes:
                        visit(parent.key)
                visited[key] = 'visited'
                sorted_keys.append(key)
                
            for key in org_nodes:
                visit(key)

            # Get existing migration records from global db
            existing_records = {
                (r.app_name, r.migration_name): r 
                for r in OrganizationMigration.objects.filter(organization_id=organization_id)
            }

            updated_count = 0
            created_count = 0
            
            with transaction.atomic():
                for app_name, migration_name in sorted_keys:
                    is_applied = (app_name, migration_name) in applied_migrations
                    status = 'COMPLETED' if is_applied else 'PENDING'
                    
                    record = existing_records.get((app_name, migration_name))
                    if record:
                        if record.status != status:
                            if status == 'COMPLETED':
                                record.status = 'COMPLETED'
                                record.completed_at = timezone.now()
                                record.save(update_fields=['status', 'completed_at'])
                            elif status == 'PENDING' and record.status != 'FAILED':
                                record.status = 'PENDING'
                                record.completed_at = None
                                record.save(update_fields=['status', 'completed_at'])
                            updated_count += 1
                    else:
                        OrganizationMigration.objects.create(
                            organization_id=organization_id,
                            app_name=app_name,
                            migration_name=migration_name,
                            status=status,
                            completed_at=timezone.now() if is_applied else None
                        )
                        created_count += 1
                        
            self.logger.info(f"Sync complete for org {organization_id}. Created: {created_count}, Updated: {updated_count}")
        finally:
            if has_orig:
                OrganizationDatabaseRouter._thread_local.is_tenant_migration = orig_val
            else:
                if hasattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration'):
                    delattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration')
        return OrganizationMigration.objects.filter(organization_id=organization_id)

    def apply_migration(self, organization_id, app_name, migration_name, user=None):
        schema_name = self._get_schema_name(organization_id)
        lock_id = hash(str(organization_id)) % 2**31

        from apps.tenant.services.router_service import OrganizationDatabaseRouter
        has_orig = hasattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration')
        orig_val = getattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration', False)
        OrganizationDatabaseRouter._thread_local.is_tenant_migration = True
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # Acquire advisory lock
                    cursor.execute(f"SELECT pg_advisory_xact_lock({lock_id})")
                    
                    # Validate schema exists
                    cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema_name])
                    if not cursor.fetchone()[0]:
                        raise MigrationError(f"Schema {schema_name} does not exist")
                    
                    cursor.execute(f'SET search_path TO "{schema_name}", public')

                # Fetch or create the migration record in public db
                migration, created = OrganizationMigration.objects.get_or_create(
                    organization_id=organization_id,
                    app_name=app_name,
                    migration_name=migration_name,
                    defaults={'status': 'PENDING'}
                )

                if migration.status == 'COMPLETED':
                    return migration

                migration.mark_started()
                if user:
                    migration.created_by = user
                    migration.save(update_fields=['created_by'])

            start_time = time.time()
            try:
                # Run the actual Django migrate command outside of any outer atomic transaction block
                # to avoid InFailedSqlTransaction errors in PostgreSQL
                from django.db.backends.signals import connection_created
                
                def set_search_path_callback(sender, connection, **kwargs):
                    with connection.cursor() as cursor:
                        cursor.execute(f'SET search_path TO "{schema_name}", public')
                
                connection_created.connect(set_search_path_callback)
                try:
                    call_command('migrate', app_name, migration_name)
                finally:
                    connection_created.disconnect(set_search_path_callback)
                
                execution_time = int((time.time() - start_time) * 1000)
                
                with transaction.atomic():
                    # Refresh from db in case it was modified
                    migration.refresh_from_db()
                    migration.mark_completed(execution_time)
                    
                    # Post-migration verification: check that django_migrations contains it
                    with connection.cursor() as cursor:
                        cursor.execute(f'SET search_path TO "{schema_name}", public')
                        cursor.execute("SELECT 1 FROM django_migrations WHERE app = %s AND name = %s", [app_name, migration_name])
                        verified = cursor.fetchone()
                        if not verified:
                            raise MigrationError(f"Post-migration check failed: migration {app_name}.{migration_name} not found in django_migrations")

                self.logger.info(f"Applied migration {app_name}.{migration_name} for org {organization_id}")
                return migration
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                self.logger.error(f"Migration failed (original error): {str(e)}\n{error_trace}")
                try:
                    with transaction.atomic():
                        # Refresh to clear state and update status to failed
                        migration.refresh_from_db()
                        migration.mark_failed(str(e), error_trace)
                except Exception as save_err:
                    self.logger.error(f"Failed to save failed migration status: {str(save_err)}")
                raise MigrationError(f"Migration failed: {str(e)}")
        finally:
            if has_orig:
                OrganizationDatabaseRouter._thread_local.is_tenant_migration = orig_val
            else:
                if hasattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration'):
                    delattr(OrganizationDatabaseRouter._thread_local, 'is_tenant_migration')

    def preview_migration_sql(self, organization_id, app_name, migration_name):
        import io
        schema_name = self._get_schema_name(organization_id)
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema_name])
            if not cursor.fetchone()[0]:
                raise MigrationError(f"Schema {schema_name} does not exist")
            cursor.execute(f'SET search_path TO "{schema_name}", public')

        out = io.StringIO()
        try:
            call_command('sqlmigrate', app_name, migration_name, stdout=out)
            return out.getvalue()
        except Exception as e:
            raise MigrationError(f"Failed to preview SQL: {str(e)}")

    def get_rollback_target(self, app_name, migration_name):
        executor = MigrationExecutor(connection)
        node = executor.loader.graph.node_map.get((app_name, migration_name))
        if not node:
            return 'zero'
        
        app_parents = [parent.key[1] for parent in node.parents if parent.key[0] == app_name]
        if not app_parents:
            return 'zero'
        return app_parents[0]

    def rollback_migration(self, organization_id, app_name, migration_name, user=None):
        schema_name = self._get_schema_name(organization_id)
        lock_id = hash(str(organization_id)) % 2**31

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT pg_advisory_xact_lock({lock_id})")
                cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema_name])
                if not cursor.fetchone()[0]:
                    raise MigrationError(f"Schema {schema_name} does not exist")
                cursor.execute(f'SET search_path TO "{schema_name}", public')

            try:
                migration_record = OrganizationMigration.objects.get(
                    organization_id=organization_id,
                    app_name=app_name,
                    migration_name=migration_name
                )
            except OrganizationMigration.DoesNotExist:
                raise MigrationError(f"Migration {app_name}.{migration_name} record not found")

            if migration_record.status != 'COMPLETED':
                raise MigrationError(f"Migration {app_name}.{migration_name} is not in COMPLETED status, cannot rollback")

            rollback_target = self.get_rollback_target(app_name, migration_name)
            
            start_time = time.time()
            try:
                call_command('migrate', app_name, rollback_target)
                execution_time = int((time.time() - start_time) * 1000)

                migration_record.status = 'ROLLED_BACK'
                migration_record.is_rollback = True
                migration_record.rolled_back_from = migration_name
                migration_record.completed_at = timezone.now()
                migration_record.execution_time_ms = execution_time
                if user:
                    migration_record.updated_by = user
                migration_record.save()

                # Sync actual migration states
                self.sync_tenant_migrations(organization_id)
                return migration_record
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                migration_record.mark_failed(str(e), error_trace)
                raise MigrationError(f"Rollback failed: {str(e)}")

    def get_migration_status(self, organization_id):
        return OrganizationMigration.objects.by_organization(organization_id)

    def get_pending_migrations(self, organization_id):
        return OrganizationMigration.objects.pending_for_organization(organization_id)