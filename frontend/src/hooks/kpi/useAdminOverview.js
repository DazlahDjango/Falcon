import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAdminOverview,
    selectAdminOverview,
    selectDashboardLoading,
    selectDashboardError
} from '../../store/kpi';

const useAdminOverview = () => {
    const dispatch = useDispatch();
    
    const overview = useSelector(selectAdminOverview);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    
    const loadOverview = useCallback(() => {
        dispatch(fetchAdminOverview());
    }, [dispatch]);
    
    useEffect(() => {
        loadOverview();
    }, [loadOverview]);
    
    return {
        overview,
        loading,
        error,
        refresh: loadOverview,
        frameworks: overview?.frameworks || {},
        categories: overview?.categories || {},
        templates: overview?.templates || {},
        kpis: overview?.kpis || {},
    };
};

export default useAdminOverview;