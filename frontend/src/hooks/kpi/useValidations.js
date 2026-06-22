/**
 * Hook for validations
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchValidations,
    selectValidations,
    selectValidationLoading
} from '../../store/kpi';

const useValidations = (params = {}) => {
    const dispatch = useDispatch();
    
    const validations = useSelector(selectValidations);
    const loading = useSelector(selectValidationLoading);
    
    const loadValidations = useCallback(() => {
        dispatch(fetchValidations(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadValidations();
    }, [loadValidations]);
    
    return {
        validations: validations || [],
        loading,
        refresh: loadValidations,
    };
};

export default useValidations;