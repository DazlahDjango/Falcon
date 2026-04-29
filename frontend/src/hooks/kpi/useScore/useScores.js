import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../../services/kpi';
const SCORES_QUERY_KEY = 'scores';

const useScores = (filters = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [SCORES_QUERY_KEY, filters],
        queryFn: () => scoreService.getScores(filters),
        staleTime:60 * 1000,
    });
    const getAverageScore = () => {
        if (!data?.results?.length) return 0;
        const sum = data.results.reduce((acc, s) => acc + s.score, 0);
        return sum / data.results.length;
    };
    const getScoreDistribution = () => {
        if (!data?.results) return { green: 0, yellow: 0, red: 0 };
        return data.results.reduce((acc, s) => {
            if (s.score >= 90) acc.green++;
            else if (s.score >= 50) acc.yellow++;
            else acc.red++;
            return acc;
        }, { green: 0, yellow: 0, red: 0 });
    };
    return {
        scores: data?.results || [],
        pagination: {
            count: data?.count || 0,
            next: data?.next,
            previous: data?.previous
        },
        isLoading,
        error,
        refetch,
        getAverageScore,
        getScoreDistribution
    };
};
export default useScores;