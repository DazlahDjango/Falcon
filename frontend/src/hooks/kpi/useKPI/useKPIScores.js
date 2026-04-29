import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../../services/kpi';
const SCORES_QUERY_KEY = 'kpi-scores';

const useKPIScores = (kpiId, year, month) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [SCORES_QUERY_KEY, kpiId, year, month],
        queryFn: () => scoreService.getScores({ kpi: kpiId, year, month }),
        enabled: !!kpiId,
        staleTime: 60 * 1000, // 1 minute
    });
    const scores = data?.results || [];
    const getAverageScore = () => {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((acc, s) => acc + s.score, 0);
        return sum / scores.length;
    };
    const getScoreByMonth = (monthNum) => {
        return scores.find(s => s.month === monthNum);
    };
    const getScoreTrend = () => {
        return scores.sort((a, b) => a.month - b.month).map(s => ({
            month: s.month,
            score: s.score,
            status: s.traffic_light?.status
        }));
    };
    return {
        scores,
        isLoading,
        error,
        getAverageScore,
        getScoreByMonth,
        getScoreTrend
    };
};
export default useKPIScores;