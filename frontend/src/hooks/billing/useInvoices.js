import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../../services/billing/invoice.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useInvoices = (filters = {}, options = {}) => {
    const {
        enabled = true,
        page = 1,
        pageSize = 20,
        status = null,
        dateFrom = null,
        dateTo = null,
    } = options;
    const queryParams = {
        page,
        page_size: pageSize,
        ...(status && status !== 'all' && { status }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        ...filters,
    };
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.INVOICES, queryParams],
        queryFn: async () => {
            const response = await invoiceService.getInvoices(queryParams);
            return response.data;
        },
        enabled,
        staleTime: 2 * 60 * 1000,
    });
};
export const useInvoice = (invoiceId, options = {}) => {
    const {
        enabled = !!invoiceId,
        staleTime = 5 * 60 * 1000,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.INVOICE_DETAIL(invoiceId),
        queryFn: async () => {
            const response = await invoiceService.getInvoiceById(invoiceId);
            return response.data;
        },
        enabled,
        staleTime,
    });
};
export const useInvoiceLineItems = (invoiceId, options = {}) => {
    const {
        enabled = !!invoiceId,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.INVOICE_LINE_ITEMS(invoiceId),
        queryFn: async () => {
            const response = await invoiceService.getInvoiceLineItems(invoiceId);
            return response.data || [];
        },
        enabled,
        staleTime: 10 * 60 * 1000,
    });
};
export const useOutstandingInvoices = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.OUTSTANDING_INVOICES,
        queryFn: async () => {
            const response = await invoiceService.getOutstandingInvoices();
            return response.data;
        },
        staleTime: 60 * 1000, // 1 minute - check frequently
        refetchOnWindowFocus: true,
    });
};
export const useInvoiceSummary = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.INVOICE_SUMMARY,
        queryFn: async () => {
            const response = await invoiceService.getInvoiceSummary();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
export const useDownloadInvoice = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (invoiceId) => invoiceService.downloadInvoice(invoiceId),
        onSuccess: (response, invoiceId) => {
            // Create blob download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            dispatch(showToast({ message: 'Invoice downloaded successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to download invoice', type: 'error' }));
        },
    });
};
export const useSendInvoiceReminder = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: (invoiceId) => invoiceService.sendPaymentReminder(invoiceId),
        onSuccess: (response, invoiceId) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.INVOICE_DETAIL(invoiceId) });
            dispatch(showToast({ message: 'Payment reminder sent successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to send reminder', type: 'error' }));
        },
    });
};