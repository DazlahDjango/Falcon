# apps/tenant/api/v1/permissions/__init__.py
"""
Permissions for Tenant API v1.
"""

from .tenant_permissions import (
    IsSuperAdmin,
    IsTenantAdmin,
    IsTenantUser,
    CanManageTenant,
    CanViewTenant,
    CanManageDomain,
    CanManageBackup,
    CanViewResource,
    IsAuthenticatedOrReadOnlyForTenant,
)
from .tenant_access import (
    HasTenantAccess,
    IsSameTenant,
    TenantHeaderRequired,
    AllowTenantCreation,
    IsTenantOwner,
)

__all__ = [
    # Tenant permissions
    'IsSuperAdmin',
    'IsTenantAdmin',
    'IsTenantUser',
    'CanManageTenant',
    'CanViewTenant',
    'CanManageDomain',
    'CanManageBackup',
    'CanViewResource',
    'IsAuthenticatedOrReadOnlyForTenant',
    # Access control
    'HasTenantAccess',
    'IsSameTenant',
    'TenantHeaderRequired',
    'AllowTenantCreation',
    'IsTenantOwner',
]
