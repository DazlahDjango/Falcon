# apps/tenant/services/__init__.py
"""
Services for Tenant app.

This file exposes the main service classes for easier importing.
"""

# Provisioning Services
from .provisioning.provisioner import TenantProvisioner
from .provisioning.schema_engine import SchemaEngine
from .provisioning.data_seeder import DataSeeder
from .provisioning.migration_runner import MigrationRunner

# Isolation Services
from .isolation.db_router import TenantDatabaseRouter
from .isolation.isolation_enforcer import IsolationEnforcer
from .isolation.connection_manager import ConnectionManager

# Monitoring Services
from .monitoring.quota_enforcer import QuotaEnforcer
from .monitoring.usage_tracker import UsageTracker
from .monitoring.health_check import HealthCheck

# Domain Services
from .domain.domain_service import DomainService
from .domain.ssl_manager import SSLManager
from .domain.dns_validator import DNSValidator

# Backup Services
from .backup.backup_manager import BackupManager
from .backup.restore_service import RestoreService
from .backup.retention_policy import RetentionPolicy
from .connection_cleanup import ConnectionCleanupScheduler

__all__ = [
    # Provisioning
    'TenantProvisioner',
    'SchemaEngine',
    'DataSeeder',
    'MigrationRunner',

    # Isolation
    'TenantDatabaseRouter',
    'IsolationEnforcer',
    'ConnectionManager',

    # Monitoring
    'QuotaEnforcer',
    'UsageTracker',
    'HealthCheck',

    # Domain
    'DomainService',
    'SSLManager',
    'DNSValidator',

    # Backup
    'BackupManager',
    'RestoreService',
    'RetentionPolicy',

    'ConnectionCleanupScheduler',
]
