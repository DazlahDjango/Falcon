/**
 * Hook for organization health
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchOrganizationHealth,
    fetchOrganizationHealthHistory,
    selectOrganizationHealth,
    selectOrganizationHealthHistory,
    selectAnalyticsLoading
} from '../../store/kpi';

const useOrganizationHealth = (params = {}) => {
    const dispatch = useDispatch();
    
    const health = useSelector(selectOrganizationHealth);
    const history = useSelector(selectOrganizationHealthHistory);
    const loading = useSelector(selectAnalyticsLoading);
    
    const loadHealth = useCallback(() => {
        dispatch(fetchOrganizationHealth(params));
    }, [dispatch, params]);
    
    const loadHistory = useCallback((months = 12) => {
        dispatch(fetchOrganizationHealthHistory(months));
    }, [dispatch]);
    
    useEffect(() => {
        loadHealth();
    }, [loadHealth]);
    
    return {
        health,
        history: history || [],
        loading,
        refresh: loadHealth,
        loadHistory,
        riskLevel: health?.risk_level || 'UNKNOWN',
        overallHealthScore: health?.overall_health_score || 0,
    };
};

export default useOrganizationHealth;