/**
 * Transaction Selectors
 * Memoized selectors for transaction state
 */

import { createSelector } from '@reduxjs/toolkit';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '../../../config/constants/billingConstants';

// Base selector
const selectTransactionState = (state) => state.billing?.transactions || {};

// Basic selectors
export const selectAllTransactions = createSelector(
    [selectTransactionState],
    (txState) => txState.items || []
);

export const selectTransactionsLoading = createSelector(
    [selectTransactionState],
    (txState) => txState.loading
);

export const selectTransactionsError = createSelector(
    [selectTransactionState],
    (txState) => txState.error
);

export const selectSelectedTransaction = createSelector(
    [selectTransactionState],
    (txState) => txState.selectedTransaction
);

export const selectTransactionSummary = createSelector(
    [selectTransactionState],
    (txState) => txState.summary
);

// Computed selectors
export const selectSuccessfulTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => transactions.filter(t => t.status === TRANSACTION_STATUS.SUCCESS)
);

export const selectFailedTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => transactions.filter(t => t.status === TRANSACTION_STATUS.FAILED)
);

export const selectPendingTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => transactions.filter(t => t.status === TRANSACTION_STATUS.PENDING)
);

export const selectRefundedTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => transactions.filter(t => t.status === TRANSACTION_STATUS.REFUNDED)
);

export const selectSubscriptionTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => transactions.filter(t => 
        t.transaction_type === TRANSACTION_TYPES.SUBSCRIPTION || 
        t.transaction_type === TRANSACTION_TYPES.RENEWAL
    )
);

export const selectTotalRevenue = createSelector(
    [selectSuccessfulTransactions],
    (transactions) => transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
);

export const selectTotalRevenueDisplay = createSelector(
    [selectTotalRevenue],
    (revenue) => revenue ? `KES ${(revenue / 100).toFixed(2)}` : 'KES 0.00'
);

export const selectTotalTaxCollected = createSelector(
    [selectSuccessfulTransactions],
    (transactions) => transactions.reduce((sum, t) => sum + (t.tax_amount || 0), 0)
);

export const selectSuccessRate = createSelector(
    [selectAllTransactions, selectSuccessfulTransactions],
    (all, successful) => {
        if (all.length === 0) return 0;
        return (successful.length / all.length) * 100;
    }
);

export const selectTransactionByReference = (reference) => createSelector(
    [selectAllTransactions],
    (transactions) => transactions.find(t => t.reference === reference)
);

export const selectTransactionById = (id) => createSelector(
    [selectAllTransactions, selectSelectedTransaction],
    (transactions, selected) => {
        if (selected?.id === id) return selected;
        return transactions.find(t => t.id === id);
    }
);