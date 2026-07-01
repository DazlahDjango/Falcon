import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
  syncAllTenantsPolicy,
  fetchTenantMFAPolicy,
  updateTenantMFAPolicy,
  fetchAllUsersMFAPolicy,
  fetchUserMFAPolicy,
  updateUserMFAOverride,
  clearUserMFAOverride,
  fetchUserMFAStatus,
  resetUserMFA,
  clearUserDevices,
  fetchAdminMFAStatus,
  verifyStepUp,
  setAdminMfaUsersFilters,
  setAdminMfaUsersPage,
  clearAdminMfaErrors,
  clearStepUpVerification,
} from '../../store/accounts/slice/adminMfaSlice';
import {
  selectSystemSettings,
  selectSystemSettingsLoading,
  selectSystemSettingsError,
  selectSystemSettingsUpdating,
  selectTenantPolicy,
  selectTenantPolicyLoading,
  selectTenantPolicyError,
  selectTenantPolicyUpdating,
  selectUsersPolicy,
  selectUsersPolicyLoading,
  selectUsersPolicyError,
  selectCurrentUserPolicy,
  selectCurrentUserPolicyLoading,
  selectCurrentUserPolicyUpdating,
  selectUserMFAStatus,
  selectUserMFAStatusLoading,
  selectAdminMFAStatus,
  selectAdminMFAStatusLoading,
  selectResettingUserMFA,
  selectClearingDevices,
  selectStepUpVerified,
  selectStepUpVerifying,
  selectStepUpAction,
  selectStepUpExpiresAt,
  selectSyncingPolicy,
  selectAdminMfaUsersFilters,
  selectAdminMfaUsersPage,
  selectAdminMfaUsersTotal,
  selectTenantMfaRequiredRoles,
  selectUserMfaEffectiveRequired,
  selectUserMfaOverride,
  selectIsStepUpValid,
} from '../../store/accounts/selectors/adminMfaSelectors';

export const useAdminMFA = () => {
  const dispatch = useDispatch();
  const systemSettings = useSelector(selectSystemSettings);
  const systemSettingsLoading = useSelector(selectSystemSettingsLoading);
  const systemSettingsError = useSelector(selectSystemSettingsError);
  const systemSettingsUpdating = useSelector(selectSystemSettingsUpdating);
  const tenantPolicy = useSelector(selectTenantPolicy);
  const tenantPolicyLoading = useSelector(selectTenantPolicyLoading);
  const tenantPolicyError = useSelector(selectTenantPolicyError);
  const tenantPolicyUpdating = useSelector(selectTenantPolicyUpdating);
  const usersPolicy = useSelector(selectUsersPolicy);
  const usersPolicyLoading = useSelector(selectUsersPolicyLoading);
  const usersPolicyError = useSelector(selectUsersPolicyError);
  const currentUserPolicy = useSelector(selectCurrentUserPolicy);
  const currentUserPolicyLoading = useSelector(selectCurrentUserPolicyLoading);
  const currentUserPolicyUpdating = useSelector(selectCurrentUserPolicyUpdating);
  const userMFAStatus = useSelector(selectUserMFAStatus);
  const userMFAStatusLoading = useSelector(selectUserMFAStatusLoading);
  const adminMFAStatus = useSelector(selectAdminMFAStatus);
  const adminMFAStatusLoading = useSelector(selectAdminMFAStatusLoading);
  const resettingUserMFA = useSelector(selectResettingUserMFA);
  const clearingDevices = useSelector(selectClearingDevices);
  const stepUpVerified = useSelector(selectStepUpVerified);
  const stepUpVerifying = useSelector(selectStepUpVerifying);
  const stepUpAction = useSelector(selectStepUpAction);
  const stepUpExpiresAt = useSelector(selectStepUpExpiresAt);
  const syncingPolicy = useSelector(selectSyncingPolicy);
  const usersFilters = useSelector(selectAdminMfaUsersFilters);
  const usersPage = useSelector(selectAdminMfaUsersPage);
  const usersTotal = useSelector(selectAdminMfaUsersTotal);
  const isStepUpValid = useSelector(selectIsStepUpValid);

  const getSystemSettings = useCallback(async () => {
    const result = await dispatch(fetchSystemSettings()).unwrap();
    return result;
  }, [dispatch]);

  const updateSystem = useCallback(
    async (data) => {
      const result = await dispatch(updateSystemSettings(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const resetSystem = useCallback(async () => {
    const result = await dispatch(resetSystemSettings()).unwrap();
    return result;
  }, [dispatch]);

  const syncPolicy = useCallback(async () => {
    const result = await dispatch(syncAllTenantsPolicy()).unwrap();
    return result;
  }, [dispatch]);

  const getTenantPolicy = useCallback(async () => {
    const result = await dispatch(fetchTenantMFAPolicy()).unwrap();
    return result;
  }, [dispatch]);

  const updateTenantPolicy = useCallback(
    async (mfaRequiredRoles) => {
      const result = await dispatch(updateTenantMFAPolicy(mfaRequiredRoles)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getAllUsersPolicy = useCallback(async () => {
    const result = await dispatch(fetchAllUsersMFAPolicy()).unwrap();
    return result;
  }, [dispatch]);

  const getUserPolicy = useCallback(
    async (userId) => {
      const result = await dispatch(fetchUserMFAPolicy(userId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateUserOverride = useCallback(
    async (userId, mfaRequired) => {
      const result = await dispatch(updateUserMFAOverride({ userId, mfa_required: mfaRequired })).unwrap();
      return result;
    },
    [dispatch]
  );

  const clearOverride = useCallback(
    async (userId) => {
      const result = await dispatch(clearUserMFAOverride(userId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUserMFAStatus = useCallback(
    async (userId) => {
      const result = await dispatch(fetchUserMFAStatus(userId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const resetUser = useCallback(
    async (userId, reason) => {
      const result = await dispatch(resetUserMFA({ userId, reason })).unwrap();
      return result;
    },
    [dispatch]
  );

  const clearDevices = useCallback(
    async (userId, deviceId) => {
      const result = await dispatch(clearUserDevices({ userId, deviceId })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getAdminMFAStatus = useCallback(
    async (userId) => {
      const result = await dispatch(fetchAdminMFAStatus(userId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const stepUpVerify = useCallback(
    async (action, otp) => {
      const result = await dispatch(verifyStepUp({ action, otp })).unwrap();
      return result;
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setAdminMfaUsersFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setAdminMfaUsersPage(page));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearAdminMfaErrors());
  }, [dispatch]);

  const clearStepUp = useCallback(() => {
    dispatch(clearStepUpVerification());
  }, [dispatch]);

  const getTenantRequiredRoles = useCallback(() => {
    return selectTenantMfaRequiredRoles({ adminMfa: { tenantPolicy } });
  }, [tenantPolicy]);

  const getUserEffectiveRequired = useCallback(
    (userId) => {
      return selectUserMfaEffectiveRequired({ adminMfa: { usersPolicy } }, userId);
    },
    [usersPolicy]
  );

  const getUserOverride = useCallback(
    (userId) => {
      return selectUserMfaOverride({ adminMfa: { usersPolicy } }, userId);
    },
    [usersPolicy]
  );

  return useMemo(
    () => ({
      systemSettings,
      systemSettingsLoading,
      systemSettingsError,
      systemSettingsUpdating,
      tenantPolicy,
      tenantPolicyLoading,
      tenantPolicyError,
      tenantPolicyUpdating,
      usersPolicy,
      usersPolicyLoading,
      usersPolicyError,
      currentUserPolicy,
      currentUserPolicyLoading,
      currentUserPolicyUpdating,
      userMFAStatus,
      userMFAStatusLoading,
      adminMFAStatus,
      adminMFAStatusLoading,
      resettingUserMFA,
      clearingDevices,
      stepUpVerified,
      stepUpVerifying,
      stepUpAction,
      stepUpExpiresAt,
      syncingPolicy,
      usersFilters,
      usersPage,
      usersTotal,
      isStepUpValid,
      getSystemSettings,
      updateSystem,
      resetSystem,
      syncPolicy,
      getTenantPolicy,
      updateTenantPolicy,
      getAllUsersPolicy,
      getUserPolicy,
      updateUserOverride,
      clearOverride,
      getUserMFAStatus,
      resetUser,
      clearDevices,
      getAdminMFAStatus,
      stepUpVerify,
      setFilters,
      setPage,
      clearErrors,
      clearStepUp,
      getTenantRequiredRoles,
      getUserEffectiveRequired,
      getUserOverride,
    }),
    [
      systemSettings,
      systemSettingsLoading,
      systemSettingsError,
      systemSettingsUpdating,
      tenantPolicy,
      tenantPolicyLoading,
      tenantPolicyError,
      tenantPolicyUpdating,
      usersPolicy,
      usersPolicyLoading,
      usersPolicyError,
      currentUserPolicy,
      currentUserPolicyLoading,
      currentUserPolicyUpdating,
      userMFAStatus,
      userMFAStatusLoading,
      adminMFAStatus,
      adminMFAStatusLoading,
      resettingUserMFA,
      clearingDevices,
      stepUpVerified,
      stepUpVerifying,
      stepUpAction,
      stepUpExpiresAt,
      syncingPolicy,
      usersFilters,
      usersPage,
      usersTotal,
      isStepUpValid,
      getSystemSettings,
      updateSystem,
      resetSystem,
      syncPolicy,
      getTenantPolicy,
      updateTenantPolicy,
      getAllUsersPolicy,
      getUserPolicy,
      updateUserOverride,
      clearOverride,
      getUserMFAStatus,
      resetUser,
      clearDevices,
      getAdminMFAStatus,
      stepUpVerify,
      setFilters,
      setPage,
      clearErrors,
      clearStepUp,
      getTenantRequiredRoles,
      getUserEffectiveRequired,
      getUserOverride,
    ]
  );
};