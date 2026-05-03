// frontend/src/hooks/tenant/useTenantProvisioning.js
import { useState, useEffect, useCallback } from 'react';
import { ProvisioningService } from '../../services/tenant';
import { useTenantWebSocket } from './useTenantWebSocket';

export const useTenantProvisioning = (tenantId) => {
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { subscribeToProvisioning } = useTenantWebSocket();

    // Fetch provisioning status
    const fetchStatus = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await ProvisioningService.getProvisioningStatus(tenantId);
            if (response.success) {
                setStatus(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load provisioning status');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    // Fetch provisioning progress
    const fetchProgress = useCallback(async () => {
        if (!tenantId) return;

        try {
            const response = await ProvisioningService.getProvisioningProgress(tenantId);
            if (response.success) {
                setProgress(response.data);
            }
        } catch (err) {
            console.error('Failed to load progress:', err);
        }
    }, [tenantId]);

    // Fetch provisioning logs
    const fetchLogs = useCallback(async () => {
        if (!tenantId) return;

        try {
            const response = await ProvisioningService.getProvisioningLogs(tenantId);
            if (response.success) {
                setLogs(response.data);
            }
        } catch (err) {
            console.error('Failed to load logs:', err);
        }
    }, [tenantId]);

    // Retry failed provisioning
    const retryProvisioning = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ProvisioningService.retryProvisioning(tenantId);
            if (response.success) {
                await fetchStatus();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchStatus]);

    // Cancel provisioning
    const cancelProvisioning = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ProvisioningService.cancelProvisioning(tenantId);
            if (response.success) {
                await fetchStatus();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [tenantId, fetchStatus]);

    // Helper booleans
    const isProvisioning = status?.status === 'provisioning' || status?.status === 'pending';
    const isProvisioned = status?.status === 'active' && status?.provisioned_at;
    const isFailed = status?.status === 'failed';
    const progressPercentage = progress?.progress || 0;
    const currentStep = progress?.current_step || null;

    // Subscribe to real-time provisioning updates
    useEffect(() => {
        if (!tenantId || isProvisioned) return;

        const taskId = tenantId;
        const ws = subscribeToProvisioning(
            taskId,
            (data) => {
                setProgress(data);
                setStatus(prev => ({
                    ...prev,
                    progress: data.progress,
                    current_step: data.step
                }));
            },
            (data) => {
                setStatus(prev => ({
                    ...prev,
                    status: 'completed',
                    is_complete: true
                }));
                setProgress(null);
            },
            (data) => {
                setStatus(prev => ({
                    ...prev,
                    status: 'failed',
                    error: data.error
                }));
                setError(data.error);
                setProgress(null);
            }
        );

        return () => {
            if (ws) ws.close();
        };
    }, [tenantId, isProvisioned, subscribeToProvisioning]);

    useEffect(() => {
        fetchStatus();
        fetchProgress();
        fetchLogs();
    }, [fetchStatus, fetchProgress, fetchLogs]);

    return {
        // Data
        status,
        progress,
        logs,
        loading,
        error,

        // Actions
        refetch: fetchStatus,
        retryProvisioning,
        cancelProvisioning,

        // Helpers
        isProvisioning,
        isProvisioned,
        isFailed,
        progressPercentage,
        currentStep,
    };
};