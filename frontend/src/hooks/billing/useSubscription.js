import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../services/billing/subscription.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useSubscription = (subscriptionId, options = {}) => {
    const {
        enabled = !!subscriptionId,
        staleTime = 60 * 1000, // 1 minute
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_DETAIL(subscriptionId),
        queryFn: async () => {
            const response = await subscriptionService.getSubscriptionById(subscriptionId);
            return response.data;
        },
        enabled,
        staleTime,
    });
};
export const useCurrentSubscription = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.CURRENT_SUBSCRIPTION,
        queryFn: async () => {
            const response = await subscriptionService.getCurrentSubscription();
            return response.data;
        },
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
    });
};
export const useSubscriptionStatus = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_STATUS,
        queryFn: async () => {
            const response = await subscriptionService.getSubscriptionStatus();
            return response.data;
        },
        staleTime: 30 * 1000, // 30 seconds - important for real-time status
        refetchOnWindowFocus: true,
    });
};
export const useCreateSubscription = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: (data) => subscriptionService.createSubscription(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.CURRENT_SUBSCRIPTION] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.SUBSCRIPTION_STATUS] });
            dispatch(showToast({ message: 'Subscription created successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to create subscription', type: 'error' }));
        },
    });
};
export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: ({ id, data }) => subscriptionService.updateSubscription(id, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_DETAIL(variables.id) });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.CURRENT_SUBSCRIPTION] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.SUBSCRIPTION_STATUS] });
            dispatch(showToast({ message: 'Subscription updated successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to update subscription', type: 'error' }));
        },
    });
};
export const useCancelSubscription = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: ({ id, atPeriodEnd = true, reason = '' }) => 
            subscriptionService.cancelSubscription(id, atPeriodEnd, reason),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_DETAIL(variables.id) });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.CURRENT_SUBSCRIPTION] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.SUBSCRIPTION_STATUS] });
            dispatch(showToast({ 
                message: variables.atPeriodEnd 
                    ? 'Subscription will be cancelled at period end' 
                    : 'Subscription cancelled successfully', 
                type: 'success' 
            }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to cancel subscription', type: 'error' }));
        },
    });
};
export const useReactivateSubscription = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (id) => subscriptionService.reactivateSubscription(id),
        onSuccess: (response, id) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_DETAIL(id) });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.CURRENT_SUBSCRIPTION] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.SUBSCRIPTION_STATUS] });
            dispatch(showToast({ message: 'Subscription reactivated successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to reactivate subscription', type: 'error' }));
        },
    });
};
export const useSyncSubscription = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (id) => subscriptionService.syncSubscription(id),
        onSuccess: (response, id) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_DETAIL(id) });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.CURRENT_SUBSCRIPTION] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.SUBSCRIPTION_STATUS] });
            dispatch(showToast({ message: 'Subscription synced successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to sync subscription', type: 'error' }));
        },
    });
};
export const useUpgradeSubscription = () => {
    const updateSubscription = useUpdateSubscription();
    return useMutation({
        mutationFn: ({ id, newPlanId }) => 
            updateSubscription.mutateAsync({ id, data: { plan_id: newPlanId } }),
        onSuccess: () => {
        },
    });
};
export const useDowngradeSubscription = () => {
    const updateSubscription = useUpdateSubscription();
    return useMutation({
        mutationFn: ({ id, newPlanId }) => 
            updateSubscription.mutateAsync({ id, data: { plan_id: newPlanId } }),
        onSuccess: () => {
        },
    });
};