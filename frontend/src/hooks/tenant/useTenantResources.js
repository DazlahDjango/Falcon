// frontend/src/hooks/tenant/useTenantResources.js
import { useState, useEffect, useCallback } from 'react';
import { TenantService, ResourceService } from '../../services/tenant';

export const useTenantResources = (tenantId) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    const fetchResources = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await TenantService.getTenantResources(tenantId);
            if (response.success) {
                const resourceList = response.data.resources || response.data;
                setResources(resourceList);

                const totalLimit = resourceList.reduce((sum, r) => sum + (r.limit_value || 0), 0);
                const totalCurrent = resourceList.reduce((sum, r) => sum + (r.current_value || 0), 0);
                setSummary({
                    totalLimit,
                    totalCurrent,
                    overallPercentage: totalLimit > 0 ? (totalCurrent / totalLimit) * 100 : 0,
                });
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const updateResourceLimit = useCallback(async (resourceType, limitValue) => {
        try {
            const response = await ResourceService.updateResourceLimit(tenantId, resourceType, limitValue);
            if (response.success) {
                await fetchResources();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [tenantId, fetchResources]);

    const bulkUpdateResources = useCallback(async (limits) => {
        try {
            const response = await ResourceService.bulkUpdateResources(tenantId, limits);
            if (response.success) {
                await fetchResources();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [tenantId, fetchResources]);

    const getResourceByType = useCallback((resourceType) => {
        return resources.find(r => r.resource_type === resourceType);
    }, [resources]);

    const getUsagePercentage = useCallback((resourceType) => {
        const resource = getResourceByType(resourceType);
        if (!resource || resource.limit_value === 0) return 0;
        return (resource.current_value / resource.limit_value) * 100;
    }, [getResourceByType]);

    const isNearLimit = useCallback((resourceType) => {
        const percentage = getUsagePercentage(resourceType);
        return percentage >= 80;
    }, [getUsagePercentage]);

    const isExceeded = useCallback((resourceType) => {
        const resource = getResourceByType(resourceType);
        return resource && resource.current_value >= resource.limit_value;
    }, [getResourceByType]);

    const getRemaining = useCallback((resourceType) => {
        const resource = getResourceByType(resourceType);
        if (!resource) return 0;
        return Math.max(0, resource.limit_value - resource.current_value);
    }, [getResourceByType]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    return {
        resources,
        loading,
        error,
        summary,
        refresh: fetchResources,
        updateResourceLimit,
        bulkUpdateResources,
        getResourceByType,
        getUsagePercentage,
        getRemaining,
        isNearLimit,
        isExceeded,
    };
};