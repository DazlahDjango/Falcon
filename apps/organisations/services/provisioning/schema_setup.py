"""
Schema Setup Service - Handles database schema setup for new tenants
"""

import logging
from django.db import connection
from django.core.management import call_command

logger = logging.getLogger(__name__)


class SchemaSetupService:
    """
    Service for setting up database schema for new organisations
    """
    
    @classmethod
    def setup_tenant_schema(cls, organisation):
        """
        Set up database schema for a new tenant
        For shared-database multi-tenancy, this creates necessary schema isolation
        """
        try:
            # For PostgreSQL, create a new schema
            schema_name = f"tenant_{organisation.slug.replace('-', '_')}"
            
            with connection.cursor() as cursor:
                cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"')
                logger.info(f"Created schema: {schema_name}")
            
            # Set search path for this tenant
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{schema_name}", public')
            
            # Run migrations for this schema
            call_command('migrate', database='default', schema=schema_name)
            
            logger.info(f"Schema setup completed for: {organisation.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup schema for {organisation.name}: {e}")
            return False
    
    @classmethod
    def setup_row_level_security(cls, organisation):
        """
        Set up row-level security for the tenant
        """
        try:
            with connection.cursor() as cursor:
                # Enable RLS on tables
                cursor.execute("""
                    ALTER TABLE organisations_organisation ENABLE ROW LEVEL SECURITY;
                    ALTER TABLE organisations_organisation FORCE ROW LEVEL SECURITY;
                    
                    CREATE POLICY tenant_isolation_policy ON organisations_organisation
                    USING (id = %s);
                """, [organisation.id])
            
            logger.info(f"Row-level security setup for: {organisation.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup RLS for {organisation.name}: {e}")
            return False