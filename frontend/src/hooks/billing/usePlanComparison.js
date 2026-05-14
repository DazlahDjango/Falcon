import { useQuery } from '@tanstack/react-query';
import { planService } from '../../services/billing/plan.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';

export const usePlanComparison = (planIds, options = {}) => {
    const {
        enabled = planIds && planIds.length >= 2,
        staleTime = 10 * 60 * 1000,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.PLAN_COMPARE(planIds),
        queryFn: async () => {
            const response = await planService.comparePlans(planIds);
            return response.data;
        },
        enabled,
        staleTime,
    });
};
export const usePlanComparisonMatrix = (planIds, options = {}) => {
    const { data: comparison, ...rest } = usePlanComparison(planIds, options);
    const matrix = React.useMemo(() => {
        if (!comparison) return null;
        const { plans, features } = comparison;
        const featureRows = Object.entries(features).map(([featureName, values]) => ({
            name: featureName,
            values: values.map(v => ({ value: v, isAvailable: v !== '—' && v !== 'No' })),
        }));
        return {
            plans,
            features: featureRows,
        };
    }, [comparison]);
    return {
        data: comparison,
        matrix,
        ...rest,
    };
};