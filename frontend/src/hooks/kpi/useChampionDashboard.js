/**
 * Hook for Champion Dashboard
 * Connects directly to Redux KPI dashboard slice, escalations, rollups, and auth state.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchChampionDashboard,
    selectChampionDashboard,
    selectDashboardLoading,
    selectDashboardError,
    fetchDepartmentRollups,
    selectDepartmentRollups,
    fetchEscalations,
    selectEscalations,
    fetchRedAlerts,
    selectRedAlerts,
} from '../../store/kpi';

const useChampionDashboard = (options = {}) => {
    const { year, month, autoFetch = true } = typeof options === 'object' ? options : { year: arguments[0], month: arguments[1] };
    const dispatch = useDispatch();

    const user = useSelector((state) => state?.auth?.user);
    const tenant = useSelector((state) => state?.tenant?.currentTenant || state?.auth?.tenant);
    const dashboard = useSelector(selectChampionDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    const rollups = useSelector(selectDepartmentRollups);
    const escalations = useSelector(selectEscalations);
    const redAlerts = useSelector(selectRedAlerts);

    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchChampionDashboard(params));
        dispatch(fetchDepartmentRollups(params));
        dispatch(fetchEscalations());
        dispatch(fetchRedAlerts());
    }, [dispatch, year, month]);

    useEffect(() => {
        if (autoFetch) {
            loadDashboard();
        }
    }, [loadDashboard, autoFetch]);

    const departmentCompliance = useMemo(() => {
        return Array.isArray(dashboard?.department_compliance) ? dashboard.department_compliance : [];
    }, [dashboard]);

    const redKpiAlerts = useMemo(() => {
        return Array.isArray(dashboard?.red_kpi_alerts) ? dashboard.red_kpi_alerts : [];
    }, [dashboard]);

    const organizationSubmissionRate = Number(dashboard?.organization_submission_rate) || 0;
    const unvalidatedEntries = Number(dashboard?.unvalidated_entries) || 0;
    const pendingEscalations = Number(dashboard?.pending_escalations) || (escalations?.length || 0);

    // Determine dynamic entity terminology (e.g. Divisions vs Departments)
    const entityTypeLabel = useMemo(() => {
        if (!departmentCompliance.length) return 'Departments / Units';
        const hasDivision = departmentCompliance.some(d => /division/i.test(d.department || ''));
        const hasSection = departmentCompliance.some(d => /section/i.test(d.department || ''));
        const hasDepartment = departmentCompliance.some(d => /department|dept/i.test(d.department || ''));

        if (hasDivision && !hasDepartment) return 'Divisions';
        if (hasDivision && hasDepartment) return 'Divisions & Departments';
        if (hasSection && !hasDepartment) return 'Sections';
        return 'Departments';
    }, [departmentCompliance]);

    return {
        dashboard,
        dashboardData: dashboard,
        loading,
        error,
        refresh: loadDashboard,
        refreshDashboard: loadDashboard,
        user,
        tenant,
        organizationSubmissionRate,
        unvalidatedEntries,
        pendingEscalations,
        departmentCompliance,
        redKpiAlerts,
        rollups: Array.isArray(rollups) ? rollups : [],
        escalations: Array.isArray(escalations) ? escalations : [],
        redAlerts: Array.isArray(redAlerts) ? redAlerts : [],
        entityTypeLabel,
    };
};

export default useChampionDashboard;