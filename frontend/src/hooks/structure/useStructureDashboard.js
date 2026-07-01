import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchDashboardOverview,
    fetchDashboardHealth,
    fetchDashboardTrends,
    fetchAllDashboardData,
    clearDashboardError,
    resetDashboardState,
} from '../../store/structure/slice/dashboardSlice';
import {
    selectDashboardOverview,
    selectDashboardHealth,
    selectDashboardTrends,
    selectDashboardLoading,
    selectDashboardError,
} from '../../store/structure/selectors';

export const useStructureDashboard = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, months = 6 } = options;

    const overview = useSelector(selectDashboardOverview);
    const health = useSelector(selectDashboardHealth);
    const trends = useSelector(selectDashboardTrends);
    const isLoading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);

    const fetchOverview = useCallback(() => {
        return dispatch(fetchDashboardOverview());
    }, [dispatch]);

    const fetchHealth = useCallback(() => {
        return dispatch(fetchDashboardHealth());
    }, [dispatch]);

    const fetchTrends = useCallback((monthCount) => {
        return dispatch(fetchDashboardTrends(monthCount));
    }, [dispatch]);

    const fetchAll = useCallback((monthCount) => {
        return dispatch(fetchAllDashboardData(monthCount));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearDashboardError());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetDashboardState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(months);
        }
    }, [autoFetch, fetchAll, months]);

    return {
        overview,
        health,
        trends,
        isLoading,
        error,
        fetchOverview,
        fetchHealth,
        fetchTrends,
        fetchAll,
        clearError,
        reset,
    };
};

export default useStructureDashboard;