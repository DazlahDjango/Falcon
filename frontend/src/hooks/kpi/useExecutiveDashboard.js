/**
 * Hook for executive dashboard
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExecutiveDashboard,
    selectExecutiveDashboard,
    selectDashboardLoading,
    selectDashboardError
} from '../../store/kpi';

const useExecutiveDashboard = (year, month) => {
    const dispatch = useDispatch();
    
    const dashboard = useSelector(selectExecutiveDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    
    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchExecutiveDashboard(params));
    }, [dispatch, year, month]);
    
    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);
    
    return {
        dashboard,
        loading,
        error,
        refresh: loadDashboard,
        overallHealth: dashboard?.overall_health || 0,
        redKpiPercentage: dashboard?.red_kpi_percentage || 0,
        validationCompliance: dashboard?.validation_compliance || 0,
        departmentRankings: dashboard?.department_rankings || [],
    };
};

export default useExecutiveDashboard;