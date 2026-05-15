/**
 * Plan Selectors
 * Memoized selectors for plan state
 */

import { createSelector } from '@reduxjs/toolkit';
import { PLAN_TYPES, BILLING_INTERVALS } from '../../../config/constants/billingConstants';

// Base selector
const selectPlanState = (state) => state.billing?.plans || {};

// Basic selectors
export const selectAllPlans = createSelector(
    [selectPlanState],
    (planState) => planState.items || []
);

export const selectPlansLoading = createSelector(
    [selectPlanState],
    (planState) => planState.loading
);

export const selectPlansError = createSelector(
    [selectPlanState],
    (planState) => planState.error
);

export const selectSelectedPlan = createSelector(
    [selectPlanState],
    (planState) => planState.selectedPlan
);

export const selectPopularPlan = createSelector(
    [selectPlanState],
    (planState) => planState.popularPlan
);

export const selectPlanComparison = createSelector(
    [selectPlanState],
    (planState) => planState.comparison
);

export const selectPlanFilters = createSelector(
    [selectPlanState],
    (planState) => planState.filters
);

// Computed selectors
export const selectActivePlans = createSelector(
    [selectAllPlans],
    (plans) => plans.filter(plan => plan.is_active !== false)
);

export const selectMonthlyPlans = createSelector(
    [selectActivePlans],
    (plans) => plans.filter(plan => plan.billing_interval === BILLING_INTERVALS.MONTHLY)
);

export const selectYearlyPlans = createSelector(
    [selectActivePlans],
    (plans) => plans.filter(plan => plan.billing_interval === BILLING_INTERVALS.YEARLY)
);

export const selectPlansByType = createSelector(
    [selectActivePlans],
    (plans) => {
        const byType = {};
        plans.forEach(plan => {
            if (!byType[plan.plan_type]) byType[plan.plan_type] = [];
            byType[plan.plan_type].push(plan);
        });
        return byType;
    }
);

export const selectBasicPlan = createSelector(
    [selectPlansByType],
    (byType) => byType[PLAN_TYPES.BASIC]?.[0] || null
);

export const selectProfessionalPlan = createSelector(
    [selectPlansByType],
    (byType) => byType[PLAN_TYPES.PROFESSIONAL]?.[0] || null
);

export const selectEnterprisePlan = createSelector(
    [selectPlansByType],
    (byType) => byType[PLAN_TYPES.ENTERPRISE]?.[0] || null
);

export const selectTrialPlan = createSelector(
    [selectPlansByType],
    (byType) => byType[PLAN_TYPES.TRIAL]?.[0] || null
);

export const selectPlanById = (planId) => createSelector(
    [selectAllPlans],
    (plans) => plans.find(plan => plan.id === planId)
);

export const selectPlanByType = (planType) => createSelector(
    [selectPlansByType],
    (byType) => byType[planType]?.[0] || null
);

export const selectPlanPricing = createSelector(
    [selectAllPlans],
    (plans) => {
        const pricing = {};
        plans.forEach(plan => {
            pricing[plan.plan_type] = {
                monthly: plan.price,
                yearly: plan.yearly_price || plan.price * 10,
                currency: plan.currency,
                monthlyDisplay: `${plan.currency} ${(plan.price / 100).toFixed(2)}`,
                yearlyDisplay: `${plan.currency} ${((plan.yearly_price || plan.price * 10) / 100).toFixed(2)}`,
            };
        });
        return pricing;
    }
);

export const selectHasPlans = createSelector(
    [selectAllPlans],
    (plans) => plans.length > 0
);

export const selectPlansLastFetched = createSelector(
    [selectPlanState],
    (planState) => planState.lastFetched
);