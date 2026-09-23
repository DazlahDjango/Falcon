/**
 * Hook for Individual / Staff Dashboard
 * Connects directly to Redux KPI dashboard slice, scores, actuals, and auth state.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchIndividualDashboard,
    selectIndividualDashboard,
    selectDashboardLoading,
    selectDashboardError,
    updateDashboardTimestamp,
    fetchMyScores,
    selectMyScores,
    fetchMyRedAlerts,
    selectMyRedAlerts,
} from '../../store/kpi';

const useIndividualDashboard = (options = {}) => {
    const { year, month, autoFetch = true } = typeof options === 'object' ? options : { year: arguments[0], month: arguments[1] };
    const dispatch = useDispatch();

    const user = useSelector((state) => state?.auth?.user);
    const tenant = useSelector((state) => state?.tenant?.currentTenant || state?.auth?.tenant);
    const dashboard = useSelector(selectIndividualDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    const myScores = useSelector(selectMyScores);
    const myRedAlerts = useSelector(selectMyRedAlerts);

    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchIndividualDashboard(params));
        dispatch(fetchMyScores(params));
        dispatch(fetchMyRedAlerts());
    }, [dispatch, year, month]);

    const refresh = useCallback(() => {
        loadDashboard();
        dispatch(updateDashboardTimestamp());
    }, [loadDashboard, dispatch]);

    useEffect(() => {
        if (autoFetch) {
            loadDashboard();
        }
    }, [loadDashboard, autoFetch]);

    // KPI list from dashboard or scoped scores
    const kpiList = useMemo(() => {
        if (Array.isArray(dashboard?.kpis) && dashboard.kpis.length > 0) {
            return dashboard.kpis;
        }
        if (Array.isArray(myScores) && myScores.length > 0) {
            return myScores.map(s => ({
                id: s.kpi_id,
                kpi_id: s.kpi_id,
                name: s.kpi_name || 'KPI',
                score: Number(s.score) || 0,
                status: s.status || (Number(s.score) >= 90 ? 'GREEN' : Number(s.score) >= 70 ? 'YELLOW' : 'RED'),
                actual_value: s.actual_value,
                target_value: s.target_value,
            }));
        }
        return [];
    }, [dashboard, myScores]);

    const overallScore = Number(dashboard?.overall_score) || (
        kpiList.length > 0 ? Math.round(kpiList.reduce((acc, k) => acc + (Number(k.score) || 0), 0) / kpiList.length) : 0
    );

    const onTrackList = kpiList.filter(k => k.status === 'GREEN' || (Number(k.score) >= 90));
    const atRiskList = kpiList.filter(k => k.status === 'YELLOW' || (Number(k.score) >= 70 && Number(k.score) < 90));
    const offTrackList = kpiList.filter(k => k.status === 'RED' || (Number(k.score) < 70));

    const totalKpis = kpiList.length;
    const onTrackCount = onTrackList.length;
    const atRiskCount = atRiskList.length;
    const offTrackCount = offTrackList.length;

    const onTrackPercentage = totalKpis > 0 ? Math.round((onTrackCount / totalKpis) * 100) : 0;
    const atRiskPercentage = totalKpis > 0 ? Math.round((atRiskCount / totalKpis) * 100) : 0;
    const offTrackPercentage = totalKpis > 0 ? Math.round((offTrackCount / totalKpis) * 100) : 0;

    const recentActivity = Array.isArray(dashboard?.recent_activity) ? dashboard.recent_activity : [];

    return {
        dashboard,
        dashboardData: dashboard,
        loading,
        error,
        refresh,
        refreshDashboard: refresh,
        user,
        tenant,
        overallScore,
        kpiList,
        totalKpis,
        onTrackCount,
        atRiskCount,
        offTrackCount,
        onTrackPercentage,
        atRiskPercentage,
        offTrackPercentage,
        recentActivity,
        myRedAlerts: Array.isArray(myRedAlerts) ? myRedAlerts : [],
    };
};

export default useIndividualDashboard;