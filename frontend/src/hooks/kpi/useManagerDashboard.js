/**
 * Hook for manager dashboard
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchManagerDashboard,
    selectManagerDashboard,
    selectDashboardLoading,
    selectDashboardError
} from '../../store/kpi';

const useManagerDashboard = (year, month) => {
    const dispatch = useDispatch();
    
    const dashboard = useSelector(selectManagerDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    
    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchManagerDashboard(params));
    }, [dispatch, year, month]);
    
    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);
    
    return {
        dashboard,
        loading,
        error,
        refresh: loadDashboard,
        teamSize: dashboard?.team_size || 0,
        teamAvgScore: dashboard?.team_avg_score || 0,
        pendingValidations: dashboard?.pending_validations || 0,
        missingSubmissions: dashboard?.missing_submissions || 0,
    };
};

export default useManagerDashboard;