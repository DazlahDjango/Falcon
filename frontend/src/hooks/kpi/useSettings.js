/**
 * Hook for KPI settings
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSystemSettings,
    updateSystemSettings,
    resetSystemSettings,
    fetchReferenceData,
    fetchNotificationPreferences,
    updateNotificationPreferences,
    selectSystemSettings,
    selectReferenceData,
    selectNotificationPreferences,
    selectSettingsLoading
} from '../../store/kpi';

const useSettings = () => {
    const dispatch = useDispatch();
    
    const systemSettings = useSelector(selectSystemSettings);
    const referenceData = useSelector(selectReferenceData);
    const notificationPrefs = useSelector(selectNotificationPreferences);
    const loading = useSelector(selectSettingsLoading);
    
    const loadSystemSettings = useCallback(() => {
        dispatch(fetchSystemSettings());
    }, [dispatch]);
    
    const loadReferenceData = useCallback((include = ['users', 'departments']) => {
        dispatch(fetchReferenceData(include));
    }, [dispatch]);
    
    const loadNotificationPrefs = useCallback(() => {
        dispatch(fetchNotificationPreferences());
    }, [dispatch]);
    
    const updateSettings = useCallback(async (settings) => {
        return dispatch(updateSystemSettings(settings)).unwrap();
    }, [dispatch]);
    
    const resetSettings = useCallback(async () => {
        return dispatch(resetSystemSettings()).unwrap();
    }, [dispatch]);
    
    const updateNotificationPrefs = useCallback(async (preferences) => {
        return dispatch(updateNotificationPreferences(preferences)).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadSystemSettings();
        loadReferenceData();
        loadNotificationPrefs();
    }, [loadSystemSettings, loadReferenceData, loadNotificationPrefs]);
    
    return {
        systemSettings,
        referenceData,
        notificationPrefs,
        loading,
        updateSettings,
        resetSettings,
        updateNotificationPrefs,
        refresh: () => {
            loadSystemSettings();
            loadReferenceData();
            loadNotificationPrefs();
        },
    };
};

export default useSettings;