# apps/tenant/api/v1/throttles/__init__.py
"""
Rate limiting classes for Tenant API v1.
"""

from .tenant_limits import (
    TenantRateThrottle,
    TenantUserCreationThrottle,
    TenantApiThrottle,
    BurstRateThrottle,
    AdminOperationThrottle,
)

__all__ = [
    'TenantRateThrottle',
    'TenantUserCreationThrottle',
    'TenantApiThrottle',
    'BurstRateThrottle',
    'AdminOperationThrottle',
]
