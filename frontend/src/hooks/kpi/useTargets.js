/**
 * Hook for managing targets
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTargets,
    createTarget,
    updateTarget,
    deleteTarget,
    phaseTarget,
    selectTargets,
    selectTargetLoading,
    selectTargetError
} from '../../store/kpi';

const useTargets = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const targets = useSelector(selectTargets);
    const loading = useSelector(selectTargetLoading);
    const error = useSelector(selectTargetError);
    
    const loadTargets = useCallback((params = {}) => {
        dispatch(fetchTargets(params));
    }, [dispatch]);
    
    const create = useCallback((data) => {
        return dispatch(createTarget(data)).unwrap();
    }, [dispatch]);
    
    const update = useCallback((id, data) => {
        return dispatch(updateTarget({ id, data })).unwrap();
    }, [dispatch]);
    
    const remove = useCallback((id) => {
        return dispatch(deleteTarget(id)).unwrap();
    }, [dispatch]);
    
    const phase = useCallback((id, strategy, strategyParams = {}) => {
        return dispatch(phaseTarget({ id, strategy, strategyParams })).unwrap();
    }, [dispatch]);
    
    const refresh = useCallback(() => {
        loadTargets(initialParams);
    }, [loadTargets, initialParams]);
    
    useEffect(() => {
        loadTargets(initialParams);
    }, [loadTargets, initialParams]);
    
    return {
        targets,
        loading,
        error,
        create,
        update,
        remove,
        phase,
        refresh,
    };
};

export default useTargets;