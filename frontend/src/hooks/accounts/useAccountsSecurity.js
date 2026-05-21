import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as securityApi from '../../services/accounts/api/security';

export const useAccountsSecurity = () => {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'super_admin' || user?.is_superuser;
    const isClientAdmin = user?.role === 'client_admin';
    const canAccessConsole = isSuperAdmin || isClientAdmin;

    const [policy, setPolicy] = useState(null);
    const [lockoutSummary, setLockoutSummary] = useState(null);
    const [loginAttempts, setLoginAttempts] = useState([]);
    const [tenantSessions, setTenantSessions] = useState([]);
    const [systemPolicy, setSystemPolicy] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadPolicy = useCallback(async () => {
        const res = await securityApi.getTenantPolicy();
        setPolicy(res.data);
        return res.data;
    }, []);

    const loadLockoutSummary = useCallback(async () => {
        const res = await securityApi.getLockoutSummary();
        setLockoutSummary(res.data);
        return res.data;
    }, []);

    const loadLoginAttempts = useCallback(async (hours = 24) => {
        const res = await securityApi.getLoginAttempts({ hours });
        const data = res.data?.results ?? res.data ?? [];
        setLoginAttempts(Array.isArray(data) ? data : []);
        return data;
    }, []);

    const loadTenantSessions = useCallback(async () => {
        const res = await securityApi.getTenantActiveSessions();
        setTenantSessions(res.data?.sessions ?? []);
        return res.data;
    }, []);

    const loadSystemPolicy = useCallback(async () => {
        if (!isSuperAdmin) return null;
        const res = await securityApi.getSystemPolicy();
        setSystemPolicy(res.data);
        return res.data;
    }, [isSuperAdmin]);

    const refreshAll = useCallback(async () => {
        if (!canAccessConsole) return;
        setIsLoading(true);
        setError(null);
        try {
            await Promise.all([
                loadPolicy(),
                loadLockoutSummary(),
                loadLoginAttempts(),
                loadTenantSessions(),
                isSuperAdmin ? loadSystemPolicy() : Promise.resolve(),
            ]);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load security data');
        } finally {
            setIsLoading(false);
        }
    }, [
        canAccessConsole, isSuperAdmin, loadPolicy, loadLockoutSummary,
        loadLoginAttempts, loadTenantSessions, loadSystemPolicy,
    ]);

    const syncTenantPolicy = useCallback(async () => {
        setIsSaving(true);
        try {
            const res = await securityApi.getTenantPolicy(true);
            setPolicy(res.data);
            return res.data;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const syncAllTenants = useCallback(async () => {
        setIsSaving(true);
        try {
            return await securityApi.syncAllTenantPolicies();
        } finally {
            setIsSaving(false);
        }
    }, []);

    useEffect(() => {
        if (canAccessConsole) {
            refreshAll();
        }
    }, [canAccessConsole, refreshAll]);

    return {
        user,
        isSuperAdmin,
        isClientAdmin,
        canAccessConsole,
        policy,
        lockoutSummary,
        loginAttempts,
        tenantSessions,
        systemPolicy,
        isLoading,
        isSaving,
        error,
        refreshAll,
        loadPolicy,
        loadLockoutSummary,
        loadLoginAttempts,
        loadTenantSessions,
        syncTenantPolicy,
        syncAllTenants,
    };
};
