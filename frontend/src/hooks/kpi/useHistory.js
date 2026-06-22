/**
 * Hook for history/audit logs
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchKPIHistory,
    fetchKPIHistoryForKPI,
    fetchActualHistory,
    fetchActualHistoryForActual,
    fetchTargetHistory,
    fetchTargetHistoryForTarget,
    selectKPIHistory,
    selectActualHistory,
    selectTargetHistory,
    selectHistoryLoading
} from '../../store/kpi';

const useHistory = () => {
    const dispatch = useDispatch();
    
    const kpiHistory = useSelector(selectKPIHistory);
    const actualHistory = useSelector(selectActualHistory);
    const targetHistory = useSelector(selectTargetHistory);
    const loading = useSelector(selectHistoryLoading);
    
    const loadKPIHistory = useCallback((params = {}) => {
        dispatch(fetchKPIHistory(params));
    }, [dispatch]);
    
    const loadKPIHistoryForKPI = useCallback((kpiId, params = {}) => {
        dispatch(fetchKPIHistoryForKPI({ kpiId, params }));
    }, [dispatch]);
    
    const loadActualHistory = useCallback((params = {}) => {
        dispatch(fetchActualHistory(params));
    }, [dispatch]);
    
    const loadActualHistoryForActual = useCallback((actualId, params = {}) => {
        dispatch(fetchActualHistoryForActual({ actualId, params }));
    }, [dispatch]);
    
    const loadTargetHistory = useCallback((params = {}) => {
        dispatch(fetchTargetHistory(params));
    }, [dispatch]);
    
    const loadTargetHistoryForTarget = useCallback((targetId, params = {}) => {
        dispatch(fetchTargetHistoryForTarget({ targetId, params }));
    }, [dispatch]);
    
    return {
        kpiHistory: kpiHistory || [],
        actualHistory: actualHistory || [],
        targetHistory: targetHistory || [],
        loading,
        loadKPIHistory,
        loadKPIHistoryForKPI,
        loadActualHistory,
        loadActualHistoryForActual,
        loadTargetHistory,
        loadTargetHistoryForTarget,
    };
};

export default useHistory;