import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
  syncPolicy,
  clearSystemSettingsError,
  resetSystemSettingsState,
} from '../../store/accounts/slice/systemSettingsSlice';
import {
  selectSystemSettings,
  selectSystemSettingsLoading,
  selectSystemSettingsUpdating,
  selectSystemSettingsResetting,
  selectSystemSettingsSyncing,
  selectSystemSettingsError,
  selectSystemSettingsVersion,
  selectSystemSettingsValue,
  selectSystemMfaConfig,
  selectSystemSessionConfig,
  selectSystemLockoutConfig,
  selectSystemPasswordConfig,
  selectSystemAuditConfig,
} from '../../store/accounts/selectors/systemSettingsSelectors';

export const useSystemSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectSystemSettings);
  const isLoading = useSelector(selectSystemSettingsLoading);
  const isUpdating = useSelector(selectSystemSettingsUpdating);
  const isResetting = useSelector(selectSystemSettingsResetting);
  const isSyncing = useSelector(selectSystemSettingsSyncing);
  const error = useSelector(selectSystemSettingsError);
  const version = useSelector(selectSystemSettingsVersion);

  const getSettings = useCallback(async () => {
    const result = await dispatch(fetchSystemSettings()).unwrap();
    return result;
  }, [dispatch]);

  const update = useCallback(
    async (data) => {
      const result = await dispatch(updateSystemSettings(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const reset = useCallback(async () => {
    const result = await dispatch(resetSystemSettings()).unwrap();
    return result;
  }, [dispatch]);

  const sync = useCallback(async () => {
    const result = await dispatch(syncPolicy()).unwrap();
    return result;
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSystemSettingsError());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetSystemSettingsState());
  }, [dispatch]);

  const getValue = useCallback(
    (key) => {
      return selectSystemSettingsValue({ systemSettings: { settings } }, key);
    },
    [settings]
  );

  const getMfaConfig = useCallback(() => {
    return selectSystemMfaConfig({ systemSettings: { settings } });
  }, [settings]);

  const getSessionConfig = useCallback(() => {
    return selectSystemSessionConfig({ systemSettings: { settings } });
  }, [settings]);

  const getLockoutConfig = useCallback(() => {
    return selectSystemLockoutConfig({ systemSettings: { settings } });
  }, [settings]);

  const getPasswordConfig = useCallback(() => {
    return selectSystemPasswordConfig({ systemSettings: { settings } });
  }, [settings]);

  const getAuditConfig = useCallback(() => {
    return selectSystemAuditConfig({ systemSettings: { settings } });
  }, [settings]);

  return useMemo(
    () => ({
      settings,
      isLoading,
      isUpdating,
      isResetting,
      isSyncing,
      error,
      version,
      getSettings,
      update,
      reset,
      sync,
      clearError,
      resetState,
      getValue,
      getMfaConfig,
      getSessionConfig,
      getLockoutConfig,
      getPasswordConfig,
      getAuditConfig,
    }),
    [
      settings,
      isLoading,
      isUpdating,
      isResetting,
      isSyncing,
      error,
      version,
      getSettings,
      update,
      reset,
      sync,
      clearError,
      resetState,
      getValue,
      getMfaConfig,
      getSessionConfig,
      getLockoutConfig,
      getPasswordConfig,
      getAuditConfig,
    ]
  );
};