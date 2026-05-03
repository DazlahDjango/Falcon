// frontend/src/hooks/tenant/useTenantCreate.js
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TenantService } from '../../services/tenant';

export const useTenantCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [createdTenant, setCreatedTenant] = useState(null);

    const createTenant = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await TenantService.createTenant(data);
            if (response.success) {
                setSuccess(true);
                setCreatedTenant(response.data);
                return { success: true, data: response.data };
            }
            setError(response.message);
            return { success: false, error: response.message };
        } catch (err) {
            const errorMsg = err.message || 'Failed to create tenant';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
        setCreatedTenant(null);
    }, []);

    const goToTenant = useCallback((tenantId) => {
        navigate(`/tenants/${tenantId}`);
    }, [navigate]);

    const goToTenantsList = useCallback(() => {
        navigate('/tenants');
    }, [navigate]);

    return {
        createTenant,
        loading,
        error,
        success,
        createdTenant,
        reset,
        goToTenant,
        goToTenantsList,
    };
};