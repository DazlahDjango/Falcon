import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../../services/kpi';
const AGGREGATED_QUERY_KEY = 'aggregated-scores';

const useAggregatedScores = (filters = {}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [AGGREGATED_QUERY_KEY, filters],
        queryFn: () => scoreService.getAggregatedScores(filters),
        staleTime: 5 * 60 * 1000,
    });
    const getOrganizationHealth = () => {
        if (!data?.results) return null;
        return data.results.find(r => r.level === 'ORGANIZATION');
    };
    const getDepartmentScores = () => {
        if (!data?.results) return [];
        return data.results
            .filter(r => r.level === 'DEPARTMENT')
            .sort((a, b) => b.aggregated_score - a.aggregated_score);
    };
    const getTeamScores = () => {
        if (!data?.results) return [];
        return data.results
            .filter(r => r.level === 'TEAM')
            .sort((a, b) => b.aggregated_score - a.aggregated_score);
    };
    return {
        aggregatedScores: data?.results || [],
        organizationHealth: getOrganizationHealth(),
        departmentScores: getDepartmentScores(),
        teamScores: getTeamScores(),
        isLoading,
        error
    };
};
export default useAggregatedScores;