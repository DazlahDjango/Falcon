// frontend/src/hooks/tenant/useTenantQuota.js
import { useState, useCallback } from 'react';
import { ResourceService } from '../../services/tenant';

export const useTenantQuota = (tenantId) => {
    const [checking, setChecking] = useState(false);
    const [warnings, setWarnings] = useState([]);

    // Check single quota
    const checkQuota = useCallback(async (resourceType, amount = 1) => {
        if (!tenantId) return { allowed: false, remaining: 0, error: 'No tenant ID' };

        setChecking(true);
        try {
            const result = await ResourceService.checkQuota(tenantId, resourceType, amount);
            return result;
        } catch (err) {
            return { allowed: false, remaining: 0, error: err.message };
        } finally {
            setChecking(false);
        }
    }, [tenantId]);

    // Check if can create user
    const canCreateUser = useCallback(async () => {
        return checkQuota('users', 1);
    }, [checkQuota]);

    // Check if can create KPI
    const canCreateKPI = useCallback(async () => {
        return checkQuota('kpis', 1);
    }, [checkQuota]);

    // Check if can create department
    const canCreateDepartment = useCallback(async () => {
        return checkQuota('departments', 1);
    }, [checkQuota]);

    // Check if can make API call
    const canMakeAPICall = useCallback(async () => {
        return checkQuota('api_calls_per_day', 1);
    }, [checkQuota]);

    // Check if can add storage
    const canAddStorage = useCallback(async (mbToAdd) => {
        return checkQuota('storage_mb', mbToAdd);
    }, [checkQuota]);

    // Check multiple quotas at once
    const checkMultipleQuotas = useCallback(async (queries) => {
        const results = {};
        for (const [key, { type, amount }] of Object.entries(queries)) {
            results[key] = await checkQuota(type, amount);
        }
        return results;
    }, [checkQuota]);

    // Get quota warnings/alerts
    const getQuotaWarnings = useCallback(async () => {
        if (!tenantId) return [];

        try {
            const response = await ResourceService.getResourceAlerts(tenantId);
            const alerts = response.data?.alerts || [];
            setWarnings(alerts);
            return alerts;
        } catch (err) {
            console.error('Failed to get quota warnings:', err);
            return [];
        }
    }, [tenantId]);

    return {
        checkQuota,
        canCreateUser,
        canCreateKPI,
        canCreateDepartment,
        canMakeAPICall,
        canAddStorage,
        checkMultipleQuotas,
        getQuotaWarnings,
        warnings,
        checking,
    };
};