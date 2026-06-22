import { createListenerMiddleware } from '@reduxjs/toolkit';
import { fetchCurrentSubscription, updateSubscriptionSettings } from '../slices/subscriptionSlice';
import { fetchPlans } from '../slices/planSlice';
import { fetchInvoiceSummary } from '../slices/invoiceSlice';
import { fetchTransactionSummary } from '../slices/transactionSlice';
import { fetchUsageSummary } from '../slices/usageSlice';

// Import PlanService from the correct path
import { PlanService } from '../../../services/billing';

const billingMiddleware = createListenerMiddleware();

billingMiddleware.startListening({
    actionCreator: updateSubscriptionSettings.fulfilled,
    effect: async (action, { dispatch }) => {
        dispatch(fetchCurrentSubscription());
    },
});

billingMiddleware.startListening({
    actionCreator: fetchCurrentSubscription.fulfilled,
    effect: async (action, { dispatch }) => {
        if (action.payload?.id) {
            dispatch(fetchUsageSummary());
            dispatch(fetchInvoiceSummary());
            dispatch(fetchTransactionSummary());
        }
    },
});

billingMiddleware.startListening({
    actionCreator: fetchPlans.fulfilled,
    effect: async (action, { dispatch, getState }) => {
        const state = getState();
        const currentPlan = state.billing?.subscriptions?.current?.plan;
        if (currentPlan && !state.billing?.plans?.comparison?.length) {
            try {
                const response = await PlanService.getPlanComparison();
                if (response?.data) {
                    dispatch({ type: 'billing/plans/setComparison', payload: response.data });
                }
            } catch (err) {
                console.error('Failed to fetch plan comparison:', err);
            }
        }
    },
});

export default billingMiddleware.middleware;