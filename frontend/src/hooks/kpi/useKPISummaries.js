/**
 * Hook for KPI summaries
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchKPISummaries,
    selectKPISummaries,
    selectAnalyticsLoading
} from '../../store/kpi';

const useKPISummaries = (params = {}) => {
    const dispatch = useDispatch();
    
    const summaries = useSelector(selectKPISummaries);
    const loading = useSelector(selectAnalyticsLoading);
    
    const loadSummaries = useCallback(() => {
        dispatch(fetchKPISummaries(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadSummaries();
    }, [loadSummaries]);
    
    return {
        summaries: summaries || [],
        loading,
        refresh: loadSummaries,
    };
};

export default useKPISummaries;