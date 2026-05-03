// frontend/src/hooks/tenant/useTenantBackups.js
import { useState, useEffect, useCallback } from 'react';
import { BackupService } from '../../services/tenant';

export const useTenantBackups = (tenantId) => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [restoringBackup, setRestoringBackup] = useState(false);

    const fetchBackups = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await BackupService.getBackups(tenantId);
            if (response.success) {
                setBackups(response.data.results || response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load backups');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const createBackup = useCallback(async (backupType = 'full') => {
        setCreatingBackup(true);
        try {
            const response = await BackupService.createBackupForTenant(tenantId, backupType);
            if (response.success) {
                await fetchBackups();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setCreatingBackup(false);
        }
    }, [tenantId, fetchBackups]);

    const restoreBackup = useCallback(async (backupId) => {
        setRestoringBackup(true);
        try {
            const response = await BackupService.restoreBackupForTenant(tenantId, backupId);
            if (response.success) {
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setRestoringBackup(false);
        }
    }, [tenantId]);

    const deleteBackup = useCallback(async (backupId) => {
        setLoading(true);
        try {
            const response = await BackupService.deleteBackupForTenant(tenantId, backupId);
            if (response.success) {
                await fetchBackups();
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchBackups]);

    const downloadBackup = useCallback(async (backupId) => {
        try {
            const blob = await BackupService.downloadBackupForTenant(tenantId, backupId);
            return { success: true, data: blob };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [tenantId]);

    const getLatestBackup = useCallback(() => {
        if (backups.length === 0) return null;
        return backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    }, [backups]);

    const getCompletedBackups = useCallback(() => {
        return backups.filter(b => b.status === 'completed');
    }, [backups]);

    const getFailedBackups = useCallback(() => {
        return backups.filter(b => b.status === 'failed');
    }, [backups]);

    useEffect(() => {
        fetchBackups();
    }, [fetchBackups]);

    return {
        backups,
        loading,
        error,
        creatingBackup,
        restoringBackup,
        refresh: fetchBackups,
        createBackup,
        restoreBackup,
        deleteBackup,
        downloadBackup,
        getLatestBackup,
        getCompletedBackups,
        getFailedBackups,
        hasBackups: backups.length > 0,
        latestBackup: getLatestBackup(),
    };
};