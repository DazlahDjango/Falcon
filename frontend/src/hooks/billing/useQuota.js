import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotaService } from '../../services/billing/quota.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';
import { QUOTA_WARNING_THRESHOLD, QUOTA_CRITICAL_THRESHOLD, QUOTA_DANGER_THRESHOLD } from '../../config/constants/billingConstants';

export const useQuota = () => {
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.QUOTA_STATUS],
        queryFn: async () => {
            const response = await quotaService.getQuotaStatus();
            return response.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
    });
};
export const useQuotaLimits = () => {
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.QUOTA_LIMITS],
        queryFn: async () => {
            const response = await quotaService.getQuotaLimits();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
export const useRefreshQuota = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: () => quotaService.refreshQuotaUsage(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.QUOTA_STATUS] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.QUOTA_USAGE] });
            dispatch(showToast({ message: 'Quota usage refreshed', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to refresh quota', type: 'error' }));
        },
    });
};
export const useQuotaAlert = () => {
    const { data: quotaStatus, isLoading } = useQuota();
    const getAlertLevel = (percentage) => {
        if (percentage >= QUOTA_DANGER_THRESHOLD) return 'danger';
        if (percentage >= QUOTA_CRITICAL_THRESHOLD) return 'critical';
        if (percentage >= QUOTA_WARNING_THRESHOLD) return 'warning';
        return 'success';
    };
    const alerts = React.useMemo(() => {
        if (!quotaStatus) return [];
        const alertsList = [];
        const quotaTypes = ['users', 'admins', 'kpis', 'storage', 'api_calls_today'];
        quotaTypes.forEach(type => {
            const quota = quotaStatus[type];
            if (quota && quota.max > 0) {
                const level = getAlertLevel(quota.percentage);
                if (level !== 'success') {
                    alertsList.push({
                        type,
                        level,
                        current: quota.current,
                        max: quota.max,
                        percentage: quota.percentage,
                        message: `${type} usage at ${quota.percentage}% of limit`,
                    });
                }
            }
        });
        return alertsList;
    }, [quotaStatus]);
    const hasCriticalAlerts = alerts.some(a => a.level === 'critical' || a.level === 'danger');
    const hasWarnings = alerts.some(a => a.level === 'warning');
    return {
        alerts,
        hasCriticalAlerts,
        hasWarnings,
        isLoading,
    };
};