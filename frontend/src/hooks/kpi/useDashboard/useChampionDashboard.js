import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/kpi';
const DASHBOARD_QUERY_KEY = 'dashboard-champion';

const useChampionDashboard = (year, month) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [DASHBOARD_QUERY_KEY, year, month],
        queryFn: () => dashboardService.getChampionDashboard(year, month),
        staleTime: 5 * 60 * 1000,
    });
    const getComplianceRate = () => {
        return data?.organization_submission_rate || 0;
    };
    const getLowComplianceDepartments = (threshold = 70) => {
        if (!data?.department_compliance) return [];
        return data.department_compliance.filter(d => d.compliance_rate < threshold);
    };
    const getCriticalRedAlerts = () => {
        if (!data?.red_kpi_alerts) return [];
        return data.red_kpi_alerts.filter(a => a.consecutive_months >= 3);
    };
    return {
        dashboard: data,
        organizationSubmissionRate: data?.organization_submission_rate || 0,
        pendingEscalations: data?.pending_escalations || 0,
        unvalidatedEntries: data?.unvalidated_entries || 0,
        departmentCompliance: data?.department_compliance || [],
        redKPIAlerts: data?.red_kpi_alerts || [],
        complianceRate: getComplianceRate(),
        lowComplianceDepartments: getLowComplianceDepartments(),
        criticalRedAlerts: getCriticalRedAlerts(),
        isLoading,
        error,
        refetch
    };
};
export default useChampionDashboard;