import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchDatabaseHealth,
    fetchCacheHealth,
    fetchServicesHealth,
    fetchAdminHealth,
    fetchHealthMetrics,
    fetchAllHealthChecks,
    clearHealthError,
    resetHealthState,
} from '../../store/structure/slice/healthSlice';
import {
    selectDatabaseHealth,
    selectCacheHealth,
    selectServicesHealth,
    selectAdminHealth,
    selectHealthMetrics,
    selectHealthLoading,
    selectHealthError,
} from '../../store/structure/selectors';

export const useStructureHealth = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true } = options;

    const database = useSelector(selectDatabaseHealth);
    const cache = useSelector(selectCacheHealth);
    const services = useSelector(selectServicesHealth);
    const admin = useSelector(selectAdminHealth);
    const metrics = useSelector(selectHealthMetrics);
    const isLoading = useSelector(selectHealthLoading);
    const error = useSelector(selectHealthError);

    const fetchDatabase = useCallback(() => {
        return dispatch(fetchDatabaseHealth());
    }, [dispatch]);

    const fetchCache = useCallback(() => {
        return dispatch(fetchCacheHealth());
    }, [dispatch]);

    const fetchServices = useCallback(() => {
        return dispatch(fetchServicesHealth());
    }, [dispatch]);

    const fetchAdmin = useCallback(() => {
        return dispatch(fetchAdminHealth());
    }, [dispatch]);

    const fetchMetrics = useCallback(() => {
        return dispatch(fetchHealthMetrics());
    }, [dispatch]);

    const fetchAll = useCallback(() => {
        return dispatch(fetchAllHealthChecks());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearHealthError());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetHealthState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll();
        }
    }, [autoFetch, fetchAll]);

    return {
        database,
        cache,
        services,
        admin,
        metrics,
        isLoading,
        error,
        fetchDatabase,
        fetchCache,
        fetchServices,
        fetchAdmin,
        fetchMetrics,
        fetchAll,
        clearError,
        reset,
    };
};

export default useStructureHealth;