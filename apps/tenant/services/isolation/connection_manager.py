"""
Connection Manager Service - Manages database connections for tenants.

Handles connection pooling, connection lifecycle, and tenant-specific connections.
"""

import logging
from datetime import datetime, timedelta
from django.db import connections
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages database connections for multi-tenant setups.

    What it does:
        - Creates and caches connections per tenant
        - Handles connection pooling
        - Manages connection lifecycle (open, close, idle timeouts)
        - Tracks connection usage for monitoring

    Usage:
        manager = ConnectionManager()
        conn = manager.get_connection(tenant_id)
        manager.release_connection(tenant_id, conn)
        manager.close_idle_connections()
    """

    def __init__(self):
        """Initialize connection manager with cache and tracking."""
        self._connections = {}  # tenant_id -> connection
        self._connection_timestamps = {}  # tenant_id -> last_used
        self.logger = logging.getLogger(__name__)

    def get_connection(self, tenant_id):
        """
        Get database connection for a tenant.

        Creates a new connection if one doesn't exist or is stale.

        Args:
            tenant_id: UUID of tenant

        Returns:
            Database connection object
        """
        self.logger.debug(f"Getting connection for tenant: {tenant_id}")

        # Check if we have a cached connection
        if tenant_id in self._connections:
            conn = self._connections[tenant_id]

            # Verify connection is still alive
            if self._is_connection_alive(conn):
                self._update_timestamp(tenant_id)
                return conn
            else:
                # Connection dead, remove and create new
                self._remove_connection(tenant_id)

        # Create new connection
        return self._create_connection(tenant_id)

    def _create_connection(self, tenant_id):
        """
        Create a new database connection for tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            New database connection
        """
        from apps.tenant.models import Client

        self.logger.info(f"Creating new connection for tenant: {tenant_id}")

        try:
            # Get tenant to determine connection parameters
            tenant = Client.objects.get(id=tenant_id)

            # For separate database isolation
            if tenant.database_name:
                # Add tenant database to Django connections if not exists
                db_name = f"tenant_{tenant_id}"
                if db_name not in connections.databases:
                    self._register_tenant_database(tenant, db_name)

                conn = connections[db_name]
                conn.ensure_connection()

            else:
                # Use default connection with schema path
                conn = connections['default']
                conn.ensure_connection()

                # Set search path for schema isolation
                if tenant.schema_name:
                    with conn.cursor() as cursor:
                        cursor.execute(
                            f'SET search_path TO "{tenant.schema_name}", public')

            # Cache the connection
            self._connections[tenant_id] = conn
            self._update_timestamp(tenant_id)

            # Record connection in database
            self._record_connection(tenant_id)

            return conn

        except Client.DoesNotExist:
            self.logger.error(f"Tenant not found: {tenant_id}")
            raise
        except Exception as e:
            self.logger.error(
                f"Failed to create connection for {tenant_id}: {str(e)}")
            raise

    def _register_tenant_database(self, tenant, db_name):
        """
        Register a tenant database in Django's connections.

        Args:
            tenant: Tenant object
            db_name: Name for this database connection
        """
        default_config = settings.DATABASES['default']

        # Create new database config based on tenant
        tenant_config = default_config.copy()
        tenant_config['NAME'] = tenant.database_name
        tenant_config['USER'] = tenant.database_user or default_config['USER']
        tenant_config['PASSWORD'] = tenant.database_password or default_config['PASSWORD']
        tenant_config['HOST'] = tenant.database_host or default_config.get(
            'HOST')
        tenant_config['PORT'] = tenant.database_port or default_config.get(
            'PORT')

        # Register in Django's connections
        connections.databases[db_name] = tenant_config

        self.logger.info(
            f"Registered database {db_name} for tenant {tenant.id}")

    def _is_connection_alive(self, connection):
        """
        Check if a database connection is still alive.

        Args:
            connection: Database connection to check

        Returns:
            bool: True if connection is alive
        """
        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                return True
        except Exception:
            return False

    def _update_timestamp(self, tenant_id):
        """Update last used timestamp for a connection."""
        self._connection_timestamps[tenant_id] = timezone.now()

    def _remove_connection(self, tenant_id):
        """
        Remove cached connection for tenant.

        Args:
            tenant_id: UUID of tenant
        """
        if tenant_id in self._connections:
            try:
                conn = self._connections[tenant_id]
                conn.close()
            except Exception as e:
                self.logger.warning(f"Error closing connection: {e}")
            finally:
                del self._connections[tenant_id]
                if tenant_id in self._connection_timestamps:
                    del self._connection_timestamps[tenant_id]

    def _record_connection(self, tenant_id):
        """
        Record connection in database for tracking.

        Args:
            tenant_id: UUID of tenant
        """
        try:
            from apps.tenant.models import ConnectionPool
            from apps.tenant.constants import ConnectionStatus

            ConnectionPool.objects.create(
                tenant_id=tenant_id,
                connection_id=f"conn_{tenant_id}_{int(timezone.now().timestamp())}",
                status=ConnectionStatus.ACTIVE,
                connected_at=timezone.now(),
                last_used_at=timezone.now(),
            )
        except Exception as e:
            self.logger.warning(f"Failed to record connection: {str(e)}")

    def release_connection(self, tenant_id, connection=None):
        """
        Release a connection back to pool (mark as idle).

        Args:
            tenant_id: UUID of tenant
            connection: Connection to release (optional)
        """
        self.logger.debug(f"Releasing connection for tenant: {tenant_id}")

        if tenant_id in self._connections:
            self._connection_timestamps[tenant_id] = timezone.now()

            # Update status in database
            try:
                from apps.tenant.models import ConnectionPool
                from apps.tenant.constants import ConnectionStatus

                ConnectionPool.objects.filter(
                    tenant_id=tenant_id,
                    status=ConnectionStatus.ACTIVE
                ).exclude(
                    status=ConnectionStatus.IDLE
                ).update(
                    status=ConnectionStatus.IDLE,
                    last_used_at=timezone.now()
                )
            except Exception as e:
                self.logger.warning(
                    f"Failed to update connection status: {str(e)}")

    def close_connection(self, tenant_id):
        """
        Close and remove connection for tenant.

        Args:
            tenant_id: UUID of tenant
        """
        self.logger.info(f"Closing connection for tenant: {tenant_id}")
        self._remove_connection(tenant_id)

        # Update status to closed
        try:
            from apps.tenant.models import ConnectionPool
            from apps.tenant.constants import ConnectionStatus

            ConnectionPool.objects.filter(
                tenant_id=tenant_id
            ).order_by('-created_at').first().update(
                status=ConnectionStatus.CLOSED,
                closed_at=timezone.now()
            )
        except Exception as e:
            self.logger.warning(f"Failed to update closed status: {str(e)}")

    def close_idle_connections(self, idle_minutes=30):
        """
        Close connections that have been idle for too long.

        Args:
            idle_minutes: Minutes of inactivity before closing (default 30)

        Returns:
            int: Number of connections closed
        """
        cutoff = timezone.now() - timedelta(minutes=idle_minutes)
        closed_count = 0

        for tenant_id, last_used in list(self._connection_timestamps.items()):
            if last_used < cutoff:
                self.logger.info(
                    f"Closing idle connection for tenant {tenant_id}")
                self.close_connection(tenant_id)
                closed_count += 1

        return closed_count

    def get_active_connections_count(self):
        """
        Get number of active connections.

        Returns:
            int: Number of active connections
        """
        return len(self._connections)

    def get_idle_connections_count(self):
        """
        Get number of idle connections.

        Returns:
            int: Number of idle connections
        """
        cutoff = timezone.now() - timedelta(minutes=5)
        return sum(1 for last_used in self._connection_timestamps.values() if last_used < cutoff)

    def close_all_connections(self):
        """
        Close all managed connections.

        Returns:
            int: Number of connections closed
        """
        count = len(self._connections)
        self.logger.info(f"Closing all connections: {count}")

        for tenant_id in list(self._connections.keys()):
            self.close_connection(tenant_id)

        return count

    def get_connection_status(self, tenant_id):
        """
        Get status of connection for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Connection status information
        """
        is_connected = tenant_id in self._connections
        last_used = self._connection_timestamps.get(tenant_id)

        return {
            'tenant_id': str(tenant_id),
            'is_connected': is_connected,
            'last_used_at': last_used.isoformat() if last_used else None,
            'idle_minutes': None if not last_used else
            (timezone.now() - last_used).total_seconds() / 60,
        }

    def get_all_connection_statuses(self):
        """
        Get status of all managed connections.

        Returns:
            dict: Status for all connections
        """
        return {
            str(tenant_id): self.get_connection_status(tenant_id)
            for tenant_id in self._connections.keys()
        }
