"""
Schema Engine Service - Creates and manages database schemas for tenants.

Handles PostgreSQL schema creation, dropping, and management for multi-tenancy.
"""

import logging
from django.db import connection
from django.conf import settings

logger = logging.getLogger(__name__)


class SchemaEngine:
    """
    Handles database schema operations for tenants.

    What it does:
        - Creates PostgreSQL schemas for new tenants
        - Drops schemas when tenants are deleted
        - Sets search path for tenant queries
        - Manages schema permissions

    Usage:
        engine = SchemaEngine(tenant)
        engine.create_schema()
        engine.drop_schema()
    """

    def __init__(self, tenant):
        """
        Initialize schema engine with tenant.

        Args:
            tenant: Tenant object (must have schema_name)
        """
        self.tenant = tenant
        self.schema_name = self._get_schema_name()
        self.logger = logging.getLogger(f"{__name__}.{tenant.id}")

    def _get_schema_name(self):
        """
        Generate or retrieve schema name from tenant.

        Returns:
            str: Schema name (e.g., 'tenant_abc123')
        """
        if hasattr(self.tenant, 'schema_name') and self.tenant.schema_name:
            return self.tenant.schema_name

        # Generate from tenant ID
        tenant_id = str(self.tenant.id).replace('-', '_')
        return f"tenant_{tenant_id}"

    def create_schema(self):
        """
        Create PostgreSQL schema for tenant.

        Steps:
            1. Check if schema already exists
            2. Create new schema
            3. Set permissions
            4. Update tenant with schema name
        """
        self.logger.info(f"Creating schema: {self.schema_name}")

        # Check if schema already exists
        if self.schema_exists():
            self.logger.warning(f"Schema {self.schema_name} already exists")
            return True

        try:
            with connection.cursor() as cursor:
                # Create schema
                cursor.execute(
                    f'CREATE SCHEMA IF NOT EXISTS "{self.schema_name}"')

                # Grant permissions to application user
                db_user = settings.DATABASES['default']['USER']
                cursor.execute(
                    f'GRANT ALL ON SCHEMA "{self.schema_name}" TO "{db_user}"')

                # Grant usage to public
                cursor.execute(
                    f'GRANT USAGE ON SCHEMA "{self.schema_name}" TO PUBLIC')

            # Update tenant with schema name
            self.tenant.schema_name = self.schema_name
            self.tenant.save(update_fields=['schema_name'])

            self.logger.info(
                f"Schema created successfully: {self.schema_name}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to create schema: {str(e)}")
            raise

    def drop_schema(self, cascade=True):
        """
        Drop PostgreSQL schema for tenant.

        Args:
            cascade: If True, also drop all objects in schema

        Returns:
            bool: True if successful
        """
        self.logger.info(f"Dropping schema: {self.schema_name}")

        if not self.schema_exists():
            self.logger.warning(f"Schema {self.schema_name} does not exist")
            return True

        try:
            with connection.cursor() as cursor:
                cascade_sql = "CASCADE" if cascade else "RESTRICT"
                cursor.execute(
                    f'DROP SCHEMA IF EXISTS "{self.schema_name}" {cascade_sql}')

            self.logger.info(
                f"Schema dropped successfully: {self.schema_name}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to drop schema: {str(e)}")
            raise

    def schema_exists(self):
        """
        Check if schema already exists in database.

        Returns:
            bool: True if schema exists
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS(
                    SELECT 1 FROM information_schema.schemata 
                    WHERE schema_name = %s
                )
            """, [self.schema_name])
            return cursor.fetchone()[0]

    def set_search_path(self):
        """
        Set search path to tenant schema for current connection.

        This ensures all queries go to the correct tenant schema.
        """
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{self.schema_name}", public')

    def get_schema_size(self):
        """
        Get size of schema in MB.

        Returns:
            float: Size in MB
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT pg_size_pretty(
                    SUM(pg_total_relation_size(schemaname || '.' || tablename))
                ) as total_size
                FROM pg_tables
                WHERE schemaname = %s
            """, [self.schema_name])
            result = cursor.fetchone()
            return result[0] if result else "0 bytes"

    def get_table_count(self):
        """
        Get number of tables in schema.

        Returns:
            int: Number of tables
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_schema = %s
            """, [self.schema_name])
            return cursor.fetchone()[0]
