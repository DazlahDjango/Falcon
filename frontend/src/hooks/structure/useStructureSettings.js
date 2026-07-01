import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchSettings,
    updateSettings,
    resetSettings,
    clearSettingsError,
    resetSettingsState,
} from '../../store/structure/slice/settingSlice';
import {
    selectStructureSettings,
    selectSettingsVersion,
    selectSettingsLoading,
    selectSettingsError,
} from '../../store/structure/selectors';

export const useStructureSettings = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true } = options;

    const settings = useSelector(selectStructureSettings);
    const version = useSelector(selectSettingsVersion);
    const isLoading = useSelector(selectSettingsLoading);
    const error = useSelector(selectSettingsError);

    const fetch = useCallback(() => {
        return dispatch(fetchSettings());
    }, [dispatch]);

    const update = useCallback((data) => {
        return dispatch(updateSettings(data));
    }, [dispatch]);

    const reset = useCallback(() => {
        return dispatch(resetSettings());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearSettingsError());
    }, [dispatch]);

    const resetState = useCallback(() => {
        dispatch(resetSettingsState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetch();
        }
    }, [autoFetch, fetch]);

    return {
        settings,
        version,
        isLoading,
        error,
        fetch,
        update,
        reset,
        clearError,
        resetState,
    };
};

export default useStructureSettings;