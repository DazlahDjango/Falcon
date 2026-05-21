import { useCallback, useEffect, useState } from 'react';
import * as settingsApi from '../../services/tenant/settings.service';

const DEFAULT_FORM = {
    isolation: {
        enforce_schema_isolation: true,
        connection_pool_max: 20,
        idle_connection_timeout_seconds: 300,
    },
    quotas: {
        sync_live_counts: true,
        warn_threshold_percent: 80,
        block_on_exceeded: true,
        reconcile_on_usage_read: true,
    },
    provisioning: {
        auto_provision_on_create: true,
        seed_default_structure: true,
        notify_on_complete: true,
    },
    security: {
        require_verified_domain_for_sso: true,
        suspend_on_subscription_expiry: true,
        audit_tenant_admin_actions: true,
    },
    realtime: {
        websocket_enabled: true,
        push_status_changes: true,
        push_quota_warnings: true,
        push_resource_usage: true,
    },
};

export const useTenantSystemSettings = (enabled = true) => {
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
            const res = await settingsApi.getTenantSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_FORM, ...effective });
            setVersion(res.data?.version ?? 1);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load tenant settings');
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        load();
    }, [load]);

    const updateSection = useCallback((section, key, value) => {
        setForm((prev) => ({
            ...prev,
            [section]: { ...prev[section], [key]: value },
        }));
    }, []);

    const save = useCallback(async () => {
        if (!form) return null;
        setIsSaving(true);
        setError(null);
        try {
            const res = await settingsApi.updateTenantSystemSettings(form);
            const effective = res.data?.effective_settings || res.data?.settings || form;
            setForm({ ...DEFAULT_FORM, ...effective });
            setVersion(res.data?.version ?? version + 1);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Save failed');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, [form, version]);

    const reset = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await settingsApi.resetTenantSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_FORM, ...effective });
            setVersion(res.data?.version ?? 1);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Reset failed');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        form, version, isLoading, isSaving, error, load, save, reset, updateSection,
    };
};
