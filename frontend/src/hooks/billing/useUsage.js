import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { trackUsage, fetchUsageSummary, fetchCurrentLimits, checkLimit, clearAlerts, clearError } from '../../store/billing/slices/usageSlice';
import { selectUsageSummary, selectCurrentLimits, selectUsageAlerts, selectUsageLoading, selectUsageError, selectRecentTrackings, selectUsersUsage, selectKpisUsage, selectApiCallsUsage, selectStorageUsage, selectDepartmentsUsage, selectDaysRemainingInPeriod } from '../../store/billing/selectors';
import { useBillingPermissions } from './useBillingPermissions';

export const useUsage = (options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const { permissions } = useBillingPermissions();
    const hasFetched = useRef(false);
    const hasFetchedLimits = useRef(false);
    
    const summary = useSelector(selectUsageSummary);
    const limits = useSelector(selectCurrentLimits);
    const alerts = useSelector(selectUsageAlerts);
    const loading = useSelector(selectUsageLoading);
    const error = useSelector(selectUsageError);
    const recentTrackings = useSelector(selectRecentTrackings);
    const usersUsage = useSelector(selectUsersUsage);
    const kpisUsage = useSelector(selectKpisUsage);
    const apiCallsUsage = useSelector(selectApiCallsUsage);
    const storageUsage = useSelector(selectStorageUsage);
    const departmentsUsage = useSelector(selectDepartmentsUsage);
    const daysRemaining = useSelector(selectDaysRemainingInPeriod);
    const canTrack = permissions.canManageSubscriptions;

    const track = useCallback((usageType, delta = 1) => { if (canTrack) return dispatch(trackUsage({ usageType, delta })); return Promise.reject('Unauthorized'); }, [dispatch, canTrack]);
    const fetchSummary = useCallback(() => dispatch(fetchUsageSummary()), [dispatch]);
    const fetchLimits = useCallback(() => dispatch(fetchCurrentLimits()), [dispatch]);
    const check = useCallback((usageType, currentValue) => dispatch(checkLimit({ usageType, currentValue })), [dispatch]);
    const clearUsageAlerts = useCallback(() => dispatch(clearAlerts()), [dispatch]);
    const clearUsageError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch && !hasFetched.current) {
            hasFetched.current = true;
            fetchSummary(); 
        }
        if (options.autoFetch && !hasFetchedLimits.current) {
            hasFetchedLimits.current = true;
            fetchLimits(); 
        }
    }, [options.autoFetch]);

    const getPercentage = useCallback((usageType) => {
        const usageMap = { users: usersUsage, kpis: kpisUsage, api_calls: apiCallsUsage, storage: storageUsage, departments: departmentsUsage };
        return usageMap[usageType]?.percentage || 0;
    }, [usersUsage, kpisUsage, apiCallsUsage, storageUsage, departmentsUsage]);

    const getRemaining = useCallback((usageType) => {
        const usageMap = { users: usersUsage, kpis: kpisUsage, api_calls: apiCallsUsage, storage: storageUsage, departments: departmentsUsage };
        const usage = usageMap[usageType];
        if (!usage || usage.limit === -1) return -1;
        return usage.limit - usage.current;
    }, [usersUsage, kpisUsage, apiCallsUsage, storageUsage, departmentsUsage]);

    const isLimitExceeded = useCallback((usageType) => {
        const percentage = getPercentage(usageType);
        return { soft: percentage >= 100 && percentage < 110, hard: percentage >= 110 };
    }, [getPercentage]);

    return {
        summary, limits, alerts, loading, error, recentTrackings, usersUsage, kpisUsage, apiCallsUsage, storageUsage, departmentsUsage, daysRemaining, canTrack,
        track, fetchSummary, fetchLimits, check, clearUsageAlerts, clearUsageError, getPercentage, getRemaining, isLimitExceeded,
    };
};

export default useUsage;