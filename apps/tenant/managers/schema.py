# apps/tenant/managers/schema.py
"""
Manager for TenantSchema model.
Provides schema-specific query methods for database schema management.
"""

from django.db import models
from django.utils import timezone
from .base import BaseManager


class SchemaManager(BaseManager):
    """
    Manager for TenantSchema model with schema-specific queries.
    
    Provides methods like:
        - active_schemas()
        - by_schema_name()
        - by_client()
        - pending_schemas()
        - failed_schemas()
        - ready_for_use()
    """
    
    def active_schemas(self):
        """Return only active and ready schemas"""
        return self.active().filter(status='active', is_ready=True)
    
    def by_schema_name(self, schema_name):
        """Get schema by PostgreSQL schema name"""
        try:
            return self.get_queryset().get(schema_name=schema_name, is_deleted=False)
        except self.model.DoesNotExist:
            return None
    
    def by_client(self, client_id):
        """Get schema for a specific client"""
        try:
            return self.get_queryset().get(client_id=client_id, is_deleted=False)
        except self.model.DoesNotExist:
            return None
    
    def pending_schemas(self):
        """Get schemas waiting to be created"""
        return self.active().filter(status='pending')
    
    def failed_schemas(self):
        """Get schemas that failed creation"""
        return self.get_queryset().filter(status='failed', is_deleted=False)
    
    def migrating_schemas(self):
        """Get schemas currently being migrated"""
        return self.get_queryset().filter(status='migrating', is_deleted=False)
    
    def by_status(self, status):
        """Filter schemas by status"""
        return self.get_queryset().filter(status=status, is_deleted=False)
    
    def ready_for_use(self):
        """Get schemas that are ready for tenant operations"""
        return self.active_schemas().filter(is_ready=True)
    
    def with_size_gt(self, size_mb):
        """Get schemas larger than specified size in MB"""
        return self.active().filter(size_mb__gt=size_mb)
    
    def recently_created(self, days=7):
        """Get schemas created in last X days"""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.active().filter(created_at_schema__gte=cutoff)
    
    def needs_cleanup(self):
        """Get schemas marked for deletion or failed"""
        return self.get_queryset().filter(
            models.Q(status='deleted') | models.Q(status='failed'),
            is_deleted=False
        )