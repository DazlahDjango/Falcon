import { createSelector } from '@reduxjs/toolkit';

const selectAdminState = (state) => state.billing?.admin || {};

export const selectTenantData = createSelector([selectAdminState], (admin) => admin.tenantData || {});
export const selectAdminRevenueReport = createSelector([selectAdminState], (admin) => admin.revenueReport);
export const selectSubscriptionReport = createSelector([selectAdminState], (admin) => admin.subscriptionReport);
export const selectAdminTransactionStats = createSelector([selectAdminState], (admin) => admin.transactionStats);
export const selectAdminOverdueInvoices = createSelector([selectAdminState], (admin) => admin.overdueInvoices || []);
export const selectAdminLoading = createSelector([selectAdminState], (admin) => admin.loading);
export const selectAdminError = createSelector([selectAdminState], (admin) => admin.error);

export const selectTenantSubscriptions = (tenantId) => createSelector([selectTenantData], (data) => data[tenantId]?.subscriptions || []);
export const selectTenantInvoices = (tenantId) => createSelector([selectTenantData], (data) => data[tenantId]?.invoices || []);
export const selectTenantTransactions = (tenantId) => createSelector([selectTenantData], (data) => data[tenantId]?.transactions || []);