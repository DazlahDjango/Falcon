// src/hooks/reviews/useReviewsSystemSettings.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectSystemSettings,
  selectSystemSettingsLoading,
  selectSystemSettingsError,
  selectSystemSettingsIsUpdating,
  selectSystemSettingsLastUpdated,
} from '../../store/reviews/selectors';
import {
  fetchSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
  resetSystemSettingsState,
} from '../../store/reviews/slices/systemSettings.slice';
import { useReviewsPermissions } from './';

const useReviewsSystemSettings = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const settings = useSelector(selectSystemSettings);
  const loading = useSelector(selectSystemSettingsLoading);
  const error = useSelector(selectSystemSettingsError);
  const isUpdating = useSelector(selectSystemSettingsIsUpdating);
  const lastUpdated = useSelector(selectSystemSettingsLastUpdated);

  // Actions
  const fetchSettings = useCallback(
    () => {
      if (!permissions.canManageSystemSettings) {
        throw new Error('You do not have permission to view system settings');
      }
      return dispatch(fetchSystemSettings());
    },
    [dispatch, permissions.canManageSystemSettings]
  );

  const updateSettings = useCallback(
    (newSettings) => {
      if (!permissions.canManageSystemSettings) {
        throw new Error('You do not have permission to update system settings');
      }
      return dispatch(updateSystemSettings(newSettings));
    },
    [dispatch, permissions.canManageSystemSettings]
  );

  const resetSettings = useCallback(
    () => {
      if (!permissions.canManageSystemSettings) {
        throw new Error('You do not have permission to reset system settings');
      }
      return dispatch(resetSystemSettings());
    },
    [dispatch, permissions.canManageSystemSettings]
  );

  const reset = useCallback(
    () => dispatch(resetSystemSettingsState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageSystemSettings,
    [permissions.canManageSystemSettings]
  );

  return {
    // Data
    settings,
    loading,
    error,
    isUpdating,
    lastUpdated,

    // Actions
    fetchSettings,
    updateSettings,
    resetSettings,
    reset,

    // Permissions
    canManage,

    // Utilities
    hasSettings: !!settings,
    isDefault: settings?.is_default || false,
    getSection: (section) => settings?.[section] || {},
  };
};

export default useReviewsSystemSettings;