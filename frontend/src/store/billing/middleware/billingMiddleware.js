import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
    fetchCurrentSubscription,
    fetchInvoices,
    fetchTransactions,
    fetchPaymentMethods,
} from '../slices';
import { showToast } from '../../ui/slices/uiSlice';

export const billingMiddleware = createListenerMiddleware();
billingMiddleware.startListening({
    actionCreator: fetchCurrentSubscription.fulfilled,
    effect: async (action, { dispatch }) => {
        if (action.payload) {
            // Refresh invoices and transactions after subscription change
            await dispatch(fetchInvoices({ page: 1, pageSize: 10 }));
            await dispatch(fetchTransactions({ page: 1, pageSize: 10 }));
        }
    },
});

// Show toast on successful payment
billingMiddleware.startListening({
    matcher: (action) => 
        action.type?.startsWith('billing/checkout/verify/fulfilled'),
    effect: async (action, { dispatch }) => {
        const result = action.payload;
        if (result?.verified) {
            dispatch(showToast({
                message: 'Payment successful!',
                type: 'success',
                duration: 5000,
            }));
        }
    },
});

// Show toast on payment failure
billingMiddleware.startListening({
    matcher: (action) => 
        action.type?.startsWith('billing/checkout/init') && 
        action.type?.endsWith('/rejected'),
    effect: async (action, { dispatch }) => {
        dispatch(showToast({
            message: action.payload || 'Payment failed. Please try again.',
            type: 'error',
            duration: 5000,
        }));
    },
});

// Refresh payment methods after adding/deleting
billingMiddleware.startListening({
    matcher: (action) => 
        action.type?.startsWith('billing/paymentMethods/add/fulfilled') ||
        action.type?.startsWith('billing/paymentMethods/delete/fulfilled'),
    effect: async (action, { dispatch }) => {
        await dispatch(fetchPaymentMethods());
    },
});

export default billingMiddleware.middleware;