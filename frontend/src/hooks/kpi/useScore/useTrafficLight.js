import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../../services/kpi';
const TRAFFIC_QUERY_KEY = 'traffic-lights';

const useTrafficLight = (filters = {}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [TRAFFIC_QUERY_KEY, filters],
        queryFn: () => scoreService.getTrafficLights(filters),
        staleTime: 60 * 1000,
    });
    const getStatusDistribution = () => {
        if (!data?.results) return { GREEN: 0, YELLOW: 0, RED: 0 };
        return data.results.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, { GREEN: 0, YELLOW: 0, RED: 0 });
    };
    const getRedAlerts = () => {
        if (!data?.results) return [];
        return data.results.filter(t => t.status === 'RED' && t.consecutive_red_count >= 2);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'GREEN': return '#22c55e';
            case 'YELLOW': return '#eab308';
            case 'RED': return '#ef4444';
            default: return '#6b7280';
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'GREEN': return '🟢';
            case 'YELLOW': return '🟡';
            case 'RED': return '🔴';
            default: return '⚪';
        }
    };
    return {
        trafficLights: data?.results || [],
        statusDistribution: getStatusDistribution(),
        redAlerts: getRedAlerts(),
        isLoading,
        error,
        getStatusColor,
        getStatusEmoji
    };
};
export default useTrafficLight;