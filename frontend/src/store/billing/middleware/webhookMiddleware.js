import { createListenerMiddleware } from '@reduxjs/toolkit';
import { fetchWebhookLogs } from '../slices/webhookSlice';
import { fetchCurrentSubscription } from '../slices/subscriptionSlice';
import { fetchInvoiceSummary } from '../slices/invoiceSlice';

const webhookMiddleware = createListenerMiddleware();

webhookMiddleware.startListening({
    actionCreator: fetchWebhookLogs.fulfilled,
    effect: async (action, { dispatch, getState }) => {
        const failedCount = action.payload?.items?.filter(l => l.processing_status === 'failed').length;
        if (failedCount > 5) {
            console.warn(`[Webhook] High failure rate: ${failedCount} failed webhooks`);
        }
    },
});

webhookMiddleware.startListening({
    type: 'webhook/chargeSuccess',
    effect: async (action, { dispatch }) => {
        dispatch(fetchCurrentSubscription());
        dispatch(fetchInvoiceSummary());
    },
});

webhookMiddleware.startListening({
    type: 'webhook/subscriptionDisabled',
    effect: async (action, { dispatch }) => {
        dispatch(fetchCurrentSubscription());
    },
});

webhookMiddleware.startListening({
    type: 'webhook/invoicePaymentFailed',
    effect: async (action, { dispatch }) => {
        dispatch(fetchCurrentSubscription());
    },
});

export default webhookMiddleware.middleware;