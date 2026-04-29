import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/kpi';
const DASHBOARD_QUERY_KEY = 'dashboard-individual';

const useIndividualDashboard = (year, month) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [DASHBOARD_QUERY_KEY, year, month],
        queryFn: () => dashboardService.getIndividualDashboard(year, month),
        staleTime: 5 * 60 * 1000,
    });
    const getOverallScore = () => data?.overall_score || 0;
    const getKPIsByStatus = () => {
        if (!data?.kpis) return { GREEN: [], YELLOW: [], RED: [] };
        return data.kpis.reduce((acc, kpi) => {
            acc[kpi.status] = [...(acc[kpi.status] || []), kpi];
            return acc;
        }, { GREEN: [], YELLOW: [], RED: [] });
    };
    const getRecentActivity = () => data?.recent_activity || [];
    return {
        dashboard: data,
        overallScore: getOverallScore(),
        kpis: data?.kpis || [],
        kpisByStatus: getKPIsByStatus(),
        recentActivity: getRecentActivity(),
        isLoading,
        error,
        refetch
    };
};
export default useIndividualDashboard;