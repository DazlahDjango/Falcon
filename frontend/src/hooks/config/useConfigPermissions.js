import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

export const useConfigPermissions = () => {
  // Get user from AuthContext
  const { user, isAuthenticated } = useAuthContext();

  const permissions = useMemo(() => {
    if (!isAuthenticated) {
      return {
        user,
        role: null,
        isAuthenticated,
        isSuperAdmin: false,
        isClientAdmin: false,
        canAccessConfig: false,
        canTriggerBackup: false,
        canCancelBackup: false,
        canRestoreBackup: false,
        canDeleteBackup: false,
        canScheduleMaintenance: false,
        canStartMaintenance: false,
        canStopMaintenance: false,
        canExecuteDR: false,
        canRunDRDrill: false,
        canFailover: false,
        canFailback: false,
        canModifyQuota: false,
        canRotateKeys: false,
        canViewAuditLogs: false,
        canFullMaintenance: false,
        canPartialMaintenance: false,
        canManageRegistry: false,
        canSyncRegistry: false,
        canEditRegistryDeps: false,
        canModifySystemSettings: false,
      };
    }

    const role = user?.role || 'staff';
    const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
    const isClientAdmin = isSuperAdmin || role === 'client_admin';

    return {
      user,
      role,
      isAuthenticated,
      isSuperAdmin,
      isClientAdmin,
      canAccessConfig: isSuperAdmin || isClientAdmin,
      canModifySystemSettings: isSuperAdmin,
      canManageRegistry: isSuperAdmin,
      canSyncRegistry: isSuperAdmin,
      canEditRegistryDeps: isSuperAdmin,
      canTriggerBackup: isSuperAdmin || isClientAdmin,
      canCancelBackup: isSuperAdmin || isClientAdmin,
      canRestoreBackup: isSuperAdmin || isClientAdmin,
      canDeleteBackup: isSuperAdmin,
      canScheduleMaintenance: isSuperAdmin || isClientAdmin,
      canStartMaintenance: isSuperAdmin || isClientAdmin,
      canStopMaintenance: isSuperAdmin || isClientAdmin,
      canExecuteDR: isSuperAdmin,
      canRunDRDrill: isSuperAdmin,
      canFailover: isSuperAdmin,
      canFailback: isSuperAdmin,
      canModifyQuota: isSuperAdmin,
      canRotateKeys: isSuperAdmin,
      canViewAuditLogs: isSuperAdmin,
      canFullMaintenance: isSuperAdmin,
      canPartialMaintenance: isSuperAdmin || isClientAdmin,
    };
  }, [user, isAuthenticated]);

  // Debug logs
  if (import.meta.env.DEV && user) {
    console.log('[Config Permissions]', {
      role: permissions.role,
      isSuperAdmin: permissions.isSuperAdmin,
      isClientAdmin: permissions.isClientAdmin,
    });
  }

  return permissions;
};
