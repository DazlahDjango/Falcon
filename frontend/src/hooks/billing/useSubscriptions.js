/**
 * useSubscriptions Hook
 * Manages multiple subscriptions list for admin/tenant history view
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SubscriptionService } from '../../services/billing';
import { SUBSCRIPTION_STATUS, BILLING_PAGINATION } from '../../config/constants/billingConstants';

export const useSubscriptions = (options = {}) => {
    const {
        autoFetch = true,
        pageSize = BILLING_PAGINATION.DEFAULT_PAGE_SIZE,
        initialFilters = {},
    } = options;

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState(initialFilters);
    const [stats, setStats] = useState(null);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async (page = currentPage, newFilters = filters) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                page_size: pageSize,
                ...newFilters,
            };

            const response = await SubscriptionService.getSubscriptions(params);
            const data = response?.data || [];
            
            setSubscriptions(data);
            setTotalCount(response?.count || data.length);
            
            // Calculate stats
            const statsData = {
                total: data.length,
                active: data.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE).length,
                trialing: data.filter(s => s.status === SUBSCRIPTION_STATUS.TRIALING).length,
                pastDue: data.filter(s => s.status === SUBSCRIPTION_STATUS.PAST_DUE).length,
                cancelled: data.filter(s => s.status === SUBSCRIPTION_STATUS.CANCELLED).length,
                expired: data.filter(s => s.status === SUBSCRIPTION_STATUS.EXPIRED).length,
                pendingCancellation: data.filter(s => s.status === SUBSCRIPTION_STATUS.PENDING_CANCELLATION).length,
            };
            setStats(statsData);
            
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch subscriptions');
            console.error('[useSubscriptions] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
    }, []);

    // Change page
    const goToPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Get subscription by ID from list
    const getSubscriptionById = useCallback((id) => {
        return subscriptions.find(s => s.id === id);
    }, [subscriptions]);

    // Get subscriptions by status
    const getByStatus = useCallback((status) => {
        return subscriptions.filter(s => s.status === status);
    }, [subscriptions]);

    // Get subscriptions by plan type
    const getByPlanType = useCallback((planType) => {
        return subscriptions.filter(s => s.plan_type === planType);
    }, [subscriptions]);

    // Auto-fetch
    useEffect(() => {
        if (autoFetch) {
            fetchSubscriptions();
        }
    }, [autoFetch, currentPage, filters, fetchSubscriptions]);

    // Memoized values
    const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
    
    const activeSubscriptions = useMemo(() => {
        return subscriptions.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE);
    }, [subscriptions]);
    
    const expiringSoon = useMemo(() => {
        return subscriptions.filter(s => 
            s.status === SUBSCRIPTION_STATUS.ACTIVE && 
            s.is_active_status?.days_until_expiry <= 7 &&
            s.is_active_status?.days_until_expiry > 0
        );
    }, [subscriptions]);
    
    const onTrial = useMemo(() => {
        return subscriptions.filter(s => s.status === SUBSCRIPTION_STATUS.TRIALING);
    }, [subscriptions]);

    const hasSubscriptions = useMemo(() => subscriptions.length > 0, [subscriptions]);

    return {
        // State
        subscriptions,
        loading,
        error,
        stats,
        totalCount,
        currentPage,
        totalPages,
        filters,
        
        // Computed
        activeSubscriptions,
        expiringSoon,
        onTrial,
        hasSubscriptions,
        
        // Actions
        fetchSubscriptions,
        updateFilters,
        clearFilters,
        goToPage,
        getSubscriptionById,
        getByStatus,
        getByPlanType,
    };
};

export default useSubscriptions;