/**
 * Hook for managing single KPI
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchKPI,
    updateKPI,
    validateKPI,
    clearCurrentKPI,
    selectCurrentKPI,
    selectKPILoadingDetails,
    selectKPIValidation,
    selectKPIError
} from '../../store/kpi';

const useKPI = (id) => {
    const dispatch = useDispatch();
    
    const kpi = useSelector(selectCurrentKPI);
    const loading = useSelector(selectKPILoadingDetails);
    const validation = useSelector(selectKPIValidation);
    const error = useSelector(selectKPIError);
    
    const loadKPI = useCallback(() => {
        if (id) {
            dispatch(fetchKPI(id));
        }
    }, [dispatch, id]);
    
    const update = useCallback((data) => {
        return dispatch(updateKPI({ id, data })).unwrap();
    }, [dispatch, id]);
    
    const validate = useCallback(() => {
        return dispatch(validateKPI(id)).unwrap();
    }, [dispatch, id]);
    
    const clear = useCallback(() => {
        dispatch(clearCurrentKPI());
    }, [dispatch]);
    
    useEffect(() => {
        if (id) {
            loadKPI();
        }
        return () => {
            clear();
        };
    }, [id, loadKPI, clear]);
    
    return {
        kpi,
        loading,
        validation,
        error,
        update,
        validate,
        refresh: loadKPI,
    };
};

export default useKPI;