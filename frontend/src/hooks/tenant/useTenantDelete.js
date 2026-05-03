// frontend/src/hooks/tenant/useTenantDelete.js
import { useState, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenantDelete = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteTenant = useCallback(async (tenantId, permanent = false) => {
        if (!tenantId) {
            setError('Tenant ID is required');
            return { success: false, error: 'Tenant ID is required' };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await TenantService.deleteTenant(tenantId, permanent);
            if (response.success) {
                return { success: true };
            }
            setError(response.message);
            return { success: false, error: response.message };
        } catch (err) {
            const errorMsg = err.message || 'Failed to delete tenant';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const softDeleteTenant = useCallback(async (tenantId) => {
        return deleteTenant(tenantId, false);
    }, [deleteTenant]);

    const hardDeleteTenant = useCallback(async (tenantId) => {
        return deleteTenant(tenantId, true);
    }, [deleteTenant]);

    return {
        deleteTenant,
        softDeleteTenant,
        hardDeleteTenant,
        loading,
        error,
    };
};