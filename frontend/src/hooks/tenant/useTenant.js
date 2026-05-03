// frontend/src/hooks/tenant/useTenant.js
import { useState, useEffect, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenant = (tenantId) => {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch basic tenant data
    const fetchTenant = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await TenantService.getTenant(tenantId);
            if (response.success) {
                setTenant(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load tenant');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    // Fetch detailed tenant data (includes related info)
    const fetchTenantDetail = useCallback(async () => {
        if (!tenantId) return;

        setLoading(true);
        try {
            const response = await TenantService.getTenantDetail(tenantId);
            if (response.success) {
                setTenant(response.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    // Refresh tenant data
    const refresh = useCallback(() => {
        fetchTenant();
    }, [fetchTenant]);

    // Get provisioning status
    const getProvisioningStatus = useCallback(async () => {
        if (!tenantId) return null;

        try {
            const response = await TenantService.getProvisioningStatus(tenantId);
            if (response.success) {
                return response.data;
            }
            return null;
        } catch (err) {
            console.error('Failed to get provisioning status:', err);
            return null;
        }
    }, [tenantId]);

    // Helper booleans
    const isActive = tenant?.status === 'active';
    const isSuspended = tenant?.status === 'suspended';
    const isProvisioning = tenant?.status === 'provisioning';
    const isReady = tenant?.status === 'active' && tenant?.provisioned_at;

    useEffect(() => {
        fetchTenant();
    }, [fetchTenant]);

    return {
        // Data
        tenant,
        loading,
        error,

        // Actions
        refresh,
        fetchTenantDetail,
        getProvisioningStatus,

        // Helper booleans
        isActive,
        isSuspended,
        isProvisioning,
        isReady,
    };
};