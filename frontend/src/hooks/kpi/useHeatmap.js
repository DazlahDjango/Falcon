/**
 * Hook for performance heatmap
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchHeatmap,
    selectHeatmap,
    selectAnalyticsLoading
} from '../../store/kpi';

const useHeatmap = (params = {}) => {
    const dispatch = useDispatch();
    
    const heatmap = useSelector(selectHeatmap);
    const loading = useSelector(selectAnalyticsLoading);
    
    const loadHeatmap = useCallback(() => {
        dispatch(fetchHeatmap(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadHeatmap();
    }, [loadHeatmap]);
    
    return {
        heatmap,
        loading,
        refresh: loadHeatmap,
        data: heatmap?.data || [],
        year: heatmap?.year,
        month: heatmap?.month,
    };
};

export default useHeatmap;