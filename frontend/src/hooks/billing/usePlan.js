import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/billing/plan.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';

export const usePlan = (planId, options = {}) => {
    const {
        enabled = !!planId,
        staleTime = 5 * 60 * 1000,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.PLAN_DETAIL(planId),
        queryFn: async () => {
            const response = await planService.getPlanById(planId);
            return response.data;
        },
        enabled,
        staleTime,
    });
};
export const usePlanBySlug = (slug, options = {}) => {
    const {
        enabled = !!slug,
        staleTime = 5 * 60 * 1000,
    } = options;
    return useQuery({
        queryKey: ['billing-plan-slug', slug],
        queryFn: async () => {
            const response = await planService.getPlanBySlug(slug);
            return response.data;
        },
        enabled,
        staleTime,
    });
};
export const usePlanFeatures = (planId, options = {}) => {
    const {
        enabled = !!planId,
        staleTime = 10 * 60 * 1000,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.PLAN_FEATURES(planId),
        queryFn: async () => {
            const response = await planService.getPlanFeatures(planId);
            return response.data || [];
        },
        enabled,
        staleTime,
    });
};