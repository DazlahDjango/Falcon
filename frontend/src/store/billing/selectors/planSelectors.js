import { createSelector } from '@reduxjs/toolkit';
import { PLAN_TYPES, BILLING_INTERVALS } from '../../../config/constants/billingConstants';

const selectPlanState = (state) => state.billing?.plans || {};

export const selectAllPlans = createSelector([selectPlanState], (planState) => {
    const items = planState.items;
    if (Array.isArray(items)) return items;
    if (items && Array.isArray(items.results)) return items.results;
    return [];
});
export const selectPublicPlans = createSelector([selectPlanState], (planState) => {
    const publicPlans = planState.publicPlans;
    if (Array.isArray(publicPlans)) return publicPlans;
    if (publicPlans && Array.isArray(publicPlans.results)) return publicPlans.results;
    return [];
});
export const selectPlanComparison = createSelector([selectPlanState], (planState) => planState.comparison || []);
export const selectSelectedPlan = createSelector([selectPlanState], (planState) => planState.selectedPlan);
export const selectPlansLoading = createSelector([selectPlanState], (planState) => planState.loading);
export const selectPlansError = createSelector([selectPlanState], (planState) => planState.error);
export const selectPlanFilters = createSelector([selectPlanState], (planState) => planState.filters);

export const selectActivePlans = createSelector([selectAllPlans], (plans) => plans.filter(p => p.is_active));
export const selectBasicPlans = createSelector([selectActivePlans], (plans) => plans.filter(p => p.plan_type === PLAN_TYPES.BASIC));
export const selectProfessionalPlans = createSelector([selectActivePlans], (plans) => plans.filter(p => p.plan_type === PLAN_TYPES.PROFESSIONAL));
export const selectEnterprisePlans = createSelector([selectActivePlans], (plans) => plans.filter(p => p.plan_type === PLAN_TYPES.ENTERPRISE));
export const selectMonthlyPlans = createSelector([selectActivePlans], (plans) => plans.filter(p => p.billing_interval === BILLING_INTERVALS.MONTHLY));
export const selectYearlyPlans = createSelector([selectActivePlans], (plans) => plans.filter(p => p.billing_interval === BILLING_INTERVALS.YEARLY));
export const selectPlanById = (id) => createSelector([selectAllPlans, selectSelectedPlan], (plans, selected) => { if (selected?.id === id) return selected; return plans.find(p => p.id === id); });
export const selectPlanPriceDisplay = (id) => createSelector([selectPlanById(id)], (plan) => {
    if (!plan) return null;
    return { monthly: `${plan.currency} ${(plan.price / 100).toFixed(2)}`, yearly: plan.yearly_price ? `${plan.currency} ${(plan.yearly_price / 100).toFixed(2)}` : null };
});
export const selectIsPopularPlan = createSelector([selectSelectedPlan], (plan) => plan?.plan_type === PLAN_TYPES.PROFESSIONAL);
export const selectPlanFeatureList = (id) => createSelector([selectPlanById(id)], (plan) => plan?.features_list_display || []);