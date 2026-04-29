"""
Migration Runner Service - Runs Django migrations for tenant schemas.

Handles applying and tracking migrations for multi-tenant setups.
"""

import logging
import time
from django.db import connection
from django.core.management import call_command
from django.utils import timezone

logger = logging.getLogger(__name__)


class MigrationRunner:
    """
    Runs and tracks migrations for tenant schemas.

    What it does:
        - Applies migrations to tenant schema
        - Tracks which migrations have been applied
        - Handles migration failures and rollbacks
        - Supports per-tenant migration tracking

    Usage:
        runner = MigrationRunner(tenant)
        runner.run_migrations()
        runner.run_migrations_for_app('kpi')
    """

    def __init__(self, tenant):
        """
        Initialize migration runner with tenant.

        Args:
            tenant: Tenant object
        """
        self.tenant = tenant
        self.schema_name = getattr(tenant, 'schema_name', None)
        self.logger = logging.getLogger(f"{__name__}.{tenant.id}")

    def run_migrations(self, app_name=None):
        """
        Run migrations for tenant schema.

        Args:
            app_name: Specific app to migrate (None = all apps)

        Returns:
            bool: True if successful
        """
        self.logger.info(f"Running migrations for tenant: {self.tenant.name}")

        try:
            # Switch to tenant schema if using separate schemas
            if self.schema_name:
                self._set_search_path()

            # Run migrations
            if app_name:
                call_command('migrate', app_name)
            else:
                call_command('migrate')

            # Record migration
            self._record_migration(app_name)

            self.logger.info(
                f"Migrations completed for tenant: {self.tenant.name}")
            return True

        except Exception as e:
            self.logger.error(f"Migrations failed: {str(e)}")
            self._record_failed_migration(app_name, str(e))
            raise

    def run_migrations_for_app(self, app_name):
        """
        Run migrations for a specific app only.

        Args:
            app_name: Django app name (e.g., 'kpi', 'accounts')
        """
        return self.run_migrations(app_name)

    def _set_search_path(self):
        """Set database search path to tenant schema."""
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{self.schema_name}", public')

    def _record_migration(self, app_name):
        """
        Record successful migration in database.

        Args:
            app_name: Name of app migrated
        """
        try:
            from apps.tenant.models import TenantMigration
            from apps.tenant.constants import MigrationStatus

            TenantMigration.objects.create(
                tenant_id=self.tenant.id,
                migration_name='all_migrations',
                app_name=app_name or 'all',
                status=MigrationStatus.COMPLETED,
                completed_at=timezone.now(),
                execution_time_ms=0,
            )
        except Exception as e:
            self.logger.warning(f"Failed to record migration: {str(e)}")

    def _record_failed_migration(self, app_name, error_message):
        """
        Record failed migration in database.

        Args:
            app_name: Name of app that failed
            error_message: Error description
        """
        try:
            from apps.tenant.models import TenantMigration
            from apps.tenant.constants import MigrationStatus

            TenantMigration.objects.create(
                tenant_id=self.tenant.id,
                migration_name='failed_migration',
                app_name=app_name or 'all',
                status=MigrationStatus.FAILED,
                error_message=error_message,
                completed_at=timezone.now(),
            )
        except Exception as e:
            self.logger.warning(f"Failed to record failed migration: {str(e)}")

    def get_pending_migrations(self):
        """
        Get list of pending migrations for tenant.

        Returns:
            list: Names of pending migrations
        """
        from django.db.migrations.executor import MigrationExecutor

        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())

        if self.schema_name:
            self._set_search_path()

        return [migration[0].name for migration in plan]

    def migration_status(self):
        """
        Get overall migration status for tenant.

        Returns:
            dict: Status information
        """
        pending = self.get_pending_migrations()

        return {
            'tenant_id': str(self.tenant.id),
            'tenant_name': self.tenant.name,
            'schema_name': self.schema_name,
            'pending_migrations': len(pending),
            'pending_list': pending,
            'is_up_to_date': len(pending) == 0,
        }

    def rollback_migration(self, migration_name):
        """
        Rollback a specific migration.

        Args:
            migration_name: Name of migration to rollback

        Returns:
            bool: True if successful
        """
        self.logger.info(f"Rolling back migration {migration_name}")

        try:
            if self.schema_name:
                self._set_search_path()

            call_command('migrate', app_name, migration_name)

            self.logger.info(f"Rollback completed: {migration_name}")
            return True

        except Exception as e:
            self.logger.error(f"Rollback failed: {str(e)}")
            raise
