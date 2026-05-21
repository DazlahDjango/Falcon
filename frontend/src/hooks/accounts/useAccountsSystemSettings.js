import { useCallback, useEffect, useState } from 'react';
import * as settingsApi from '../../services/accounts/settings.service';
import { apiToFormPolicy, formToApiPatch } from '../../utils/accounts/policyMapper';

export const useAccountsSystemSettings = (enabled = true) => {
    const [form, setForm] = useState(null);
    const [version, setVersion] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!enabled) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await settingsApi.getSystemSettings();
            const mapped = apiToFormPolicy(res.data);
            setForm(mapped);
            setVersion(mapped.version);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load system policy');
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        load();
    }, [load]);

    const updateField = useCallback((section, key, value) => {
        setForm((prev) => ({
            ...prev,
            [section]: { ...prev[section], [key]: value },
        }));
    }, []);

    const toggleMfaRole = useCallback((role) => {
        setForm((prev) => {
            const roles = prev.mfa.required_roles || [];
            const next = roles.includes(role)
                ? roles.filter((r) => r !== role)
                : [...roles, role];
            return { ...prev, mfa: { ...prev.mfa, required_roles: next } };
        });
    }, []);

    const save = useCallback(async () => {
        if (!form) return;
        setIsSaving(true);
        setError(null);
        try {
            const res = await settingsApi.updateSystemSettings(formToApiPatch(form));
            const mapped = apiToFormPolicy(res.data);
            setForm(mapped);
            setVersion(mapped.version);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Save failed');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, [form]);

    const reset = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await settingsApi.resetSystemSettings();
            const mapped = apiToFormPolicy(res.data);
            setForm(mapped);
            setVersion(mapped.version);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Reset failed');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        form,
        version,
        isLoading,
        isSaving,
        error,
        load,
        save,
        reset,
        updateField,
        toggleMfaRole,
        setForm,
    };
};
