"""
Database Router Service - Routes database queries to correct tenant database/schema.

This is CRITICAL for multi-tenancy. It ensures each tenant's data stays isolated.
"""

import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class TenantDatabaseRouter:
    """
    Database router for multi-tenant applications.

    Routes database operations to the correct database or schema based on:
        - Tenant isolation level (shared schema, separate schema, separate database)
        - Current tenant context from request

    How it works:
        1. For SHARED_SCHEMA: Uses same DB but with tenant_id filtering
        2. For SEPARATE_SCHEMA: Switches to tenant-specific PostgreSQL schema
        3. For SEPARATE_DATABASE: Switches to tenant-specific database

    Usage:
        Set in settings.py:
        DATABASE_ROUTERS = ['apps.tenant.services.isolation.db_router.TenantDatabaseRouter']
    """

    # Apps that are global (not tenant-specific)
    GLOBAL_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'django.contrib.sites',
        'axes',
        'django_otp',
        'celery',
        'django_celery_beat',
        'django_celery_results',
        'django_apscheduler',
        'auditlog',
        'health_check',
        'apps.tenant',  # Tenant app itself is global
        'apps.core',
    ]

    # Tenant-specific apps (data that belongs to tenants)
    TENANT_APPS = [
        'apps.accounts',
        'apps.organisations',
        'apps.kpi',
        'apps.dashboard',
        'apps.reviews',
        'apps.workflowsapi',
        'apps.reports',
        'apps.mission',
        'apps.tasks_module',
        'apps.notifications',
    ]

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._tenant_cache = {}

    def _get_tenant_db(self, tenant_id):
        """
        Get database name for a specific tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            str: Database name or None for default
        """
        # For separate database isolation
        from apps.tenant.models import Client
        from apps.tenant.constants import SchemaType

        try:
            # Check cache
            if tenant_id in self._tenant_cache:
                return self._tenant_cache[tenant_id]

            tenant = Client.objects.only(
                'schema_type', 'database_name').get(id=tenant_id)

            if tenant.schema_type == SchemaType.SEPARATE_DATABASE:
                db_name = tenant.database_name or f"tenant_{tenant.id}"
                self._tenant_cache[tenant_id] = db_name
                return db_name

        except Exception as e:
            self.logger.warning(
                f"Failed to get tenant DB for {tenant_id}: {e}")

        return 'default'

    def _get_current_tenant_id(self, model, **hints):
        """
        Extract current tenant ID from model or hints.

        Priority:
            1. hints['tenant_id']
            2. model.tenant_id (if model has it)
            3. model.tenant.id (if model has tenant FK)
        """
        # Check hints first
        if 'tenant_id' in hints:
            return hints['tenant_id']

        if 'instance' in hints:
            instance = hints['instance']
            if hasattr(instance, 'tenant_id') and instance.tenant_id:
                return instance.tenant_id
            if hasattr(instance, 'tenant') and instance.tenant:
                return instance.tenant.id

        return None

    def db_for_read(self, model, **hints):
        """
        Route read operations to appropriate database.
        Called for SELECT queries.
        """
        app_label = model._meta.app_label

        # Global apps always use default database
        if app_label in self.GLOBAL_APPS:
            return 'default'

        # Tenant apps need routing
        tenant_id = self._get_current_tenant_id(model, **hints)

        if tenant_id:
            return self._get_tenant_db(tenant_id)

        # Default to default database
        return 'default'

    def db_for_write(self, model, **hints):
        """
        Route write operations to appropriate database.
        Called for INSERT, UPDATE, DELETE queries.
        """
        app_label = model._meta.app_label

        # Global apps always use default database
        if app_label in self.GLOBAL_APPS:
            return 'default'

        # Tenant apps need routing
        tenant_id = self._get_current_tenant_id(model, **hints)

        if tenant_id:
            return self._get_tenant_db(tenant_id)

        # Default to default database
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects only if they are in same tenant.
        Prevents cross-tenant relationships.
        """
        # Get tenant for both objects
        tenant1 = self._get_object_tenant(obj1)
        tenant2 = self._get_object_tenant(obj2)

        # If both have tenant and they are different, deny relation
        if tenant1 and tenant2 and tenant1 != tenant2:
            return False

        # Allow relation for global objects or same tenant
        return True

    def _get_object_tenant(self, obj):
        """Extract tenant ID from object."""
        if hasattr(obj, 'tenant_id') and obj.tenant_id:
            return obj.tenant_id
        if hasattr(obj, 'tenant') and obj.tenant:
            return obj.tenant.id
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Control which migrations run on which database.

        - Global apps only migrate on 'default'
        - Tenant apps can migrate on tenant databases
        """
        # Global apps only on default
        if app_label in self.GLOBAL_APPS:
            return db == 'default'

        # Tenant apps can migrate on tenant databases
        if app_label in self.TENANT_APPS:
            # Allow on default and tenant databases
            return db == 'default' or db.startswith('tenant_')

        # Default behavior
        return db == 'default'
