import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTarget,
    updateTarget,
    phaseTarget,
    selectCurrentTarget,
    selectTargetLoading,
    selectTargetError
} from '../../store/kpi';

const useTarget = (id) => {
    const dispatch = useDispatch();
    
    const target = useSelector(selectCurrentTarget);
    const loading = useSelector(selectTargetLoading);
    const error = useSelector(selectTargetError);
    
    const loadTarget = useCallback(() => {
        if (id) {
            dispatch(fetchTarget(id));
        }
    }, [dispatch, id]);
    
    const update = useCallback(async (data) => {
        return dispatch(updateTarget({ id, data })).unwrap();
    }, [dispatch, id]);
    
    const phase = useCallback(async (strategy, strategyParams = {}) => {
        return dispatch(phaseTarget({ id, strategy, strategyParams })).unwrap();
    }, [dispatch, id]);
    
    useEffect(() => {
        if (id) {
            loadTarget();
        }
    }, [id, loadTarget]);
    
    return {
        target,
        loading,
        error,
        update,
        phase,
        refresh: loadTarget,
    };
};

export default useTarget;