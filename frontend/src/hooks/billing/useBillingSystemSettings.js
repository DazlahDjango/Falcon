import { useCallback, useEffect, useState } from 'react';
import * as settingsApi from '../../services/billing/settings.service';

const DEFAULT_FORM = {
    payments: {
        default_currency: 'KES',
        allow_trial: true,
        trial_days: 14,
        auto_renew: true,
    },
    tax: { enabled: true, default_rate_percent: 16, inclusive_pricing: false },
    invoices: { auto_send_email: true, due_days: 14, retry_failed_days: 3 },
    webhooks: { retry_max_attempts: 5, signature_required: true },
    realtime: {
        websocket_enabled: true,
        push_subscription_updates: true,
        push_payment_events: true,
    },
};

export const useBillingSystemSettings = (enabled = true) => {
    const [form, setForm] = useState(null);
    const [version, setVersion] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const load = useCallback(async () => {
        if (!enabled) return;
        setIsLoading(true);
        try {
            const res = await settingsApi.getBillingSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_FORM, ...effective });
            setVersion(res.data?.version ?? 1);
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        load();
    }, [load]);

    const updateSection = useCallback((section, key, value) => {
        setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    }, []);

    const save = useCallback(async () => {
        if (!form) return null;
        setIsSaving(true);
        try {
            const res = await settingsApi.updateBillingSystemSettings(form);
            setVersion(res.data?.version ?? version + 1);
            return res.data;
        } finally {
            setIsSaving(false);
        }
    }, [form, version]);

    const reset = useCallback(async () => {
        if (!window.confirm('Reset billing platform settings to defaults?')) return;
        setIsSaving(true);
        try {
            const res = await settingsApi.resetBillingSystemSettings();
            const effective = res.data?.effective_settings || res.data?.settings || {};
            setForm({ ...DEFAULT_FORM, ...effective });
            setVersion(res.data?.version ?? 1);
        } finally {
            setIsSaving(false);
        }
    }, []);

    return { form, version, isLoading, isSaving, save, reset, updateSection, load };
};
