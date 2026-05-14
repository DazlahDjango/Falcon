import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../services/billing/payment.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const usePayments = (filters = {}, options = {}) => {
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
        queryKey: [BILLING_QUERY_KEYS.PAYMENTS, queryParams],
        queryFn: async () => {
            const response = await paymentService.getPayments(queryParams);
            return response.data;
        },
        enabled,
        staleTime: 2 * 60 * 1000,
    });
};
export const usePayment = (paymentId, options = {}) => {
    const {
        enabled = !!paymentId,
        staleTime = 5 * 60 * 1000,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.PAYMENT_DETAIL(paymentId),
        queryFn: async () => {
            const response = await paymentService.getPaymentById(paymentId);
            return response.data;
        },
        enabled,
        staleTime,
    });
};
export const usePaymentSummary = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.PAYMENT_SUMMARY,
        queryFn: async () => {
            const response = await paymentService.getPaymentSummary();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
export const useRetryPayment = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (paymentId) => paymentService.retryPayment(paymentId),
        onSuccess: (response, paymentId) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.PAYMENT_DETAIL(paymentId) });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.PAYMENTS] });
            dispatch(showToast({ message: 'Payment retry initiated', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to retry payment', type: 'error' }));
        },
    });
};
export const useRequestRefund = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: ({ paymentId, amount, reason }) => 
            paymentService.requestRefund(paymentId, amount, reason),
        onSuccess: (response, { paymentId }) => {
            queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.PAYMENT_DETAIL(paymentId) });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.PAYMENTS] });
            dispatch(showToast({ message: 'Refund request submitted', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to request refund', type: 'error' }));
        },
    });
};