// frontend/src/hooks/tenant/useTenant.js
import { useState, useEffect, useCallback } from 'react';
import { tenantService } from '../../services/tenant/tenant.service';

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
            // ✅ Fix: Use getTenant (not getTenantById)
            const response = await tenantService.getTenant(tenantId);
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
            // ✅ Fix: Use getTenantDetails
            const response = await tenantService.getTenantDetails(tenantId);
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
            const response = await tenantService.getProvisioningStatus(tenantId);
            if (response.success) {
                return response.data;
            }
            return null;
        } catch (err) {
            console.error('Failed to get provisioning status:', err);
            return null;
        }
    }, [tenantId]);

    // ✅ Fix: Use is_active field, not status
    const isActive = tenant?.is_active === true;
    const isSuspended = tenant?.is_active === false;
    const isProvisioning = tenant?.provisioned_at === null && tenant?.is_active === false;
    const isReady = tenant?.is_active === true && tenant?.provisioned_at !== null;

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