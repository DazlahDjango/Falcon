import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
    fetchCurrentSubscription,
    fetchInvoices,
    fetchTransactions,
    fetchInvoiceSummary,
    fetchTransactionSummary,
} from '../slices';
import { showToast } from '../../ui/slices/uiSlice';

export const webhookMiddleware = createListenerMiddleware();

// Handle payment success webhook
webhookMiddleware.startListening({
    matcher: (action) => 
        action.type === 'websocket/message' && 
        action.payload?.type === 'payment_success',
    effect: async (action, { dispatch }) => {
        const { data } = action.payload;
        
        // Refresh all billing data
        await Promise.all([
            dispatch(fetchCurrentSubscription()),
            dispatch(fetchInvoices({ page: 1, pageSize: 10 })),
            dispatch(fetchTransactions({ page: 1, pageSize: 10 })),
            dispatch(fetchInvoiceSummary()),
            dispatch(fetchTransactionSummary()),
        ]);
        
        dispatch(showToast({
            message: `Payment of ${data?.amount_display || 'amount'} received!`,
            type: 'success',
            duration: 5000,
        }));
    },
});

// Handle payment failed webhook
webhookMiddleware.startListening({
    matcher: (action) => 
        action.type === 'websocket/message' && 
        action.payload?.type === 'payment_failed',
    effect: async (action, { dispatch }) => {
        const { data } = action.payload;
        
        await Promise.all([
            dispatch(fetchInvoices({ page: 1, pageSize: 10 })),
            dispatch(fetchInvoiceSummary()),
        ]);
        
        dispatch(showToast({
            message: data?.message || 'Payment failed. Please update your payment method.',
            type: 'error',
            duration: 5000,
        }));
    },
});

// Handle subscription update webhook
webhookMiddleware.startListening({
    matcher: (action) => 
        action.type === 'websocket/message' && 
        action.payload?.type === 'subscription_updated',
    effect: async (action, { dispatch }) => {
        const { data } = action.payload;
        
        await dispatch(fetchCurrentSubscription());
        
        dispatch(showToast({
            message: `Subscription ${data?.status || 'updated'}.`,
            type: 'info',
            duration: 4000,
        }));
    },
});

// Handle invoice ready webhook
webhookMiddleware.startListening({
    matcher: (action) => 
        action.type === 'websocket/message' && 
        action.payload?.type === 'invoice_ready',
    effect: async (action, { dispatch }) => {
        const { data } = action.payload;
        
        await Promise.all([
            dispatch(fetchInvoices({ page: 1, pageSize: 10 })),
            dispatch(fetchInvoiceSummary()),
        ]);
        
        dispatch(showToast({
            message: `New invoice ${data?.invoice_number || ''} is ready`,
            type: 'info',
            duration: 4000,
        }));
    },
});

// Handle trial ending webhook
webhookMiddleware.startListening({
    matcher: (action) => 
        action.type === 'websocket/message' && 
        action.payload?.type === 'trial_ending',
    effect: async (action, { dispatch }) => {
        const { data } = action.payload;
        
        await dispatch(fetchCurrentSubscription());
        
        dispatch(showToast({
            message: `Your trial ends in ${data?.days_remaining || 0} days. Upgrade to continue!`,
            type: 'warning',
            duration: 10000,
        }));
    },
});

export default webhookMiddleware.middleware;