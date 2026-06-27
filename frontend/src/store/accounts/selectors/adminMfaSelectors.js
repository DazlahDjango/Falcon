export const selectAdminMfaState = (state) => state.adminMfa || {};

export const selectSystemSettings = (state) => state.adminMfa?.systemSettings || null;

export const selectSystemSettingsLoading = (state) => state.adminMfa?.systemSettingsLoading || false;

export const selectSystemSettingsError = (state) => state.adminMfa?.systemSettingsError || null;

export const selectSystemSettingsUpdating = (state) => state.adminMfa?.systemSettingsUpdating || false;

export const selectTenantPolicy = (state) => state.adminMfa?.tenantPolicy || null;

export const selectTenantPolicyLoading = (state) => state.adminMfa?.tenantPolicyLoading || false;

export const selectTenantPolicyError = (state) => state.adminMfa?.tenantPolicyError || null;

export const selectTenantPolicyUpdating = (state) => state.adminMfa?.tenantPolicyUpdating || false;

export const selectUsersPolicy = (state) => state.adminMfa?.usersPolicy || [];

export const selectUsersPolicyLoading = (state) => state.adminMfa?.usersPolicyLoading || false;

export const selectUsersPolicyError = (state) => state.adminMfa?.usersPolicyError || null;

export const selectCurrentUserPolicy = (state) => state.adminMfa?.currentUserPolicy || null;

export const selectCurrentUserPolicyLoading = (state) => state.adminMfa?.currentUserPolicyLoading || false;

export const selectCurrentUserPolicyUpdating = (state) => state.adminMfa?.currentUserPolicyUpdating || false;

export const selectUserMFAStatus = (state) => state.adminMfa?.userMFAStatus || null;

export const selectUserMFAStatusLoading = (state) => state.adminMfa?.userMFAStatusLoading || false;

export const selectAdminMFAStatus = (state) => state.adminMfa?.adminMFAStatus || null;

export const selectAdminMFAStatusLoading = (state) => state.adminMfa?.adminMFAStatusLoading || false;

export const selectResettingUserMFA = (state) => state.adminMfa?.resettingUserMFA || false;

export const selectClearingDevices = (state) => state.adminMfa?.clearingDevices || false;

export const selectStepUpVerified = (state) => state.adminMfa?.stepUpVerified || false;

export const selectStepUpVerifying = (state) => state.adminMfa?.stepUpVerifying || false;

export const selectStepUpAction = (state) => state.adminMfa?.stepUpAction || null;

export const selectStepUpExpiresAt = (state) => state.adminMfa?.stepUpExpiresAt || null;

export const selectSyncingPolicy = (state) => state.adminMfa?.syncingPolicy || false;

export const selectAdminMfaUsersFilters = (state) => state.adminMfa?.usersFilters || {};

export const selectAdminMfaUsersPage = (state) => state.adminMfa?.usersPage || 1;

export const selectAdminMfaUsersTotal = (state) => state.adminMfa?.usersTotal || 0;

export const selectTenantMfaRequiredRoles = (state) => {
  const policy = state.adminMfa?.tenantPolicy;
  return policy?.mfa_required_roles || [];
};

export const selectUserMfaEffectiveRequired = (state, userId) => {
  const users = state.adminMfa?.usersPolicy || [];
  const user = users.find(u => u.id === userId);
  return user?.mfa_effective_required || false;
};

export const selectUserMfaOverride = (state, userId) => {
  const users = state.adminMfa?.usersPolicy || [];
  const user = users.find(u => u.id === userId);
  return user?.mfa_required_override || null;
};

export const selectIsStepUpValid = (state) => {
  const verified = state.adminMfa?.stepUpVerified || false;
  const expiresAt = state.adminMfa?.stepUpExpiresAt;
  if (!verified || !expiresAt) return false;
  return new Date(expiresAt) > new Date();
};