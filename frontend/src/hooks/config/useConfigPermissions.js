import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useConfigPermissions = () => {
  const userRole = useSelector((state) => state.auth?.user?.role);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const permissions = useMemo(() => {
    if (!isAuthenticated) {
      return {
        canAccessConfig: false,
        isSuperAdmin: false,
        isClientAdmin: false,
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
        canPartialMaintenance: false
      };
    }

    const isSuperAdmin = userRole === 'super_admin';
    const isClientAdmin = userRole === 'client_admin';

    return {
      canAccessConfig: isSuperAdmin || isClientAdmin,
      isSuperAdmin,
      isClientAdmin,
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
      canPartialMaintenance: isSuperAdmin || isClientAdmin
    };
  }, [userRole, isAuthenticated]);

  return permissions;
};