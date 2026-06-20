import { createSelector } from '@reduxjs/toolkit';

const selectEnterpriseState = (state) => state.billing?.enterprise || {};

export const selectOverrides = createSelector([selectEnterpriseState], (enterprise) => enterprise.overrides || []);
export const selectDynamicPlans = createSelector([selectEnterpriseState], (enterprise) => enterprise.dynamicPlans || []);
export const selectActiveOverride = createSelector([selectEnterpriseState], (enterprise) => enterprise.activeOverride);
export const selectEnterprisePagination = createSelector([selectEnterpriseState], (enterprise) => enterprise.pagination);
export const selectEnterpriseLoading = createSelector([selectEnterpriseState], (enterprise) => enterprise.loading);
export const selectEnterpriseError = createSelector([selectEnterpriseState], (enterprise) => enterprise.error);

export const selectActiveOverrides = createSelector([selectOverrides], (overrides) => overrides.filter(o => o.is_active));
export const selectExpiredOverrides = createSelector([selectOverrides], (overrides) => overrides.filter(o => !o.is_active));
export const selectOverrideByTenant = (tenantId) => createSelector([selectOverrides], (overrides) => overrides.find(o => o.tenant_id === tenantId));
export const selectDiscountPercentage = createSelector([selectActiveOverride], (override) => override?.discount_percentage || 0);
export const selectCustomPrice = createSelector([selectActiveOverride], (override) => override?.custom_price_monthly || null);
export const selectDynamicPlanById = (id) => createSelector([selectDynamicPlans], (plans) => plans.find(p => p.id === id));
export const selectDynamicPlanFeatures = (id) => createSelector([selectDynamicPlanById(id)], (plan) => plan?.dynamic_features || []);