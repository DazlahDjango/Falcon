/**
 * Hook for managing actuals
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchActuals,
    createActual,
    submitActual,
    approveActual,
    rejectActual,
    setActualFilters,
    selectActuals,
    selectActualLoading,
    selectActualFilters,
    selectActualError
} from '../../store/kpi';

const useActuals = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const actuals = useSelector(selectActuals);
    const loading = useSelector(selectActualLoading);
    const filters = useSelector(selectActualFilters);
    const error = useSelector(selectActualError);
    
    const loadActuals = useCallback((params = {}) => {
        const queryParams = { ...filters, ...params };
        dispatch(fetchActuals(queryParams));
    }, [dispatch, filters]);
    
    const create = useCallback((data, evidenceFile = null) => {
        return dispatch(createActual({ data, evidenceFile })).unwrap();
    }, [dispatch]);
    
    const submit = useCallback((id) => {
        return dispatch(submitActual(id)).unwrap();
    }, [dispatch]);
    
    const approve = useCallback((id, comment = '') => {
        return dispatch(approveActual({ id, comment })).unwrap();
    }, [dispatch]);
    
    const reject = useCallback((id, reasonId, comment = '') => {
        return dispatch(rejectActual({ id, reasonId, comment })).unwrap();
    }, [dispatch]);
    
    const updateFilters = useCallback((newFilters) => {
        dispatch(setActualFilters(newFilters));
    }, [dispatch]);
    
    const refresh = useCallback(() => {
        loadActuals();
    }, [loadActuals]);
    
    useEffect(() => {
        loadActuals(initialParams);
    }, [loadActuals, initialParams]);
    
    return {
        actuals,
        loading,
        filters,
        error,
        create,
        submit,
        approve,
        reject,
        updateFilters,
        refresh,
    };
};

export default useActuals;