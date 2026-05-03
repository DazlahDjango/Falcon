// frontend/src/hooks/tenant/useTenantUpdate.js
import { useState, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenantUpdate = (tenantId) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const updateTenant = useCallback(async (data) => {
        if (!tenantId) {
            setError('Tenant ID is required');
            return { success: false, error: 'Tenant ID is required' };
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await TenantService.updateTenant(tenantId, data);
            if (response.success) {
                setSuccess(true);
                return { success: true, data: response.data };
            }
            setError(response.message);
            return { success: false, error: response.message };
        } catch (err) {
            const errorMsg = err.message || 'Failed to update tenant';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const updateSettings = useCallback(async (settings) => {
        return updateTenant({ settings });
    }, [updateTenant]);

    const updateBranding = useCallback(async (branding) => {
        return updateTenant({ branding });
    }, [updateTenant]);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        updateTenant,
        updateSettings,
        updateBranding,
        loading,
        error,
        success,
        reset,
    };
};