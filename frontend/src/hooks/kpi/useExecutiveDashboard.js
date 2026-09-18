/**
 * Hook for Executive Dashboard
 * Connects directly to Redux KPI dashboard slice, auth state, and dynamic hierarchy.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExecutiveDashboard,
    selectExecutiveDashboard,
    selectDashboardLoading,
    selectDashboardError,
    fetchRedAlerts,
    selectRedAlerts,
} from '../../store/kpi';

const useExecutiveDashboard = (options = {}) => {
    const { year, month, autoFetch = true } = typeof options === 'object' ? options : { year: arguments[0], month: arguments[1] };
    const dispatch = useDispatch();

    const user = useSelector((state) => state?.auth?.user);
    const tenant = useSelector((state) => state?.tenant?.currentTenant || state?.auth?.tenant);
    const dashboard = useSelector(selectExecutiveDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    const redAlerts = useSelector(selectRedAlerts);

    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchExecutiveDashboard(params));
        dispatch(fetchRedAlerts());
    }, [dispatch, year, month]);

    useEffect(() => {
        if (autoFetch) {
            loadDashboard();
        }
    }, [loadDashboard, autoFetch]);

    const rankings = useMemo(() => {
        return Array.isArray(dashboard?.department_rankings) ? dashboard.department_rankings : [];
    }, [dashboard]);

    // Sort rankings to separate top performing and entities needing attention
    const { topPerforming, attentionRequired, entityTypeLabel } = useMemo(() => {
        if (!rankings.length) {
            return {
                topPerforming: [],
                attentionRequired: [],
                entityTypeLabel: 'Business Units'
            };
        }

        const sorted = [...rankings].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
        const top = sorted.slice(0, 3);
        
        // Entities with score below 75 or the lowest performers
        const low = [...sorted].reverse();
        const flagged = low.filter(item => (Number(item.score) || 0) < 75);
        const attention = flagged.length > 0 ? flagged.slice(0, 3) : low.slice(0, Math.min(3, low.length));

        // Determine entity type label dynamically based on naming in rankings
        const hasDivision = rankings.some(r => /division/i.test(r.department || r.name || ''));
        const hasSection = rankings.some(r => /section/i.test(r.department || r.name || ''));
        const hasDepartment = rankings.some(r => /department|dept/i.test(r.department || r.name || ''));
        
        let label = 'Departments';
        if (hasDivision && !hasDepartment) label = 'Divisions';
        else if (hasDivision && hasDepartment) label = 'Divisions & Departments';
        else if (hasSection && !hasDepartment) label = 'Sections';
        else if (!hasDepartment && !hasDivision && !hasSection) label = 'Cascaded Units';

        return {
            topPerforming: top,
            attentionRequired: attention,
            entityTypeLabel: label
        };
    }, [rankings]);

    const overallHealth = Number(dashboard?.overall_health) || 0;
    const kpiCompletionRate = Number(dashboard?.kpi_completion_rate) || 0;
    const validationCompliance = Number(dashboard?.validation_compliance) || 0;
    const redKpiPercentage = Number(dashboard?.red_kpi_percentage) || 0;
    const redKpiCount = Number(dashboard?.red_kpi_count) || 0;
    const totalKpis = Number(dashboard?.total_kpis) || 0;
    const activeEmployees = Number(dashboard?.active_employees) || 0;
    const greenCount = Number(dashboard?.green_count) || 0;
    const yellowCount = Number(dashboard?.yellow_count) || 0;
    const redCount = Number(dashboard?.red_count) || 0;
    const trendData = Array.isArray(dashboard?.trend_data) ? dashboard.trend_data : [];
    const riskIndicators = dashboard?.risk_indicators || {};

    return {
        dashboard,
        dashboardData: dashboard,
        loading,
        error,
        refresh: loadDashboard,
        refreshDashboard: loadDashboard,
        user,
        tenant,
        overallHealth,
        kpiCompletionRate,
        validationCompliance,
        redKpiPercentage,
        redKpiCount,
        totalKpis,
        activeEmployees,
        greenCount,
        yellowCount,
        redCount,
        departmentRankings: rankings,
        topPerforming,
        attentionRequired,
        trendData,
        riskIndicators,
        redAlerts: Array.isArray(redAlerts) ? redAlerts : [],
        entityTypeLabel,
    };
};

export default useExecutiveDashboard;