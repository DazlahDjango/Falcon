import { useCallback, useEffect, useState } from 'react';
import * as settingsApi from '../../services/structure/settings.service';

const DEFAULT_FORM = {
    hierarchy: {
        max_depth: 12,
        allow_matrix_reporting: true,
        cycle_detection_on_save: true,
    },
    validation: {
        enforce_headcount_limits: true,
        enforce_budget_caps: true,
        block_delete_with_children: true,
    },
    security: {
        hierarchy_access_enforced: true,
        sensitivity_classification_enabled: true,
        scope_enforcement_enabled: true,
    },
    sync: {
        cache_warm_on_change: true,
        publish_org_events: true,
    },
    realtime: {
        websocket_enabled: true,
        push_department_changes: true,
        push_team_changes: true,
        push_employment_changes: true,
        use_channels_primary: true,
    },
};

export const useStructureSystemSettings = (enabled = true) => {
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
            const res = await settingsApi.getStructureSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_FORM, ...effective });
            setVersion(res.data?.version ?? 1);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load structure settings');
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
            const res = await settingsApi.updateStructureSystemSettings(form);
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
            const res = await settingsApi.resetStructureSystemSettings();
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
