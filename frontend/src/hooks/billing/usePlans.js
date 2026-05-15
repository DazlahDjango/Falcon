import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlanService } from '../../services/billing';
import { PLAN_TYPES, BILLING_INTERVALS, BILLING_TIME_CONSTANTS } from '../../config/constants/billingConstants';

// Cache for plans data
let plansCache = null;
let cacheTimestamp = null;
const CACHE_TTL = BILLING_TIME_CONSTANTS.CACHE_TTL.PLANS;

export const usePlans = (options = {}) => {
    const {
        autoFetch = true,
        includeTrial = false,
        planType = null,
        billingInterval = BILLING_INTERVALS.MONTHLY,
        cacheEnabled = true,
    } = options;

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState(billingInterval);

    // Check if cache is valid
    const isCacheValid = useCallback(() => {
        if (!cacheEnabled || !plansCache || !cacheTimestamp) return false;
        return (Date.now() - cacheTimestamp) < CACHE_TTL;
    }, [cacheEnabled]);

    // Get cached plans
    const getCachedPlans = useCallback(() => {
        if (isCacheValid()) {
            return plansCache;
        }
        return null;
    }, [isCacheValid]);

    // Update cache
    const updateCache = useCallback((data) => {
        if (cacheEnabled) {
            plansCache = data;
            cacheTimestamp = Date.now();
        }
    }, [cacheEnabled]);

    // Fetch plans
    const fetchPlans = useCallback(async (forceRefresh = false) => {
        // Check cache first
        if (!forceRefresh && isCacheValid()) {
            const cached = getCachedPlans();
            if (cached) {
                setPlans(cached);
                setLoading(false);
                return cached;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const params = {};
            if (planType) params.plan_type = planType;
            if (billingInterval) params.billing_interval = billingInterval;
            if (!includeTrial) params.exclude_trial = true;

            const response = await PlanService.getPlans(params);
            let plansData = response?.data || [];

            // Filter by billing cycle if needed
            if (billingCycle !== billingInterval) {
                plansData = plansData.filter(p => p.billing_interval === billingCycle);
            }

            setPlans(plansData);
            updateCache(plansData);
            return plansData;
        } catch (err) {
            setError(err.message || 'Failed to fetch plans');
            console.error('[usePlans] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [planType, billingInterval, includeTrial, billingCycle, isCacheValid, getCachedPlans, updateCache]);

    // Get single plan by ID
    const getPlanById = useCallback(async (planId) => {
        if (!planId) return null;
        
        // Check local state first
        const localPlan = plans.find(p => p.id === planId);
        if (localPlan) return localPlan;

        try {
            const response = await PlanService.getPlan(planId);
            return response?.data || null;
        } catch (err) {
            console.error('[usePlans] Error fetching plan:', err);
            return null;
        }
    }, [plans]);

    // Get plan by type
    const getPlanByType = useCallback((planTypeValue) => {
        return plans.find(p => p.plan_type === planTypeValue);
    }, [plans]);

    // Get popular plan (Professional)
    const getPopularPlan = useCallback(() => {
        return plans.find(p => p.plan_type === PLAN_TYPES.PROFESSIONAL);
    }, [plans]);

    // Get pricing for specific plan
    const getPlanPrice = useCallback((planId, cycle = billingCycle) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return null;
        
        if (cycle === BILLING_INTERVALS.YEARLY && plan.yearly_price) {
            return {
                amount: plan.yearly_price,
                display: `${plan.currency} ${(plan.yearly_price / 100).toFixed(2)}`,
                interval: BILLING_INTERVALS.YEARLY,
            };
        }
        
        return {
            amount: plan.price,
            display: `${plan.currency} ${(plan.price / 100).toFixed(2)}`,
            interval: BILLING_INTERVALS.MONTHLY,
        };
    }, [plans, billingCycle]);

    // Compare plans
    const comparePlans = useCallback(async (planIds) => {
        try {
            const response = await PlanService.comparePlans(planIds);
            return response?.data || null;
        } catch (err) {
            console.error('[usePlans] Error comparing plans:', err);
            return null;
        }
    }, []);

    // Select a plan
    const selectPlan = useCallback((plan) => {
        setSelectedPlan(plan);
    }, []);

    // Clear selected plan
    const clearSelectedPlan = useCallback(() => {
        setSelectedPlan(null);
    }, []);

    // Toggle billing cycle
    const toggleBillingCycle = useCallback(() => {
        setBillingCycle(prev => 
            prev === BILLING_INTERVALS.MONTHLY 
                ? BILLING_INTERVALS.YEARLY 
                : BILLING_INTERVALS.MONTHLY
        );
    }, []);

    // Set billing cycle
    const setBillingCycleValue = useCallback((cycle) => {
        if (cycle === BILLING_INTERVALS.MONTHLY || cycle === BILLING_INTERVALS.YEARLY) {
            setBillingCycle(cycle);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchPlans();
        }
    }, [autoFetch, fetchPlans]);

    // Memoized values
    const memoizedPlans = useMemo(() => plans, [plans]);
    const memoizedPlansByType = useMemo(() => {
        const byType = {};
        plans.forEach(plan => {
            if (!byType[plan.plan_type]) byType[plan.plan_type] = [];
            byType[plan.plan_type].push(plan);
        });
        return byType;
    }, [plans]);

    const memoizedFeatures = useMemo(() => {
        const features = {};
        plans.forEach(plan => {
            features[plan.plan_type] = {
                maxUsers: plan.max_users,
                maxKpis: plan.max_kpis,
                ...plan,
            };
        });
        return features;
    }, [plans]);

    return {
        // State
        plans: memoizedPlans,
        loading,
        error,
        selectedPlan,
        billingCycle,
        
        // Computed
        hasPlans: plans.length > 0,
        popularPlan: getPopularPlan(),
        plansByType: memoizedPlansByType,
        features: memoizedFeatures,
        
        // Actions
        fetchPlans,
        getPlanById,
        getPlanByType,
        getPlanPrice,
        comparePlans,
        selectPlan,
        clearSelectedPlan,
        toggleBillingCycle,
        setBillingCycle: setBillingCycleValue,
    };
};

export default usePlans;