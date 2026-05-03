// frontend/src/hooks/tenant/useTenantUsage.js
import { useState, useEffect, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenantUsage = (tenantId) => {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    const fetchUsage = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await TenantService.getTenantUsage(tenantId);
            if (response.success) {
                setUsage(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load usage data');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const fetchUsageSummary = useCallback(async () => {
        if (!tenantId) return null;

        try {
            const response = await TenantService.getTenantUsageSummary(tenantId);
            if (response.success) {
                return response.data;
            }
            return null;
        } catch (err) {
            console.error('Failed to load usage summary:', err);
            return null;
        }
    }, [tenantId]);

    const fetchUsageHistory = useCallback(async (days = 30) => {
        if (!tenantId) return;

        try {
            const response = await TenantService.getUsageHistory(tenantId, days);
            if (response.success) {
                setHistory(response.data);
            }
        } catch (err) {
            console.error('Failed to load usage history:', err);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    return {
        usage,
        loading,
        error,
        history,
        refresh: fetchUsage,
        fetchUsageSummary,
        fetchUsageHistory,
    };
};