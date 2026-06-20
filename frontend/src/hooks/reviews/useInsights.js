// src/hooks/reviews/useInsights.js
// Hook for managing AI insights

import { useState, useCallback, useEffect } from 'react';
import { insightService } from '../../services/reviews';
import { INSIGHT_TYPES } from '../../config/constants/reviewConstants';

export const useInsights = (options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [insights, setInsights] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [filters, setFilters] = useState({
        type: options.type || null,
        status: options.status || 'unread',
        limit: options.limit || 20,
        offset: 0
    });

    /**
     * Fetch insights with current filters
     */
    const fetchInsights = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await insightService.getInsights({
                ...filters,
                ...params
            });
            // Ensure we always set an array
            const results = data?.results || data?.insights || data;
            setInsights(Array.isArray(results) ? results : []);
            setTotalCount(data?.count || (Array.isArray(results) ? results.length : 0));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setInsights([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Fetch unread insights count
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await insightService.getUnreadCount();
            setUnreadCount(data.count);
            return data.count;
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
            return 0;
        }
    }, []);

    /**
     * Generate new insights
     */
    const generateInsights = useCallback(async (params = {}) => {
        setGenerating(true);
        setError(null);
        try {
            const data = await insightService.generateInsights(params);
            await fetchInsights();
            await fetchUnreadCount();
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setGenerating(false);
        }
    }, [fetchInsights, fetchUnreadCount]);

    /**
     * Dismiss/acknowledge an insight
     */
    const dismissInsight = useCallback(async (insightId) => {
        setLoading(true);
        try {
            await insightService.dismissInsight(insightId);
            // Update local state
            setInsights(prev => prev.filter(i => i.id !== insightId));
            setTotalCount(prev => prev - 1);
            await fetchUnreadCount();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchUnreadCount]);

    /**
     * Dismiss multiple insights
     */
    const dismissMultipleInsights = useCallback(async (insightIds) => {
        setLoading(true);
        try {
            await insightService.bulkDismissInsights(insightIds);
            // Update local state
            setInsights(prev => prev.filter(i => !insightIds.includes(i.id)));
            setTotalCount(prev => prev - insightIds.length);
            await fetchUnreadCount();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchUnreadCount]);

    /**
     * Filter insights by type
     */
    const filterByType = useCallback((type) => {
        setFilters(prev => ({ ...prev, type, offset: 0 }));
    }, []);

    /**
     * Filter insights by status
     */
    const filterByStatus = useCallback((status) => {
        setFilters(prev => ({ ...prev, status, offset: 0 }));
    }, []);

    /**
     * Change pagination page
     */
    const changePage = useCallback((page) => {
        setFilters(prev => ({ ...prev, offset: (page - 1) * prev.limit }));
    }, []);

    /**
     * Get insights by specific type
     */
    const getInsightsByType = useCallback((type) => {
        return insights.filter(insight => insight.type === type);
    }, [insights]);

    /**
     * Get insights counts by type
     */
    const getInsightsCountByType = useCallback(() => {
        const counts = {};
        Object.values(INSIGHT_TYPES).forEach(type => {
            counts[type] = insights.filter(i => i.type === type).length;
        });
        return counts;
    }, [insights]);

    // Auto-fetch on mount or filter change
    useEffect(() => {
        fetchInsights();
        fetchUnreadCount();
    }, [fetchInsights, fetchUnreadCount]);

    return {
        loading,
        error,
        insights,
        totalCount,
        unreadCount,
        generating,
        filters,
        fetchInsights,
        generateInsights,
        dismissInsight,
        dismissMultipleInsights,
        filterByType,
        filterByStatus,
        changePage,
        getInsightsByType,
        getInsightsCountByType,
        refreshUnreadCount: fetchUnreadCount
    };
};

export default useInsights;