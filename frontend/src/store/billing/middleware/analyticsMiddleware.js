import { createListenerMiddleware } from '@reduxjs/toolkit';
import { fetchBillingSummary } from '../slices/analyticsSlice';
import { fetchCurrentSubscription } from '../slices/subscriptionSlice';
import { fetchTransactions } from '../slices/transactionSlice';

const analyticsMiddleware = createListenerMiddleware();

analyticsMiddleware.startListening({
    actionCreator: fetchCurrentSubscription.fulfilled,
    effect: async (action, { dispatch }) => {
        dispatch(fetchBillingSummary());
    },
});

analyticsMiddleware.startListening({
    actionCreator: fetchTransactions.fulfilled,
    effect: async (action, { dispatch }) => {
        dispatch(fetchBillingSummary());
    },
});

export default analyticsMiddleware.middleware;