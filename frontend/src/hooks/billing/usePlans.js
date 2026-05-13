import { useQuery, useQueryClient } from '@tanstack/react-query';
import { planService } from '../../services/billing/plan.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';

export const usePlans = (options = {}) => {
    const {
        enabled = true,
        includeInactive = false,
        planType = null,
        staleTime = 5 * 60 * 1000, // 5 minutes
    } = options;
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.PLANS, { includeInactive, planType }],
        queryFn: async () => {
            const params = {};
            if (planType) params.plan_type = planType;
            const response = await planService.getPlans(params);
            let plans = response.data || [];
            if (!includeInactive) {
                plans = plans.filter(plan => plan.is_active);
            }          
            return plans;
        },
        staleTime,
        enabled,
        select: (data) => ({
            plans: data,
            recommended: data.find(p => p.is_recommended),
            trial: data.find(p => p.plan_type === 'trial'),
            basic: data.find(p => p.plan_type === 'basic'),
            professional: data.find(p => p.plan_type === 'professional'),
            enterprise: data.find(p => p.plan_type === 'enterprise'),
        }),
    });
};
export const usePublicPlans = () => {
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.PLANS, 'public'],
        queryFn: async () => {
            const response = await planService.getPublicPlans();
            return response.data || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};