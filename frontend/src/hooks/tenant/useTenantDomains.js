// frontend/src/hooks/tenant/useTenantDomains.js
import { useState, useEffect, useCallback } from 'react';
import { DomainService } from '../../services/tenant';

export const useTenantDomains = (tenantId) => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDomains = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await DomainService.getDomains(tenantId);
            if (response.success) {
                setDomains(response.data.results || response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load domains');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const addDomain = useCallback(async (domainData) => {
        setLoading(true);
        try {
            const response = await DomainService.createDomainForTenant(tenantId, domainData);
            if (response.success) {
                await fetchDomains();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchDomains]);

    const deleteDomain = useCallback(async (domainId) => {
        setLoading(true);
        try {
            const response = await DomainService.deleteDomainForTenant(tenantId, domainId);
            if (response.success) {
                await fetchDomains();
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchDomains]);

    const verifyDomain = useCallback(async (domainId) => {
        setLoading(true);
        try {
            const response = await DomainService.verifyDomainForTenant(tenantId, domainId);
            if (response.success) {
                await fetchDomains();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchDomains]);

    const setPrimaryDomain = useCallback(async (domainId) => {
        setLoading(true);
        try {
            const response = await DomainService.setPrimaryDomainForTenant(tenantId, domainId);
            if (response.success) {
                await fetchDomains();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchDomains]);

    const getPrimaryDomain = useCallback(() => {
        return domains.find(d => d.is_primary);
    }, [domains]);

    const getVerifiedDomains = useCallback(() => {
        return domains.filter(d => d.status === 'active' || d.status === 'verified');
    }, [domains]);

    const getPendingDomains = useCallback(() => {
        return domains.filter(d => d.status === 'pending');
    }, [domains]);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    return {
        domains,
        loading,
        error,
        refresh: fetchDomains,
        addDomain,
        deleteDomain,
        verifyDomain,
        setPrimaryDomain,
        getPrimaryDomain,
        getVerifiedDomains,
        getPendingDomains,
        hasDomains: domains.length > 0,
        hasPrimaryDomain: !!getPrimaryDomain(),
    };
};