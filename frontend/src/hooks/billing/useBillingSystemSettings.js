import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings, resetSettings, clearError } from '../../store/billing/slices/systemSettingsSlice';
import { selectEffectiveSettings, selectSettingsLoading, selectSettingsError, selectSettingsVersion } from '../../store/billing/selectors';
import { useBillingPermissions } from './useBillingPermissions';

export const useBillingSystemSettings = (options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const { permissions } = useBillingPermissions();
    const settings = useSelector(selectEffectiveSettings);
    const loading = useSelector(selectSettingsLoading);
    const error = useSelector(selectSettingsError);
    const version = useSelector(selectSettingsVersion);
    const canManage = permissions.canManagePlans;
    const hasFetched = useRef(false);

    const fetch = useCallback(() => { 
        if (canManage && !hasFetched.current) {
            hasFetched.current = true;
            dispatch(fetchSettings());
        }
    }, [dispatch, canManage]);

    const update = useCallback((patch) => { 
        if (canManage) return dispatch(updateSettings(patch)); 
        return Promise.reject('Unauthorized'); 
    }, [dispatch, canManage]);

    const reset = useCallback(() => { 
        if (canManage) return dispatch(resetSettings()); 
        return Promise.reject('Unauthorized'); 
    }, [dispatch, canManage]);

    const clearSystemError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch && canManage && !hasFetched.current) {
            fetch();
        }
    }, [options.autoFetch, canManage]); // Remove fetch from dependencies

    // Reset hasFetched when component unmounts (optional)
    useEffect(() => {
        return () => {
            hasFetched.current = false;
        };
    }, []);

    return { settings, loading, error, version, canManage, fetch, update, reset, clearSystemError };
};

export default useBillingSystemSettings;