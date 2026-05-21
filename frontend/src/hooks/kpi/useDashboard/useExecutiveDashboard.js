import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/kpi';
import { mapExecutiveDashboardApi } from '../../../utils/kpi/executiveDashboardMapper';

const DASHBOARD_QUERY_KEY = 'dashboard-executive';

const useExecutiveDashboard = (year, month) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [DASHBOARD_QUERY_KEY, year, month],
        queryFn: () => dashboardService.getExecutiveDashboard(year, month),
        staleTime: 10 * 60 * 1000,
    });
    const mapped = mapExecutiveDashboardApi(data);
    const health = mapped?.overallHealth ?? 0;
    const riskLevel = health >= 85
        ? { level: 'LOW', color: '#22c55e' }
        : health >= 60
            ? { level: 'MEDIUM', color: '#eab308' }
            : { level: 'HIGH', color: '#ef4444' };

    return {
        dashboard: mapped,
        overallHealth: health,
        riskLevel,
        redKPICount: mapped?.redKPICount ?? 0,
        redKPIPercentage: mapped?.redKPIPercentage ?? 0,
        validationCompliance: mapped?.validationCompliance ?? 0,
        departmentRankings: mapped?.departmentRankings ?? [],
        trendData: mapped?.trendData ?? [],
        isLoading,
        error,
        refetch,
    };
};
export default useExecutiveDashboard;