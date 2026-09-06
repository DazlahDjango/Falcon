/**
 * Hook for escalations
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchEscalations,
    fetchMyEscalations,
    fetchEscalationTargets,
    createEscalation,
    resolveEscalation,
    selectEscalations,
    selectMyEscalations,
    selectEscalationTargets,
    selectValidationLoading
} from '../../store/kpi';

const useEscalations = () => {
    const dispatch = useDispatch();
    
    const escalations = useSelector(selectEscalations);
    const myEscalations = useSelector(selectMyEscalations);
    const escalationTargets = useSelector(selectEscalationTargets);
    const loading = useSelector(selectValidationLoading);
    
    const loadEscalations = useCallback(() => {
        dispatch(fetchEscalations());
    }, [dispatch]);
    
    const loadMyEscalations = useCallback(() => {
        dispatch(fetchMyEscalations());
    }, [dispatch]);

    const loadEscalationTargets = useCallback(() => {
        dispatch(fetchEscalationTargets());
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
        loadEscalationTargets();
    }, [loadEscalations, loadMyEscalations, loadEscalationTargets]);
    
    return {
        escalations: escalations || [],
        myEscalations: myEscalations || [],
        escalationTargets: escalationTargets || [],
        loading,
        escalate,
        resolve,
        loadEscalationTargets,
        refresh: () => {
            loadEscalations();
            loadMyEscalations();
            loadEscalationTargets();
        },
    };
};

export default useEscalations;