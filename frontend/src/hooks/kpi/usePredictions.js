/**
 * Hook for risk predictions
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPredictions,
    selectPredictions,
    selectAnalyticsLoading
} from '../../store/kpi';

const usePredictions = () => {
    const dispatch = useDispatch();
    
    const predictions = useSelector(selectPredictions);
    const loading = useSelector(selectAnalyticsLoading);
    
    const loadPredictions = useCallback(() => {
        dispatch(fetchPredictions());
    }, [dispatch]);
    
    useEffect(() => {
        loadPredictions();
    }, [loadPredictions]);
    
    return {
        predictions,
        loading,
        refresh: loadPredictions,
        highRiskCount: predictions?.high_risk_count || 0,
        recommendations: predictions?.recommendations || [],
    };
};

export default usePredictions;