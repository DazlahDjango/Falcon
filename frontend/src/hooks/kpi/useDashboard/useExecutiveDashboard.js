import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/kpi';
const DASHBOARD_QUERY_KEY = 'dashboard-executive';

const useExecutiveDashboard = (year, month) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [DASHBOARD_QUERY_KEY, year, month],
        queryFn: () => dashboardService.getExecutiveDashboard(year, month),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
    const getRiskLevel = () => {
        const health = data?.overall_health || 0;
        if (health >= 85) return { level: 'LOW', color: '#22c55e' };
        if (health >= 60) return { level: 'MEDIUM', color: '#eab308' };
        return { level: 'HIGH', color: '#ef4444' };
    };
    const getDepartmentRanking = () => {
        return data?.department_rankings || [];
    };
    const getTrendData = () => {
        return data?.trend_data || [];
    };
    return {
        dashboard: data,
        overallHealth: data?.overall_health || 0,
        riskLevel: getRiskLevel(),
        redKPICount: data?.red_kpi_count || 0,
        redKPIPercentage: data?.red_kpi_percentage || 0,
        validationCompliance: data?.validation_compliance || 0,
        departmentRankings: getDepartmentRanking(),
        trendData: getTrendData(),
        isLoading,
        error,
        refetch
    };
};
export default useExecutiveDashboard;