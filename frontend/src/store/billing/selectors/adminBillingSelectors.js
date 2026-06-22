import { createSelector } from '@reduxjs/toolkit';

const selectAdminState = (state) => state.billing?.admin || {};

export const selectTenantData = createSelector([selectAdminState], (admin) => admin.tenantData || {});
export const selectAdminRevenueReport = createSelector([selectAdminState], (admin) => admin.revenueReport);
export const selectSubscriptionReport = createSelector([selectAdminState], (admin) => admin.subscriptionReport);
export const selectAdminTaxReport = createSelector([selectAdminState], (admin) => admin.taxReport);
export const selectAdminLoading = createSelector([selectAdminState], (admin) => admin.loading);
export const selectAdminError = createSelector([selectAdminState], (admin) => admin.error);
export const selectBulkUpdateStatus = createSelector([selectAdminState], (admin) => admin.bulkUpdateStatus);

export const selectTenantSubscriptions = (tenantId) => createSelector([selectTenantData], (data) => data[tenantId]?.subscriptions || []);
export const selectTenantInvoices = (tenantId) => createSelector([selectTenantData], (data) => data[tenantId]?.invoices || []);
export const selectTenantTransactions = (tenantId) => createSelector([selectTenantData], (data) => data[tenantId]?.transactions || []);
export const selectBulkUpdateInProgress = createSelector([selectBulkUpdateStatus], (status) => status?.loading || false);
export const selectBulkUpdateSuccess = createSelector([selectBulkUpdateStatus], (status) => status?.success || false);
export const selectBulkUpdateMessage = createSelector([selectBulkUpdateStatus], (status) => status?.message || null);