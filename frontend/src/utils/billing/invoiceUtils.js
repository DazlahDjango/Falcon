/**
 * Invoice Utilities
 * Invoice generation and management helpers
 */

import { formatCurrency, formatBillingDate, formatInvoiceNumber } from './formatters';
import { calculateTax, calculateTotalWithTax } from './calculators';

/**
 * Get invoice status display properties
 * @param {string} status - Invoice status
 * @returns {Object} { label, color, icon }
 */
export const getInvoiceStatusProps = (status) => {
    const statusMap = {
        draft: { label: 'Draft', color: '#6b7280', icon: '📄', bgColor: '#f3f4f6' },
        pending: { label: 'Pending', color: '#f59e0b', icon: '⏳', bgColor: '#fef3c7' },
        paid: { label: 'Paid', color: '#10b981', icon: '✓', bgColor: '#d1fae5' },
        overdue: { label: 'Overdue', color: '#ef4444', icon: '⚠️', bgColor: '#fee2e2' },
        cancelled: { label: 'Cancelled', color: '#6b7280', icon: '✗', bgColor: '#f3f4f6' },
        refunded: { label: 'Refunded', color: '#8b5cf6', icon: '↺', bgColor: '#ede9fe' },
    };
    
    return statusMap[status] || { label: status, color: '#6b7280', icon: '📄', bgColor: '#f3f4f6' };
};

/**
 * Check if invoice is overdue
 * @param {Object} invoice - Invoice object
 * @returns {boolean} True if overdue
 */
export const isInvoiceOverdue = (invoice) => {
    if (!invoice) return false;
    if (invoice.status !== 'pending') return false;
    
    const dueDate = new Date(invoice.due_date);
    return dueDate < new Date();
};

/**
 * Get invoice summary statistics
 * @param {Array} invoices - List of invoices
 * @returns {Object} Summary statistics
 */
export const getInvoiceSummary = (invoices) => {
    if (!invoices || invoices.length === 0) {
        return {
            total: 0,
            paid: 0,
            pending: 0,
            overdue: 0,
            totalAmount: 0,
            totalPaid: 0,
            totalOutstanding: 0,
        };
    }
    
    const summary = {
        total: invoices.length,
        paid: 0,
        pending: 0,
        overdue: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalOutstanding: 0,
    };
    
    invoices.forEach(invoice => {
        summary.totalAmount += invoice.total_amount || 0;
        
        switch (invoice.status) {
            case 'paid':
                summary.paid++;
                summary.totalPaid += invoice.total_amount || 0;
                break;
            case 'pending':
                if (isInvoiceOverdue(invoice)) {
                    summary.overdue++;
                    summary.totalOutstanding += invoice.total_amount || 0;
                } else {
                    summary.pending++;
                    summary.totalOutstanding += invoice.total_amount || 0;
                }
                break;
            case 'overdue':
                summary.overdue++;
                summary.totalOutstanding += invoice.total_amount || 0;
                break;
        }
    });
    
    return summary;
};

/**
 * Generate invoice line item
 * @param {string} description - Item description
 * @param {number} quantity - Quantity
 * @param {number} unitPrice - Unit price in cents
 * @param {boolean} isTaxable - Whether item is taxable
 * @returns {Object} Line item object
 */
export const generateInvoiceLineItem = (description, quantity, unitPrice, isTaxable = true) => {
    const total = quantity * unitPrice;
    
    return {
        description,
        quantity,
        unit_price: unitPrice,
        total,
        is_taxable: isTaxable,
        unit_price_display: formatCurrency(unitPrice),
        total_display: formatCurrency(total),
    };
};

/**
 * Calculate invoice totals from line items
 * @param {Array} lineItems - List of line items
 * @param {number} taxRate - Tax rate percentage
 * @returns {Object} Calculated totals
 */
export const calculateInvoiceTotals = (lineItems, taxRate = 16) => {
    let subtotal = 0;
    let taxableSubtotal = 0;
    let exemptSubtotal = 0;
    
    lineItems.forEach(item => {
        const itemTotal = item.quantity * item.unit_price;
        subtotal += itemTotal;
        
        if (item.is_taxable !== false) {
            taxableSubtotal += itemTotal;
        } else {
            exemptSubtotal += itemTotal;
        }
    });
    
    const taxAmount = Math.round(taxableSubtotal * (taxRate / 100));
    const total = subtotal + taxAmount;
    
    return {
        subtotal,
        taxable_subtotal: taxableSubtotal,
        exempt_subtotal: exemptSubtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        subtotal_display: formatCurrency(subtotal),
        tax_display: formatCurrency(taxAmount),
        total_display: formatCurrency(total),
    };
};

/**
 * Format invoice for display
 * @param {Object} invoice - Raw invoice object
 * @returns {Object} Formatted invoice
 */
export const formatInvoiceForDisplay = (invoice) => {
    if (!invoice) return null;
    
    return {
        ...invoice,
        invoice_number_formatted: formatInvoiceNumber(invoice.invoice_number),
        invoice_date_formatted: formatBillingDate(invoice.invoice_date),
        due_date_formatted: formatBillingDate(invoice.due_date),
        paid_date_formatted: invoice.paid_at ? formatBillingDate(invoice.paid_at) : null,
        total_display: formatCurrency(invoice.total_amount, invoice.currency),
        subtotal_display: formatCurrency(invoice.subtotal, invoice.currency),
        tax_display: formatCurrency(invoice.tax_amount, invoice.currency),
        status_props: getInvoiceStatusProps(invoice.status),
        is_overdue: isInvoiceOverdue(invoice),
    };
};

/**
 * Generate invoice PDF filename
 * @param {Object} invoice - Invoice object
 * @returns {string} Filename
 */
export const generateInvoiceFilename = (invoice) => {
    const date = new Date(invoice.invoice_date).toISOString().split('T')[0];
    return `invoice_${invoice.invoice_number}_${date}.pdf`;
};