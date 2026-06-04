import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings, resetSettings, clearError } from '../../store/billing/slices/systemSettingsSlice';
import { selectSettings, selectSettingsLoading, selectSettingsError, selectSettingsVersion } from '../../store/billing/selectors';
import { useBillingPermissions } from './useBillingPermissions';

export const useBillingSystemSettings = (options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const { permissions } = useBillingPermissions();
    const settings = useSelector(selectSettings);
    const loading = useSelector(selectSettingsLoading);
    const error = useSelector(selectSettingsError);
    const version = useSelector(selectSettingsVersion);
    const canManage = permissions.canManagePlans;

    const fetch = useCallback(() => { if (canManage) dispatch(fetchSettings()); }, [dispatch, canManage]);
    const update = useCallback((patch) => { if (canManage) return dispatch(updateSettings(patch)); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const reset = useCallback(() => { if (canManage) return dispatch(resetSettings()); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const clearSystemError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { if (options.autoFetch && canManage) fetch(); }, [options.autoFetch, canManage, fetch]);

    return { settings, loading, error, version, canManage, fetch, update, reset, clearSystemError };
};

export default useBillingSystemSettings;