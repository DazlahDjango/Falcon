import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPhasing,
    updateLocalPhasing,
    selectMonthlyPhasing,
    selectTargetLoading
} from '../../store/kpi';

const useMonthlyPhasing = (targetId) => {
    const dispatch = useDispatch();
    
    const phasing = useSelector(state => selectMonthlyPhasing(targetId)(state));
    const loading = useSelector(selectTargetLoading);
    
    const loadPhasing = useCallback(() => {
        if (targetId) {
            dispatch(fetchPhasing(targetId));
        }
    }, [dispatch, targetId]);
    
    const updateLocal = useCallback((phasingData) => {
        dispatch(updateLocalPhasing({ targetId, phasing: phasingData }));
    }, [dispatch, targetId]);
    
    useEffect(() => {
        if (targetId) {
            loadPhasing();
        }
    }, [targetId, loadPhasing]);
    
    return {
        phasing: phasing || [],
        loading,
        updateLocal,
        refresh: loadPhasing,
    };
};

export default useMonthlyPhasing;