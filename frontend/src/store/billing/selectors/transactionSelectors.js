import { createSelector } from '@reduxjs/toolkit';
import { TRANSACTION_STATUS } from '../../../config/constants/billingConstants';

const selectTransactionState = (state) => state.billing?.transactions || {};

export const selectAllTransactions = createSelector([selectTransactionState], (txState) => {
    const items = txState.items;
    if (Array.isArray(items)) return items;
    if (items && Array.isArray(items.results)) return items.results;
    return [];
});
export const selectSelectedTransaction = createSelector([selectTransactionState], (txState) => txState.selectedTransaction);
export const selectTransactionsLoading = createSelector([selectTransactionState], (txState) => txState.loading);
export const selectTransactionsError = createSelector([selectTransactionState], (txState) => txState.error);
export const selectTransactionSummary = createSelector([selectTransactionState], (txState) => txState.summary);
export const selectTransactionPagination = createSelector([selectTransactionState], (txState) => txState.pagination);
export const selectTransactionFilters = createSelector([selectTransactionState], (txState) => txState.filters);

export const selectSuccessfulTransactions = createSelector([selectAllTransactions], (txs) => txs.filter(t => t.status === TRANSACTION_STATUS.SUCCESS));
export const selectFailedTransactions = createSelector([selectAllTransactions], (txs) => txs.filter(t => t.status === TRANSACTION_STATUS.FAILED));
export const selectPendingTransactions = createSelector([selectAllTransactions], (txs) => txs.filter(t => t.status === TRANSACTION_STATUS.PENDING));
export const selectRefundedTransactions = createSelector([selectAllTransactions], (txs) => txs.filter(t => t.status === TRANSACTION_STATUS.REFUNDED));
export const selectTotalSpent = createSelector([selectTransactionSummary], (summary) => summary?.total_spent || 0);
export const selectTotalSpentDisplay = createSelector([selectTotalSpent], (amount) => amount ? `KES ${(amount / 100).toFixed(2)}` : 'KES 0.00');
export const selectTransactionById = (id) => createSelector([selectAllTransactions, selectSelectedTransaction], (txs, selected) => { if (selected?.id === id) return selected; return txs.find(t => t.id === id); });
export const selectRecentTransactions = (limit = 5) => createSelector([selectAllTransactions], (txs) => [...txs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit));
export const selectSubscriptionTransactions = (subscriptionId) => createSelector([selectAllTransactions], (txs) => txs.filter(t => t.subscription_id === subscriptionId));
// Add this to your existing transactionSelectors.js
export const selectTransactionAdminStats = (state) => state.billing?.transactions?.adminStats || null;
export const selectAdminStatsLoading = (state) => state.billing?.transactions?.adminStatsLoading || false;
export const selectMonthlyRevenueBreakdown = (state) => selectTransactionAdminStats(state)?.monthly_breakdown || [];
export const selectYearlyRevenueTotal = (state) => selectTransactionAdminStats(state)?.total_revenue || 0;
export const selectYearlyRevenueDisplay = (state) => {
    const total = selectYearlyRevenueTotal(state);
    return total ? `KES ${(total / 100).toFixed(2)}` : 'KES 0.00';
};