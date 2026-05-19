import { createSelector } from '@reduxjs/toolkit';
import { INVOICE_STATUS } from '../../../config/constants/billingConstants';

// Base selector
const selectInvoiceState = (state) => state.billing?.invoices || {};

// Basic selectors
export const selectAllInvoices = createSelector(
    [selectInvoiceState],
    (invState) => invState.items || []
);

export const selectInvoicesLoading = createSelector(
    [selectInvoiceState],
    (invState) => invState.loading
);

export const selectInvoicesError = createSelector(
    [selectInvoiceState],
    (invState) => invState.error
);

export const selectSelectedInvoice = createSelector(
    [selectInvoiceState],
    (invState) => invState.selectedInvoice
);

export const selectInvoiceSummary = createSelector(
    [selectInvoiceState],
    (invState) => invState.summary
);

export const selectInvoicePagination = createSelector(
    [selectInvoiceState],
    (invState) => invState.pagination
);

// Computed selectors
export const selectPendingInvoices = createSelector(
    [selectAllInvoices],
    (invoices) => invoices.filter(i => i.status === INVOICE_STATUS.PENDING)
);

export const selectOverdueInvoices = createSelector(
    [selectAllInvoices],
    (invoices) => invoices.filter(i => i.status === INVOICE_STATUS.OVERDUE)
);

export const selectPaidInvoices = createSelector(
    [selectAllInvoices],
    (invoices) => invoices.filter(i => i.status === INVOICE_STATUS.PAID)
);

export const selectUnpaidInvoices = createSelector(
    [selectAllInvoices],
    (invoices) => invoices.filter(i => i.status === INVOICE_STATUS.PENDING || i.status === INVOICE_STATUS.OVERDUE)
);

export const selectTotalOutstanding = createSelector(
    [selectInvoiceSummary],
    (summary) => summary?.total_outstanding || 0
);

export const selectTotalOutstandingDisplay = createSelector(
    [selectTotalOutstanding],
    (amount) => amount ? `KES ${(amount / 100).toFixed(2)}` : 'KES 0.00'
);

export const selectTotalPaidAmount = createSelector(
    [selectInvoiceSummary],
    (summary) => summary?.total_paid_amount || 0
);

export const selectHasUnpaidInvoices = createSelector(
    [selectUnpaidInvoices],
    (unpaid) => unpaid.length > 0
);

export const selectHasOverdueInvoices = createSelector(
    [selectOverdueInvoices],
    (overdue) => overdue.length > 0
);

export const selectInvoiceById = (id) => createSelector(
    [selectAllInvoices, selectSelectedInvoice],
    (invoices, selected) => {
        if (selected?.id === id) return selected;
        return invoices.find(i => i.id === id);
    }
);

export const selectInvoicesByDateRange = (startDate, endDate) => createSelector(
    [selectAllInvoices],
    (invoices) => invoices.filter(i => {
        const invoiceDate = new Date(i.invoice_date);
        return invoiceDate >= startDate && invoiceDate <= endDate;
    })
);