/**
 * Hook for managing KPI list
 * Following pattern of billing/usePlans.js
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchKPIs, 
    deleteKPI, 
    activateKPI, 
    deactivateKPI,
    setFilters,
    setKpiPagination,
    selectKPIs,
    selectKPILoading,
    selectKPIPagination,
    selectKPIFilters,
    selectKPIError
} from '../../store/kpi';

const useKPIs = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const kpis = useSelector(selectKPIs);
    const loading = useSelector(selectKPILoading);
    const pagination = useSelector(selectKPIPagination);
    const filters = useSelector(selectKPIFilters);
    const error = useSelector(selectKPIError);
    
    const loadKPIs = useCallback((params = {}) => {
        const queryParams = { ...filters, ...pagination, ...params };
        dispatch(fetchKPIs(queryParams));
    }, [dispatch, filters, pagination]);
    
    const removeKPI = useCallback((id) => {
        return dispatch(deleteKPI(id)).unwrap();
    }, [dispatch]);
    
    const activate = useCallback((id) => {
        return dispatch(activateKPI(id)).unwrap();
    }, [dispatch]);
    
    const deactivate = useCallback((id, reason = '') => {
        return dispatch(deactivateKPI({ id, reason })).unwrap();
    }, [dispatch]);
    
    const updateFilters = useCallback((newFilters) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);
    
    const updatePagination = useCallback((newPagination) => {
        dispatch(setKpiPagination(newPagination));
    }, [dispatch]);
    
    const refresh = useCallback(() => {
        loadKPIs();
    }, [loadKPIs]);
    
    useEffect(() => {
        loadKPIs(initialParams);
    }, [loadKPIs, initialParams]);
    
    return {
        kpis,
        loading,
        pagination,
        filters,
        error,
        removeKPI,
        activate,
        deactivate,
        updateFilters,
        updatePagination,
        refresh,
    };
};

export default useKPIs;