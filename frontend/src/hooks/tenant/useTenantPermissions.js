// src/hooks/tenant/useTenantPermissions.js
// Hook for Tenant App permission checks

import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useTenantPermissions = () => {
  // Get user from AuthContext
  const { user, isAuthenticated } = useAuthContext();

  const permissionsData = useMemo(() => {
    const role = user?.role || 'staff';
    
    // Role calculations
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = isSuperAdmin || role === 'client_admin';

    // Permissions
    const permissions = {
      canAccessTenantApp: isSuperAdmin || isClientAdmin,
      
      // Super Admin Only Permissions
      canViewAllTenants: isSuperAdmin,
      canCreateTenant: isSuperAdmin,
      canEditAnyTenant: isSuperAdmin,
      canManagePlatformSettings: isSuperAdmin,
      canManageConnections: isSuperAdmin,
      canViewConnectionMetrics: isSuperAdmin,
      canViewConnectionHealth: isSuperAdmin,
      canViewTenantResources: isSuperAdmin,
      canManageTenantBackups: isSuperAdmin,
      canManageTenantMigrations: isSuperAdmin,
      canViewTenantSchema: isSuperAdmin,
      canManageTenantDomains: isSuperAdmin,
      canManageTenantProvisioning: isSuperAdmin,
      canViewTenantAuditLogs: isSuperAdmin,
      
      // Client Admin (Own Tenant Only)
      canViewOwnTenantOverview: isClientAdmin,
      canEditOwnTenant: isClientAdmin,
      canViewOwnTenantUsage: isClientAdmin,
      canViewOwnTenantSettings: isClientAdmin,
    };

    return {
      user,
      role,
      isAuthenticated,
      isSuperAdmin,
      isClientAdmin,
      permissions,
      hasAnyRole: (roles) => roles.includes(role),
      hasAllRoles: (roles) => roles.every((r) => r === role),
      can: (permission) => permissions[permission] || false,
    };
  }, [user, isAuthenticated]);

  return permissionsData;
};

export default useTenantPermissions;
