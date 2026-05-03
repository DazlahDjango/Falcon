// frontend/src/hooks/tenant/useTenantActions.js
import { useState, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenantActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionType, setActionType] = useState(null);

    const suspendTenant = useCallback(async (tenantId, reason = '') => {
        setLoading(true);
        setError(null);
        setActionType('suspend');

        try {
            const response = await TenantService.suspendTenant(tenantId, reason);
            if (response.success) {
                return { success: true, data: response.data };
            }
            setError(response.message);
            return { success: false, error: response.message };
        } catch (err) {
            const errorMsg = err.message || 'Failed to suspend tenant';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
            setActionType(null);
        }
    }, []);

    const activateTenant = useCallback(async (tenantId) => {
        setLoading(true);
        setError(null);
        setActionType('activate');

        try {
            const response = await TenantService.activateTenant(tenantId);
            if (response.success) {
                return { success: true, data: response.data };
            }
            setError(response.message);
            return { success: false, error: response.message };
        } catch (err) {
            const errorMsg = err.message || 'Failed to activate tenant';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
            setActionType(null);
        }
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setActionType(null);
    }, []);

    return {
        suspendTenant,
        activateTenant,
        loading,
        error,
        actionType,
        isSuspending: actionType === 'suspend',
        isActivating: actionType === 'activate',
        reset,
    };
};