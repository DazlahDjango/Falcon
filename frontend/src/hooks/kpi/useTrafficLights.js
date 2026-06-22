import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchScores,
    selectScores,
    selectScoreLoading
} from '../../store/kpi';

const useTrafficLights = (params = {}) => {
    const dispatch = useDispatch();
    
    const scores = useSelector(selectScores);
    const loading = useSelector(selectScoreLoading);
    
    const loadTrafficLights = useCallback(() => {
        dispatch(fetchScores(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadTrafficLights();
    }, [loadTrafficLights]);
    
    const trafficLights = scores?.reduce((acc, score) => {
        if (score.traffic_light_status) {
            acc.push({
                kpiId: score.kpi_id,
                kpiName: score.kpi_name,
                status: score.traffic_light_status.status,
                display: score.traffic_light_status.display,
                emoji: score.traffic_light_status.emoji,
                score: score.score,
            });
        }
        return acc;
    }, []);
    
    return {
        trafficLights,
        loading,
        refresh: loadTrafficLights,
    };
};

export default useTrafficLights;