// frontend/src/hooks/tenant/useTenantMigrations.js
import { useState, useEffect, useCallback } from 'react';
import { MigrationService } from '../../services/tenant';

export const useTenantMigrations = (tenantId) => {
    const [migrations, setMigrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    const fetchMigrations = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await MigrationService.getMigrations(tenantId);
            if (response.success) {
                const items = response.data.results || response.data;
                setMigrations(items);
                setSummary({
                    total: response.data.total || items.length,
                    pending: response.data.pending_count || 0,
                    completed: response.data.completed_count || 0,
                    failed: response.data.failed_count || 0,
                });
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load migrations');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const runMigrations = useCallback(async (appName = null) => {
        setLoading(true);
        try {
            const response = await MigrationService.runMigrations(tenantId, appName);
            if (response.success) {
                await fetchMigrations();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchMigrations]);

    const rollbackMigration = useCallback(async (migrationName) => {
        setLoading(true);
        try {
            const response = await MigrationService.rollbackMigration(tenantId, migrationName);
            if (response.success) {
                await fetchMigrations();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchMigrations]);

    useEffect(() => {
        fetchMigrations();
    }, [fetchMigrations]);

    return {
        migrations,
        loading,
        error,
        summary,
        refresh: fetchMigrations,
        runMigrations,
        rollbackMigration,
        hasPendingMigrations: (summary?.pending || 0) > 0,
        hasFailedMigrations: (summary?.failed || 0) > 0,
    };
};