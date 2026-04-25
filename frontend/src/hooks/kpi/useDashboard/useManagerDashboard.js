import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/kpi';
const DASHBOARD_QUERY_KEY = 'dashboard-manager';

const useManagerDashboard = (year, month) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [DASHBOARD_QUERY_KEY, year, month],
        queryFn: () => dashboardService.getManagerDashboard(year, month),
        staleTime: 5 * 60 * 1000,
    });
    const getTeamAverageScore = () => {
        if (!data?.team_members?.length) return 0;
        const sum = data.team_members.reduce((acc, m) => acc + (m.score || 0), 0);
        return sum / data.team_members.length;
    };
    const getTeamMembersByStatus = () => {
        if (!data?.team_members) return { GREEN: [], YELLOW: [], RED: [] };
        return data.team_members.reduce((acc, member) => {
            acc[member.status] = [...(acc[member.status] || []), member];
            return acc;
        }, { GREEN: [], YELLOW: [], RED: [] });
    };
    return {
        dashboard: data,
        managerScore: data?.manager_score || 0,
        teamSize: data?.team_size || 0,
        teamAverageScore: getTeamAverageScore(),
        statusDistribution: data?.status_distribution || {},
        pendingValidations: data?.pending_validations || 0,
        missingSubmissions: data?.missing_submissions || 0,
        teamMembers: data?.team_members || [],
        teamMembersByStatus: getTeamMembersByStatus(),
        isLoading,
        error,
        refetch
    };
};
export default useManagerDashboard;