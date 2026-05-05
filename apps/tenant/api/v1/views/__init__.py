# apps/tenant/api/v1/views/__init__.py
"""
Views for Tenant API v1.
"""

from .tenant_admin import (
    TenantViewSet,
    TenantSuspendView,
    TenantActivateView,
    TenantProvisioningStatusView,
    TenantUsageView,
    TenantResourcesView,
)
from .domain_views import (
    DomainViewSet,
    DomainVerifyView,
    DomainSetPrimaryView,
    TenantDomainsView,
)
from .backup_views import (
    BackupViewSet,
    BackupRestoreView,
    BackupDownloadView,
    TenantBackupsView,
)
from .schema_views import SchemaViewSet, TenantSchemaView
from .migration_views import MigrationViewSet, TenantMigrationsView
from .health_views import (
    HealthCheckView,
    TenantsHealthView,
    DatabaseHealthView,
    CacheHealthView,
    SystemHealthView,
)
from .connection import ConnectionPoolViewSet

__all__ = [
    # Tenant
    'TenantViewSet',
    'TenantSuspendView',
    'TenantActivateView',
    'TenantProvisioningStatusView',
    'TenantUsageView',
    'TenantResourcesView',
    # Domain
    'DomainViewSet',
    'DomainVerifyView',
    'DomainSetPrimaryView',
    'TenantDomainsView',
    # Backup
    'BackupViewSet',
    'BackupRestoreView',
    'BackupDownloadView',
    'TenantBackupsView',
    # Schema
    'SchemaViewSet',
    'TenantSchemaView',
    # Migration
    'MigrationViewSet',
    'TenantMigrationsView',
    # Health
    'HealthCheckView',
    'TenantsHealthView',
    'DatabaseHealthView',
    'CacheHealthView',
    'SystemHealthView',
    # Connection
    'ConnectionPoolViewSet',
]
