import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '../../services/billing/subscription.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';

export const useSubscriptions = (filters = {}, options = {}) => {
    const {
        enabled = true,
        page = 1,
        pageSize = 20,
        status = null,
        planType = null,
        billingInterval = null,
    } = options;
    const queryParams = {
        page,
        page_size: pageSize,
        ...(status && { status }),
        ...(planType && { plan_type: planType }),
        ...(billingInterval && { billing_interval: billingInterval }),
        ...filters,
    };
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.SUBSCRIPTIONS, queryParams],
        queryFn: async () => {
            const response = await subscriptionService.getSubscriptions(queryParams);
            return response.data;
        },
        enabled,
        staleTime: 2 * 60 * 1000,
    });
};
export const useSubscriptionHistory = (subscriptionId, options = {}) => {
    const {
        enabled = !!subscriptionId,
        limit = 50,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION_HISTORY(subscriptionId),
        queryFn: async () => {
            const response = await subscriptionService.getSubscriptionHistory(subscriptionId);
            const history = response.data?.history || [];
            return limit ? history.slice(0, limit) : history;
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};