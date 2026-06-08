import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchChampionDashboard,
    selectChampionDashboard,
    selectDashboardLoading,
    selectDashboardError
} from '../../store/kpi';

const useChampionDashboard = (year, month) => {
    const dispatch = useDispatch();
    
    const dashboard = useSelector(selectChampionDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    
    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchChampionDashboard(params));
    }, [dispatch, year, month]);
    
    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);
    
    return {
        dashboard,
        loading,
        error,
        refresh: loadDashboard,
        organizationSubmissionRate: dashboard?.organization_submission_rate || 0,
        pendingEscalations: dashboard?.pending_escalations || 0,
        redKpiAlerts: dashboard?.red_kpi_alerts || [],
        departmentCompliance: dashboard?.department_compliance || [],
    };
};

export default useChampionDashboard;