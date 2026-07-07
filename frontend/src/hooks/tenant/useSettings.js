import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSettings,
  fetchSettingsSection,
  updateSettings,
  updateSettingsSection,
  resetSettings,
  fetchSystemSettings,
  resetSystemSettings,
  clearSettings,
  clearErrors,
  clearSection,
  clearAllSections,
} from '../../store/tenant/slice/settings.slice';

import {
  selectSettings,
  selectSystemSettings,
  selectSettingsLoading,
  selectSettingsSubmitting,
  selectSettingsError,
  selectSettingsVersion,
  selectResetResult,
  selectSettingsSection,
  selectAllSections,
  selectIsolationSettings,
  selectQuotaSettings,
  selectBrandingSettings,
  selectFeatureSettings,
  selectNotificationSettings,
  selectIsolationEnabled,
  selectQuotaBlockingEnabled,
  selectPrimaryColor,
  selectSecondaryColor,
  selectFeatureEnabled,
  selectCustomDomainsEnabled,
  selectSslAutoRenewEnabled,
  selectAuditLogsEnabled,
  selectNotificationPreference,
  selectDailySummaryEnabled,
  selectWeeklyReportEnabled,
  selectHasSettings,
  selectHasSystemSettings,
  selectSettingsSectionKeys,
} from '../../store/tenant/selectors/settings.selectors';

export const useSettings = (options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const submitting = useSelector(selectSettingsSubmitting);
  const error = useSelector(selectSettingsError);
  const version = useSelector(selectSettingsVersion);
  const resetResult = useSelector(selectResetResult);
  const isolation = useSelector(selectIsolationSettings);
  const quotas = useSelector(selectQuotaSettings);
  const branding = useSelector(selectBrandingSettings);
  const features = useSelector(selectFeatureSettings);
  const notifications = useSelector(selectNotificationSettings);
  const isolationEnabled = useSelector(selectIsolationEnabled);
  const quotaBlocking = useSelector(selectQuotaBlockingEnabled);
  const primaryColor = useSelector(selectPrimaryColor);
  const secondaryColor = useSelector(selectSecondaryColor);
  const hasSettings = useSelector(selectHasSettings);

  const fetchAll = useCallback(() => {
    return dispatch(fetchSettings()).unwrap();
  }, [dispatch]);

  const fetchSection = useCallback((section) => {
    if (!section) return Promise.reject(new Error('Section name is required'));
    return dispatch(fetchSettingsSection(section)).unwrap();
  }, [dispatch]);

  const update = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Settings data is required'));
    return dispatch(updateSettings(data)).unwrap();
  }, [dispatch]);

  const updateSection = useCallback((section, patch) => {
    if (!section) return Promise.reject(new Error('Section name is required'));
    if (!patch) return Promise.reject(new Error('Patch data is required'));
    return dispatch(updateSettingsSection({ section, patch })).unwrap();
  }, [dispatch]);

  const reset = useCallback(() => {
    return dispatch(resetSettings()).unwrap();
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearSettings());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearSectionData = useCallback((section) => {
    if (!section) return Promise.reject(new Error('Section name is required'));
    dispatch(clearSection({ section }));
  }, [dispatch]);

  const clearAllSectionsData = useCallback(() => {
    dispatch(clearAllSections());
  }, [dispatch]);

  const getSection = useCallback((section) => {
    return useSelector((state) => selectSettingsSection(state, section));
  }, []);

  const getFeatureEnabled = useCallback((feature) => {
    return useSelector((state) => selectFeatureEnabled(state, feature));
  }, []);

  const getNotificationPreference = useCallback((key) => {
    return useSelector((state) => selectNotificationPreference(state, key));
  }, []);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return useMemo(() => ({
    settings,
    loading,
    submitting,
    error,
    version,
    resetResult,
    isolation,
    quotas,
    branding,
    features,
    notifications,
    isolationEnabled,
    quotaBlocking,
    primaryColor,
    secondaryColor,
    hasSettings,
    fetchAll,
    fetchSection,
    update,
    updateSection,
    reset,
    clearAll,
    clearAllErrors,
    clearSectionData,
    clearAllSectionsData,
    getSection,
    getFeatureEnabled,
    getNotificationPreference,
  }), [
    settings,
    loading,
    submitting,
    error,
    version,
    resetResult,
    isolation,
    quotas,
    branding,
    features,
    notifications,
    isolationEnabled,
    quotaBlocking,
    primaryColor,
    secondaryColor,
    hasSettings,
    fetchAll,
    fetchSection,
    update,
    updateSection,
    reset,
    clearAll,
    clearAllErrors,
    clearSectionData,
    clearAllSectionsData,
    getSection,
    getFeatureEnabled,
    getNotificationPreference,
  ]);
};

export const useSystemSettings = (options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const systemSettings = useSelector(selectSystemSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  const hasSystemSettings = useSelector(selectHasSystemSettings);

  const fetchAll = useCallback(() => {
    return dispatch(fetchSystemSettings()).unwrap();
  }, [dispatch]);

  const reset = useCallback(() => {
    return dispatch(resetSystemSettings()).unwrap();
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearSettings());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return useMemo(() => ({
    systemSettings,
    loading,
    error,
    hasSystemSettings,
    fetchAll,
    reset,
    clearAll,
  }), [
    systemSettings,
    loading,
    error,
    hasSystemSettings,
    fetchAll,
    reset,
    clearAll,
  ]);
};