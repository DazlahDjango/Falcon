/**
 * Hook for analytics insights
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchInsights,
    selectInsights,
    selectAnalyticsLoading
} from '../../store/kpi';

const useAnalyticsInsights = (params = {}) => {
    const dispatch = useDispatch();
    
    const insights = useSelector(selectInsights);
    const loading = useSelector(selectAnalyticsLoading);
    
    const loadInsights = useCallback(() => {
        dispatch(fetchInsights(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadInsights();
    }, [loadInsights]);
    
    return {
        insights,
        loading,
        refresh: loadInsights,
        overview: insights?.overview || {},
        trend: insights?.trend || {},
        topDepartments: insights?.top_departments || [],
        areasForImprovement: insights?.areas_for_improvement || [],
        redAlerts: insights?.red_alerts || [],
    };
};

export default useAnalyticsInsights;