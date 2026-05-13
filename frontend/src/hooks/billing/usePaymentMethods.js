import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '../../services/billing/paymentMethod.service';
import { BILLING_QUERY_KEYS } from '../../config/constants/billingApiConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const usePaymentMethods = () => {
    return useQuery({
        queryKey: [BILLING_QUERY_KEYS.PAYMENT_METHODS],
        queryFn: async () => {
            const response = await paymentMethodService.getPaymentMethods();
            return response.data?.payment_methods || [];
        },
        staleTime: 60 * 1000, // 1 minute
    });
};
export const usePaymentMethod = (paymentMethodId, options = {}) => {
    const {
        enabled = !!paymentMethodId,
    } = options;
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.PAYMENT_METHOD_DETAIL(paymentMethodId),
        queryFn: async () => {
            const response = await paymentMethodService.getPaymentMethodById(paymentMethodId);
            return response.data;
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};
export const useDefaultPaymentMethod = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.DEFAULT_PAYMENT_METHOD,
        queryFn: async () => {
            const response = await paymentMethodService.getDefaultPaymentMethod();
            return response.data;
        },
        staleTime: 60 * 1000,
    });
};
export const useExpiringPaymentMethods = () => {
    return useQuery({
        queryKey: BILLING_QUERY_KEYS.EXPIRING_PAYMENT_METHODS,
        queryFn: async () => {
            const response = await paymentMethodService.getExpiringSoon();
            return response.data?.expiring_methods || [];
        },
        staleTime: 24 * 60 * 60 * 1000, // Check once per day
    });
};
export const useAddPaymentMethod = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: ({ paymentMethodId, setAsDefault = true }) => 
            paymentMethodService.addPaymentMethod(paymentMethodId, setAsDefault),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.PAYMENT_METHODS] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.DEFAULT_PAYMENT_METHOD] });
            dispatch(showToast({ message: 'Payment method added successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to add payment method', type: 'error' }));
        },
    });
};
export const useDeletePaymentMethod = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (paymentMethodId) => paymentMethodService.deletePaymentMethod(paymentMethodId),
        onSuccess: (response, paymentMethodId) => {
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.PAYMENT_METHODS] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.DEFAULT_PAYMENT_METHOD] });
            dispatch(showToast({ message: 'Payment method deleted successfully', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to delete payment method', type: 'error' }));
        },
    });
};
export const useSetDefaultPaymentMethod = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (paymentMethodId) => paymentMethodService.setDefaultPaymentMethod(paymentMethodId),
        onSuccess: (response, paymentMethodId) => {
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.PAYMENT_METHODS] });
            queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.DEFAULT_PAYMENT_METHOD] });
            dispatch(showToast({ message: 'Default payment method updated', type: 'success' }));
        },
        onError: (error) => {
            dispatch(showToast({ message: error.message || 'Failed to set default payment method', type: 'error' }));
        },
    });
};