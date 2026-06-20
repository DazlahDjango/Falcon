/**
 * Hook for escalations
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchEscalations,
    fetchMyEscalations,
    createEscalation,
    resolveEscalation,
    selectEscalations,
    selectMyEscalations,
    selectValidationLoading
} from '../../store/kpi';

const useEscalations = () => {
    const dispatch = useDispatch();
    
    const escalations = useSelector(selectEscalations);
    const myEscalations = useSelector(selectMyEscalations);
    const loading = useSelector(selectValidationLoading);
    
    const loadEscalations = useCallback(() => {
        dispatch(fetchEscalations());
    }, [dispatch]);
    
    const loadMyEscalations = useCallback(() => {
        dispatch(fetchMyEscalations());
    }, [dispatch]);
    
    const escalate = useCallback(async (actualId, escalatedToId, reason) => {
        return dispatch(createEscalation({ actualId, escalatedToId, reason })).unwrap();
    }, [dispatch]);
    
    const resolve = useCallback(async (id, resolution) => {
        return dispatch(resolveEscalation({ id, resolution })).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadEscalations();
        loadMyEscalations();
    }, [loadEscalations, loadMyEscalations]);
    
    return {
        escalations: escalations || [],
        myEscalations: myEscalations || [],
        loading,
        escalate,
        resolve,
        refresh: () => {
            loadEscalations();
            loadMyEscalations();
        },
    };
};

export default useEscalations;