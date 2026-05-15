/**
 * useInvoice Hook
 * Manages single invoice data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { InvoiceService } from '../../services/billing';
import { INVOICE_STATUS } from '../../config/constants/billingConstants';

export const useInvoice = (invoiceId, options = {}) => {
    const {
        autoFetch = true,
        onStatusChange = null,
    } = options;

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [paying, setPaying] = useState(false);
    const [sending, setSending] = useState(false);

    // Fetch invoice
    const fetchInvoice = useCallback(async (forceRefresh = false) => {
        if (!invoiceId) return null;
        
        setLoading(true);
        setError(null);

        try {
            const response = await InvoiceService.getInvoice(invoiceId);
            const data = response?.data;
            
            const previousStatus = invoice?.status;
            setInvoice(data);
            
            // Notify on status change
            if (previousStatus && previousStatus !== data?.status && onStatusChange) {
                onStatusChange({
                    previousStatus,
                    newStatus: data?.status,
                    invoice: data,
                });
            }
            
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch invoice');
            console.error('[useInvoice] Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [invoiceId, invoice?.status, onStatusChange]);

    // Download invoice PDF
    const downloadPDF = useCallback(async () => {
        if (!invoiceId) return;
        
        setDownloading(true);
        setError(null);

        try {
            await InvoiceService.downloadInvoice(invoiceId, 'pdf');
            return true;
        } catch (err) {
            setError(err.message || 'Failed to download invoice');
            console.error('[useInvoice] Download error:', err);
            throw err;
        } finally {
            setDownloading(false);
        }
    }, [invoiceId]);

    // Pay invoice
    const payInvoice = useCallback(async (paymentMethodId = null) => {
        if (!invoiceId) return;
        
        setPaying(true);
        setError(null);

        try {
            const response = await InvoiceService.payInvoice(invoiceId, { payment_method_id: paymentMethodId });
            await fetchInvoice(true);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to pay invoice');
            console.error('[useInvoice] Payment error:', err);
            throw err;
        } finally {
            setPaying(false);
        }
    }, [invoiceId, fetchInvoice]);

    // Send invoice email
    const sendEmail = useCallback(async () => {
        if (!invoiceId) return;
        
        setSending(true);
        setError(null);

        try {
            const response = await InvoiceService.sendInvoiceEmail(invoiceId);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to send invoice email');
            console.error('[useInvoice] Send email error:', err);
            throw err;
        } finally {
            setSending(false);
        }
    }, [invoiceId]);

    // Auto-fetch on mount or ID change
    useEffect(() => {
        if (autoFetch && invoiceId) {
            fetchInvoice();
        }
    }, [autoFetch, invoiceId, fetchInvoice]);

    // Computed values
    const isPaid = invoice?.status === INVOICE_STATUS.PAID;
    const isPending = invoice?.status === INVOICE_STATUS.PENDING;
    const isOverdue = invoice?.status === INVOICE_STATUS.OVERDUE;
    const isCancelled = invoice?.status === INVOICE_STATUS.CANCELLED;
    const isRefunded = invoice?.status === INVOICE_STATUS.REFUNDED;
    
    const canPay = isPending || isOverdue;
    const canDownload = invoice?.pdf_url || invoice?.status !== INVOICE_STATUS.DRAFT;
    const canSendEmail = invoice?.status !== INVOICE_STATUS.DRAFT;

    const totalDisplay = invoice ? `${invoice.currency} ${(invoice.total_amount / 100).toFixed(2)}` : null;
    const subtotalDisplay = invoice ? `${invoice.currency} ${(invoice.subtotal / 100).toFixed(2)}` : null;
    const taxDisplay = invoice ? `${invoice.currency} ${(invoice.tax_amount / 100).toFixed(2)}` : null;

    return {
        // State
        invoice,
        loading,
        error,
        downloading,
        paying,
        sending,
        
        // Status flags
        isPaid,
        isPending,
        isOverdue,
        isCancelled,
        isRefunded,
        canPay,
        canDownload,
        canSendEmail,
        
        // Display values
        totalDisplay,
        subtotalDisplay,
        taxDisplay,
        
        // Actions
        fetchInvoice,
        downloadPDF,
        payInvoice,
        sendEmail,
    };
};

export default useInvoice;