import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMFADevices,
  fetchMFADevice,
  createMFADevice,
  updateMFADevice,
  deleteMFADevice,
  setupTOTP,
  verifyTOTPSetup,
  verifyDevice,
  verifyBackupCode,
  generateBackupCodes,
  fetchBackupCodesStatus,
  setPrimaryDevice,
  disableMFA,
  fetchMFAStatus,
  fetchMFAActivity,
  fetchMFAFailureRate,
  fetchMFAAuditLogs,
  fetchMFAAuditSummary,
  setMfaFilters,
  setMfaPage,
  clearSelectedDevice,
  clearBackupCodes,
  clearMfaError,
} from '../../store/accounts/slice/mfaSlice';
import {
  selectMfaDevices,
  selectSelectedMfaDevice,
  selectMfaStatus,
  selectMfaBackupCodes,
  selectMfaBackupCodesStatus,
  selectMfaActivity,
  selectMfaFailureRate,
  selectMfaAuditLogs,
  selectMfaAuditSummary,
  selectMfaLoading,
  selectMfaSettingUp,
  selectMfaVerifying,
  selectMfaGenerating,
  selectMfaError,
  selectMfaPagination,
  selectMfaFilters,
  selectMfaDeviceById,
  selectMfaPrimaryDevice,
  selectMfaVerifiedDevices,
  selectMfaActiveDevices,
  selectMfaTotpDevices,
  selectMfaEnabled,
  selectMfaHasDevices,
  selectMfaBackupCodesRemaining,
} from '../../store/accounts/selectors/mfaSelectors';

export const useMFA = () => {
  const dispatch = useDispatch();
  const devices = useSelector(selectMfaDevices);
  const selectedDevice = useSelector(selectSelectedMfaDevice);
  const status = useSelector(selectMfaStatus);
  const backupCodes = useSelector(selectMfaBackupCodes);
  const backupCodesStatus = useSelector(selectMfaBackupCodesStatus);
  const activity = useSelector(selectMfaActivity);
  const failureRate = useSelector(selectMfaFailureRate);
  const auditLogs = useSelector(selectMfaAuditLogs);
  const auditSummary = useSelector(selectMfaAuditSummary);
  const isLoading = useSelector(selectMfaLoading);
  const isSettingUp = useSelector(selectMfaSettingUp);
  const isVerifying = useSelector(selectMfaVerifying);
  const isGenerating = useSelector(selectMfaGenerating);
  const error = useSelector(selectMfaError);
  const pagination = useSelector(selectMfaPagination);
  const filters = useSelector(selectMfaFilters);

  const getDevices = useCallback(
    async (params) => {
      const result = await dispatch(fetchMFADevices(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getDevice = useCallback(
    async (id) => {
      const result = await dispatch(fetchMFADevice(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const createDevice = useCallback(
    async (data) => {
      const result = await dispatch(createMFADevice(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateDevice = useCallback(
    async (id, data) => {
      const result = await dispatch(updateMFADevice({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const deleteDevice = useCallback(
    async (id) => {
      const result = await dispatch(deleteMFADevice(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const setupTotp = useCallback(
    async (data) => {
      const result = await dispatch(setupTOTP(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const verifyTotpSetup = useCallback(
    async (data) => {
      const result = await dispatch(verifyTOTPSetup(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const verify = useCallback(
    async (id, otp) => {
      const result = await dispatch(verifyDevice({ id, otp })).unwrap();
      return result;
    },
    [dispatch]
  );

  const verifyBackup = useCallback(
    async (code) => {
      const result = await dispatch(verifyBackupCode(code)).unwrap();
      return result;
    },
    [dispatch]
  );

  const generateCodes = useCallback(
    async (count) => {
      const result = await dispatch(generateBackupCodes(count)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getBackupStatus = useCallback(async () => {
    const result = await dispatch(fetchBackupCodesStatus()).unwrap();
    return result;
  }, [dispatch]);

  const setPrimary = useCallback(
    async (id) => {
      const result = await dispatch(setPrimaryDevice(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const disable = useCallback(
    async (data) => {
      const result = await dispatch(disableMFA(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getStatus = useCallback(async () => {
    const result = await dispatch(fetchMFAStatus()).unwrap();
    return result;
  }, [dispatch]);

  const getActivity = useCallback(
    async (params) => {
      const result = await dispatch(fetchMFAActivity(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getFailureRate = useCallback(
    async (params) => {
      const result = await dispatch(fetchMFAFailureRate(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getAuditLogs = useCallback(
    async (params) => {
      const result = await dispatch(fetchMFAAuditLogs(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getAuditSummary = useCallback(async () => {
    const result = await dispatch(fetchMFAAuditSummary()).unwrap();
    return result;
  }, [dispatch]);

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setMfaFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setMfaPage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedDevice());
  }, [dispatch]);

  const clearCodes = useCallback(() => {
    dispatch(clearBackupCodes());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearMfaError());
  }, [dispatch]);

  const getDeviceById = useCallback(
    (id) => {
      return selectMfaDeviceById({ mfa: { devices } }, id);
    },
    [devices]
  );

  const getPrimary = useCallback(() => {
    return selectMfaPrimaryDevice({ mfa: { devices } });
  }, [devices]);

  const getVerified = useCallback(() => {
    return selectMfaVerifiedDevices({ mfa: { devices } });
  }, [devices]);

  const getActive = useCallback(() => {
    return selectMfaActiveDevices({ mfa: { devices } });
  }, [devices]);

  const getTotpDevices = useCallback(() => {
    return selectMfaTotpDevices({ mfa: { devices } });
  }, [devices]);


  const isEnabled = useSelector(selectMfaEnabled);
  const hasDevices = useSelector(selectMfaHasDevices);
  const backupCodesRemaining = useSelector(selectMfaBackupCodesRemaining);

  return useMemo(
    () => ({
      devices,
      selectedDevice,
      status,
      backupCodes,
      backupCodesStatus,
      activity,
      failureRate,
      auditLogs,
      auditSummary,
      isLoading,
      isSettingUp,
      isVerifying,
      isGenerating,
      error,
      pagination,
      filters,
      isEnabled,
      hasDevices,
      backupCodesRemaining,
      getDevices,
      getDevice,
      createDevice,
      updateDevice,
      deleteDevice,
      setupTotp,
      verifyTotpSetup,
      verify,
      verifyBackup,
      generateCodes,
      getBackupStatus,
      setPrimary,
      disable,
      getStatus,
      getActivity,
      getFailureRate,
      getAuditLogs,
      getAuditSummary,
      setFilters,
      setPage,
      clearSelected,
      clearCodes,
      clearError,
      getDeviceById,
      getPrimary,
      getVerified,
      getActive,
      getTotpDevices,
      clearMfaError: clearError,
    }),
    [
      devices,
      selectedDevice,
      status,
      backupCodes,
      backupCodesStatus,
      activity,
      failureRate,
      auditLogs,
      auditSummary,
      isLoading,
      isSettingUp,
      isVerifying,
      isGenerating,
      error,
      pagination,
      filters,
      isEnabled,
      hasDevices,
      backupCodesRemaining,
      getDevices,
      getDevice,
      createDevice,
      updateDevice,
      deleteDevice,
      setupTotp,
      verifyTotpSetup,
      verify,
      verifyBackup,
      generateCodes,
      getBackupStatus,
      setPrimary,
      disable,
      getStatus,
      getActivity,
      getFailureRate,
      getAuditLogs,
      getAuditSummary,
      setFilters,
      setPage,
      clearSelected,
      clearCodes,
      clearError,
      getDeviceById,
      getPrimary,
      getVerified,
      getActive,
      getTotpDevices,
    ]
  );
};