/**
 * useInvoices Hook
 * Manages invoices list with filtering and pagination
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { InvoiceService } from '../../services/billing';
import { INVOICE_STATUS, BILLING_PAGINATION } from '../../config/constants/billingConstants';

export const useInvoices = (options = {}) => {
    const {
        autoFetch = true,
        pageSize = BILLING_PAGINATION.DEFAULT_PAGE_SIZE,
        initialFilters = {},
    } = options;

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState(initialFilters);
    const [summary, setSummary] = useState(null);

    // Fetch invoices
    const fetchInvoices = useCallback(async (page = currentPage, newFilters = filters) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                page_size: pageSize,
                ...newFilters,
            };

            const response = await InvoiceService.getInvoices(params);
            const data = response?.data || [];
            
            setInvoices(data);
            setTotalCount(response?.count || data.length);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch invoices');
            console.error('[useInvoices] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    // Fetch invoice summary
    const fetchSummary = useCallback(async () => {
        try {
            const response = await InvoiceService.getInvoiceSummary();
            setSummary(response?.data || null);
            return response?.data;
        } catch (err) {
            console.error('[useInvoices] Error fetching summary:', err);
            return null;
        }
    }, []);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
    }, []);

    // Change page
    const goToPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Download invoice
    const downloadInvoice = useCallback(async (invoiceId, format = 'pdf') => {
        try {
            const response = await InvoiceService.downloadInvoice(invoiceId, format);
            
            if (format === 'pdf' && response?.data) {
                // Create blob URL for PDF
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `invoice_${invoiceId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            
            return response?.data;
        } catch (err) {
            console.error('[useInvoices] Error downloading:', err);
            throw err;
        }
    }, []);

    // Pay invoice
    const payInvoice = useCallback(async (invoiceId, paymentMethodId = null) => {
        try {
            const response = await InvoiceService.payInvoice(invoiceId, { payment_method_id: paymentMethodId });
            
            // Refresh list after payment
            await fetchInvoices();
            await fetchSummary();
            
            return response?.data;
        } catch (err) {
            console.error('[useInvoices] Error paying invoice:', err);
            throw err;
        }
    }, [fetchInvoices, fetchSummary]);

    // Send invoice email
    const sendInvoiceEmail = useCallback(async (invoiceId) => {
        try {
            const response = await InvoiceService.sendInvoiceEmail(invoiceId);
            return response?.data;
        } catch (err) {
            console.error('[useInvoices] Error sending email:', err);
            throw err;
        }
    }, []);

    // Auto-fetch
    useEffect(() => {
        if (autoFetch) {
            fetchInvoices(currentPage, filters);
            fetchSummary();
        }
    }, [autoFetch, currentPage, filters, fetchInvoices, fetchSummary]);

    // Memoized values
    const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
    
    const unpaidInvoices = useMemo(() => {
        return invoices.filter(i => i.status === INVOICE_STATUS.PENDING || i.status === INVOICE_STATUS.OVERDUE);
    }, [invoices]);
    
    const overdueInvoices = useMemo(() => {
        return invoices.filter(i => i.status === INVOICE_STATUS.OVERDUE);
    }, [invoices]);
    
    const paidInvoices = useMemo(() => {
        return invoices.filter(i => i.status === INVOICE_STATUS.PAID);
    }, [invoices]);
    
    const totalOutstanding = useMemo(() => {
        return summary?.total_outstanding || 0;
    }, [summary]);
    
    const totalPaid = useMemo(() => {
        return summary?.total_paid_amount || 0;
    }, [summary]);

    return {
        // State
        invoices,
        loading,
        error,
        summary,
        totalCount,
        currentPage,
        totalPages,
        filters,
        
        // Computed
        unpaidInvoices,
        overdueInvoices,
        paidInvoices,
        totalOutstanding,
        totalPaid,
        hasInvoices: invoices.length > 0,
        hasUnpaidInvoices: unpaidInvoices.length > 0,
        
        // Actions
        fetchInvoices,
        fetchSummary,
        updateFilters,
        clearFilters,
        goToPage,
        downloadInvoice,
        payInvoice,
        sendInvoiceEmail,
    };
};

export default useInvoices;