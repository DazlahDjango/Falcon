/**
 * Hook for managing KPI weights
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchKPIWeights,
    updateKPIWeights,
    validateWeightSum,
    selectKPIWeights,
    selectWeightValidation,
    selectKPILoading
} from '../../store/kpi';

const useKPIWeights = (kpiId) => {
    const dispatch = useDispatch();
    
    const weights = useSelector(selectKPIWeights);
    const validation = useSelector(selectWeightValidation);
    const loading = useSelector(selectKPILoading);
    
    const loadWeights = useCallback(() => {
        if (kpiId) {
            dispatch(fetchKPIWeights({ kpiId }));
        }
    }, [dispatch, kpiId]);
    
    const update = useCallback(async (newWeights) => {
        return dispatch(updateKPIWeights({ kpiId, weights: newWeights })).unwrap();
    }, [dispatch, kpiId]);
    
    const validate = useCallback(async (userId, weightsToValidate = null) => {
        return dispatch(validateWeightSum({ userId, weights: weightsToValidate })).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadWeights();
    }, [loadWeights]);
    
    return {
        weights,
        validation,
        loading,
        update,
        validate,
        refresh: loadWeights,
    };
};

export default useKPIWeights;