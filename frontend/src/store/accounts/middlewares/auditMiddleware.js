const isDevelopment = import.meta.env.MODE === 'development';

const AUDIT_ACTIONS = [
  'auth/login',
  'auth/logout',
  'auth/register',
  'users/createUser',
  'users/updateUser',
  'users/deleteUser',
  'users/activateUser',
  'users/deactivateUser',
  'users/assignUserRole',
  'profiles/updateProfile',
  'profiles/uploadAvatar',
  'profiles/deleteAvatar',
  'profiles/addSkill',
  'profiles/removeSkill',
  'roles/createRole',
  'roles/updateRole',
  'roles/deleteRole',
  'roles/assignPermissions',
  'admin/createAdminUser',
  'admin/updateAdminUser',
  'admin/deleteAdminUser',
  'admin/impersonateUser',
  'admin/createAdminRole',
  'admin/updateAdminRole',
  'admin/deleteAdminRole',
  'admin/createAdminTenant',
  'admin/updateAdminTenant',
  'admin/deleteAdminTenant',
  'admin/suspendTenant',
  'admin/activateTenant',
  'admin/initSystemRoles',
  'admin/initPermissions',
  'adminMfa/resetUserMFA',
  'adminMfa/clearUserDevices',
  'adminMfa/updateUserMFAOverride',
  'adminMfa/clearUserMFAOverride',
  'mfa/setupTOTP',
  'mfa/verifyTOTPSetup',
  'mfa/disableMFA',
  'mfa/generateBackupCodes',
  'mfa/setPrimaryDevice',
  'preferences/updateMyPreferences',
  'preferences/updateMyTenantPreferences',
  'preferences/updateBranding',
  'systemSettings/updateSystemSettings',
  'systemSettings/resetSystemSettings',
  'systemSettings/syncPolicy',
  'sessions/terminateSession',
  'sessions/terminateAllSessions',
  'sessions/blacklistToken',
  'security/updateTenantMFAPolicy',
  'security/updateUserMFAPolicy',
  'security/clearUserMFAOverride',
];

const isAuditAction = (action) => {
  if (!action?.type) return false;
  const baseType = action.type.replace(/\/\w+$/, '');
  return AUDIT_ACTIONS.some((auditAction) => baseType === auditAction || baseType.startsWith(auditAction));
};

const getAuditMetadata = (action, state) => {
  const metadata = {
    actionType: action.type,
    timestamp: new Date().toISOString(),
    userId: state.auth?.user?.id || null,
    tenantId: state.auth?.user?.tenant_id || null,
    userEmail: state.auth?.user?.email || null,
  };

  if (action.payload) {
    metadata.payload = action.payload;
  }

  if (action.meta?.arg) {
    metadata.arguments = action.meta.arg;
  }

  return metadata;
};

export const auditMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (isDevelopment) {
    return result;
  }

  if (action.type?.endsWith('/fulfilled') && isAuditAction(action)) {
    const state = store.getState();
    const metadata = getAuditMetadata(action, state);

    if (typeof window !== 'undefined' && window.auditLogger) {
      window.auditLogger.log(metadata);
    }

    try {
      const auditLog = {
        action: action.type,
        timestamp: metadata.timestamp,
        userId: metadata.userId,
        tenantId: metadata.tenantId,
        status: 'success',
        details: metadata,
      };
      console.log('[AUDIT]', auditLog);
    } catch (error) {
      console.error('[AUDIT ERROR]', error);
    }
  }

  if (action.type?.endsWith('/rejected') && isAuditAction(action)) {
    const state = store.getState();
    const metadata = getAuditMetadata(action, state);
    metadata.error = action.payload || action.error;

    try {
      const auditLog = {
        action: action.type,
        timestamp: metadata.timestamp,
        userId: metadata.userId,
        tenantId: metadata.tenantId,
        status: 'failed',
        details: metadata,
        error: metadata.error,
      };
      console.log('[AUDIT]', auditLog);
    } catch (error) {
      console.error('[AUDIT ERROR]', error);
    }
  }

  return result;
};