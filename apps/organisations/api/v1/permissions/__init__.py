"""
Permissions for organisations API v1
"""

from .is_super_admin import IsSuperAdmin
from .is_client_admin import IsClientAdmin
from .can_view_tenant import CanViewTenant

__all__ = [
    'IsSuperAdmin',
    'IsClientAdmin',
    'CanViewTenant',
]