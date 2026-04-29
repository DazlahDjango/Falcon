# apps/tenant/api/v1/serializers/__init__.py
"""
Serializers for Tenant API v1.
"""

from .tenant import (
    TenantSerializer,
    TenantCreateSerializer,
    TenantUpdateSerializer,
    TenantDetailSerializer,
    TenantListSerializer,
)
from .domain import (
    DomainSerializer,
    DomainCreateSerializer,
    DomainVerifySerializer,
    DomainDetailSerializer,
)
from .backup import (
    BackupSerializer,
    BackupCreateSerializer,
    BackupDetailSerializer,
)
from .resource import (
    ResourceSerializer,
    ResourceUpdateSerializer,
    ResourceBulkUpdateSerializer,
    ResourceSummarySerializer,
)
from .schema import (
    SchemaSerializer,
    SchemaDetailSerializer,
)
from .migration import (
    MigrationSerializer,
    MigrationDetailSerializer,
    MigrationRunSerializer,
)

__all__ = [
    # Tenant
    'TenantSerializer',
    'TenantCreateSerializer',
    'TenantUpdateSerializer',
    'TenantDetailSerializer',
    'TenantListSerializer',
    # Domain
    'DomainSerializer',
    'DomainCreateSerializer',
    'DomainVerifySerializer',
    'DomainDetailSerializer',
    # Backup
    'BackupSerializer',
    'BackupCreateSerializer',
    'BackupDetailSerializer',
    # Resource
    'ResourceSerializer',
    'ResourceUpdateSerializer',
    'ResourceBulkUpdateSerializer',
    'ResourceSummarySerializer',
    # Schema
    'SchemaSerializer',
    'SchemaDetailSerializer',
    # Migration
    'MigrationSerializer',
    'MigrationDetailSerializer',
    'MigrationRunSerializer',
]
