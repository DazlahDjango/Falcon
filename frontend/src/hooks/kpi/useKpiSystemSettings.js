import { useCallback, useEffect, useState } from 'react';
import * as settingsApi from '../../services/kpi/settings.service';
import { DEFAULT_KPI_FORM_SETTINGS } from '../../utils/kpi/settingsMapper';

export const useKpiSystemSettings = (enabled = true) => {
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
            const res = await settingsApi.getKpiSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_KPI_FORM_SETTINGS, ...effective });
            setVersion(res.data?.version ?? 1);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load KPI settings');
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
            const res = await settingsApi.updateKpiSystemSettings(form);
            const effective = res.data?.effective_settings || res.data?.settings || form;
            setForm({ ...DEFAULT_KPI_FORM_SETTINGS, ...effective });
            setVersion(res.data?.version ?? version + 1);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Save failed');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, [form, version]);

    const reset = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await settingsApi.resetKpiSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_KPI_FORM_SETTINGS, ...effective });
            setVersion(res.data?.version ?? 1);
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
        updateSection,
        setForm,
    };
};

export default useKpiSystemSettings;