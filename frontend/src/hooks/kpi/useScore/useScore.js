import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../../services/kpi';
const SCORE_QUERY_KEY = 'score';

const useScore = (id) => {
    const { data: score, isLoading, error } = useQuery({
        queryKey: [SCORE_QUERY_KEY, id],
        queryFn: () => scoreService.getScore(id),
        enabled: !!id,
        staleTime: 60 * 1000,
    });
    return {
        score,
        isLoading,
        error
    };
};
export default useScore;