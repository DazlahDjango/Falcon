from .base import BasePermission, IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .roles import IsSuperAdmin, IsClientAdmin, IsExecutive, IsSupervisor, IsStaff, IsDashboardChampion, HasRole, HasAnyRole, IsAdminOrExecutive, IsAdminOrSupervisor, IsManagement, IsReadOnly
from .tenant import IsTenantMember, IsTenantAdmin, IsSameTenant, CanAccessTenantData
from .objects import CanAccessUser, CanAccessProfile, CanManageUser, CanAssignRole, IsOwner, IsManagerOf
from .custom import HasPermission, HasObjectPermission, CanViewKPIDashboard, CanValidateKPIs, CanManageTeam, CanExportReports

__all__ = [
    # Base
    'BasePermission', 'IsAuthenticated', 'IsAuthenticatedOrReadOnly', 'AllowAny',
    # Roles
    'IsSuperAdmin', 'IsClientAdmin', 'IsExecutive', 'IsSupervisor', 'IsStaff', 'IsDashboardChampion', 'HasRole', 'HasAnyRole', 'IsAdminOrExecutive', 'IsAdminOrSupervisor', 'IsManagement', 'IsReadOnly',
    # Tenant
    'IsTenantMember', 'IsTenantAdmin', 'IsSameTenant', 'CanAccessTenantData',
    # Objects
    'CanAccessUser', 'CanAccessProfile', 'CanManageUser', 'CanAssignRole', 'IsOwner', 'IsManagerOf',
    # Custom
    'HasPermission', 'HasObjectPermission', 'CanViewKPIDashboard', 'CanValidateKPIs', 'CanManageTeam', 'CanExportReports',
]