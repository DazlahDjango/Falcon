/**
 * Hook for Manager Dashboard
 * Connects directly to Redux KPI dashboard slice, validations, scores, and auth state.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchManagerDashboard,
    selectManagerDashboard,
    selectDashboardLoading,
    selectDashboardError,
    fetchPendingValidations,
    selectPendingValidations,
    fetchMyScores,
    selectMyScores,
    fetchRedAlerts,
    selectRedAlerts,
} from '../../store/kpi';

const useManagerDashboard = (options = {}) => {
    const { year, month, autoFetch = true } = typeof options === 'object' ? options : { year: arguments[0], month: arguments[1] };
    const dispatch = useDispatch();

    const user = useSelector((state) => state?.auth?.user);
    const tenant = useSelector((state) => state?.tenant?.currentTenant || state?.auth?.tenant);
    const dashboard = useSelector(selectManagerDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    const pendingValidations = useSelector(selectPendingValidations);
    const myScores = useSelector(selectMyScores);
    const redAlerts = useSelector(selectRedAlerts);

    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchManagerDashboard(params));
        dispatch(fetchPendingValidations());
        dispatch(fetchMyScores(params));
        dispatch(fetchRedAlerts());
    }, [dispatch, year, month]);

    useEffect(() => {
        if (autoFetch) {
            loadDashboard();
        }
    }, [loadDashboard, autoFetch]);

    const teamMembers = useMemo(() => {
        return Array.isArray(dashboard?.team_members) ? dashboard.team_members : [];
    }, [dashboard]);

    const statusDistribution = useMemo(() => {
        return dashboard?.status_distribution || {
            GREEN: teamMembers.filter(m => m.status === 'GREEN').length,
            YELLOW: teamMembers.filter(m => m.status === 'YELLOW').length,
            RED: teamMembers.filter(m => m.status === 'RED').length,
        };
    }, [dashboard, teamMembers]);

    const teamSize = Number(dashboard?.team_size) || teamMembers.length;
    const teamAvgScore = Number(dashboard?.team_avg_score) || 0;
    const managerScore = Number(dashboard?.manager_score) || 0;
    const managerStatus = dashboard?.manager_status || (managerScore >= 90 ? 'GREEN' : managerScore >= 70 ? 'YELLOW' : 'RED');
    const pendingCount = Number(dashboard?.pending_validations) || (pendingValidations?.length || 0);
    const missingCount = Number(dashboard?.missing_submissions) || 0;

    const onTrackCount = statusDistribution.GREEN || 0;
    const atRiskCount = statusDistribution.YELLOW || 0;
    const offTrackCount = statusDistribution.RED || 0;
    const totalCount = teamSize || (onTrackCount + atRiskCount + offTrackCount) || 1;

    const onTrackPercentage = Math.round((onTrackCount / totalCount) * 100);
    const atRiskPercentage = Math.round((atRiskCount / totalCount) * 100);
    const offTrackPercentage = Math.round((offTrackCount / totalCount) * 100);

    return {
        dashboard,
        dashboardData: dashboard,
        loading,
        error,
        refresh: loadDashboard,
        refreshDashboard: loadDashboard,
        user,
        tenant,
        managerScore,
        managerStatus,
        teamSize,
        teamAvgScore,
        statusDistribution,
        onTrackCount,
        atRiskCount,
        offTrackCount,
        onTrackPercentage,
        atRiskPercentage,
        offTrackPercentage,
        pendingValidations: Array.isArray(pendingValidations) ? pendingValidations : [],
        pendingCount,
        missingCount,
        teamMembers,
        myScores: Array.isArray(myScores) ? myScores : [],
        redAlerts: Array.isArray(redAlerts) ? redAlerts : [],
    };
};

export default useManagerDashboard;