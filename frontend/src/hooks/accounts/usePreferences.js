import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserPreferences,
  fetchUserPreference,
  updateUserPreference,
  fetchMyPreferences as fetchMyPreferencesThunk,
  updateMyPreferences as updateMyPreferencesThunk,
  updateNotificationSettings,
  fetchTenantPreferences,
  fetchTenantPreference,
  updateTenantPreference,
  fetchMyTenantPreferences,
  updateMyTenantPreferences,
  updateBranding,
  clearSelectedUserPreference,
  clearSelectedTenantPreference,
  clearPreferenceError,
} from '../../store/accounts/slice/preferenceSlice';
import {
  selectUserPreferences,
  selectUserPreferenceList,
  selectSelectedUserPreference,
  selectTenantPreferences,
  selectTenantPreferenceList,
  selectSelectedTenantPreference,
  selectBranding,
  selectPreferencesLoading,
  selectPreferencesUpdating,
  selectPreferencesError,
  selectNotificationSettings,
  selectDashboardPreferences,
  selectItemsPerPage,
  selectDefaultDashboard,
  selectTenantFeatures,
  selectTenantBranding,
  selectTenantDefaultLanguage,
  selectTenantDefaultTimezone,
  selectIsFeatureEnabled,
} from '../../store/accounts/selectors/preferenceSelectors';

export const usePreferences = () => {
  const dispatch = useDispatch();
  const userPreferences = useSelector(selectUserPreferences);
  const userPreferenceList = useSelector(selectUserPreferenceList);
  const selectedUserPreference = useSelector(selectSelectedUserPreference);
  const tenantPreferences = useSelector(selectTenantPreferences);
  const tenantPreferenceList = useSelector(selectTenantPreferenceList);
  const selectedTenantPreference = useSelector(selectSelectedTenantPreference);
  const branding = useSelector(selectBranding);
  const isLoading = useSelector(selectPreferencesLoading);
  const isUpdating = useSelector(selectPreferencesUpdating);
  const error = useSelector(selectPreferencesError);
  const notificationSettings = useSelector(selectNotificationSettings);
  const dashboardPreferences = useSelector(selectDashboardPreferences);
  const itemsPerPage = useSelector(selectItemsPerPage);
  const defaultDashboard = useSelector(selectDefaultDashboard);
  const tenantFeatures = useSelector(selectTenantFeatures);
  const tenantBranding = useSelector(selectTenantBranding);
  const defaultLanguage = useSelector(selectTenantDefaultLanguage);
  const defaultTimezone = useSelector(selectTenantDefaultTimezone);

  const getUserPreferences = useCallback(
    async (params) => {
      const result = await dispatch(fetchUserPreferences(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUserPreference = useCallback(
    async (id) => {
      const result = await dispatch(fetchUserPreference(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateUserPreference = useCallback(
    async (id, data) => {
      const result = await dispatch(updateUserPreference({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getMyPreferences = useCallback(async () => {
    try {
      const result = await dispatch(fetchMyPreferencesThunk()).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [dispatch]);

  const updateMyPreferences = useCallback(
    async (data) => {
      try {
        const result = await dispatch(updateMyPreferencesThunk(data)).unwrap();
        return { success: true, data: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const updateNotifications = useCallback(
    async (data) => {
      const result = await dispatch(updateNotificationSettings(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTenantPreferences = useCallback(
    async (params) => {
      const result = await dispatch(fetchTenantPreferences(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTenantPreference = useCallback(
    async (id) => {
      const result = await dispatch(fetchTenantPreference(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateTenantPreference = useCallback(
    async (id, data) => {
      const result = await dispatch(updateTenantPreference({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getMyTenantPreferences = useCallback(async () => {
    const result = await dispatch(fetchMyTenantPreferences()).unwrap();
    return result;
  }, [dispatch]);

  const updateMyTenantPreferences = useCallback(
    async (data) => {
      const result = await dispatch(updateMyTenantPreferences(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateBranding = useCallback(
    async (data) => {
      const result = await dispatch(updateBranding(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const clearSelectedUser = useCallback(() => {
    dispatch(clearSelectedUserPreference());
  }, [dispatch]);

  const clearSelectedTenant = useCallback(() => {
    dispatch(clearSelectedTenantPreference());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearPreferenceError());
  }, [dispatch]);

  const isFeatureEnabled = useCallback(
    (featureName) => {
      return selectIsFeatureEnabled({ preferences: { tenantPreferences } }, featureName);
    },
    [tenantPreferences]
  );

  return useMemo(
    () => ({
      userPreferences,
      userPreferenceList,
      selectedUserPreference,
      tenantPreferences,
      tenantPreferenceList,
      selectedTenantPreference,
      branding,
      isLoading,
      isUpdating,
      error,
      notificationSettings,
      dashboardPreferences,
      itemsPerPage,
      defaultDashboard,
      tenantFeatures,
      tenantBranding,
      defaultLanguage,
      defaultTimezone,
      getUserPreferences,
      getUserPreference,
      updateUserPreference,
      getMyPreferences,
      updateMyPreferences,
      updateNotifications,
      getTenantPreferences,
      getTenantPreference,
      updateTenantPreference,
      getMyTenantPreferences,
      updateMyTenantPreferences,
      updateBranding,
      clearSelectedUser,
      clearSelectedTenant,
      clearError,
      isFeatureEnabled,
    }),
    [
      userPreferences,
      userPreferenceList,
      selectedUserPreference,
      tenantPreferences,
      tenantPreferenceList,
      selectedTenantPreference,
      branding,
      isLoading,
      isUpdating,
      error,
      notificationSettings,
      dashboardPreferences,
      itemsPerPage,
      defaultDashboard,
      tenantFeatures,
      tenantBranding,
      defaultLanguage,
      defaultTimezone,
      getUserPreferences,
      getUserPreference,
      updateUserPreference,
      getMyPreferences,
      updateMyPreferences,
      updateNotifications,
      getTenantPreferences,
      getTenantPreference,
      updateTenantPreference,
      getMyTenantPreferences,
      updateMyTenantPreferences,
      updateBranding,
      clearSelectedUser,
      clearSelectedTenant,
      clearError,
      isFeatureEnabled,
    ]
  );
};