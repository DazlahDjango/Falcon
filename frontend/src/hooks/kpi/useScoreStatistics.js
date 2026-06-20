/**
 * Hook for score statistics
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchScoreStatistics,
    selectScoreStatistics,
    selectScoreLoading
} from '../../store/kpi';

const useScoreStatistics = (params = {}) => {
    const dispatch = useDispatch();
    
    const statistics = useSelector(selectScoreStatistics);
    const loading = useSelector(selectScoreLoading);
    
    const loadStatistics = useCallback(() => {
        dispatch(fetchScoreStatistics(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);
    
    return {
        statistics,
        loading,
        refresh: loadStatistics,
    };
};

export default useScoreStatistics;