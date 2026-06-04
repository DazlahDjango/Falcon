import { createListenerMiddleware } from '@reduxjs/toolkit';
import { fetchCurrentSubscription, updateSubscriptionSettings } from '../slices/subscriptionSlice';
import { fetchPlans } from '../slices/planSlice';
import { fetchInvoiceSummary } from '../slices/invoiceSlice';
import { fetchTransactionSummary } from '../slices/transactionSlice';
import { fetchUsageSummary } from '../slices/usageSlice';
import { fetchAuditSummary } from '../slices/auditSlice';

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
        const currentPlan = state.billing.subscriptions?.current?.plan;
        if (currentPlan && !state.billing.plans?.comparison?.length) {
            const { PlanService } = await import('../../../services/billing');
            const response = await PlanService.getPlanComparison();
            if (response?.data) {
                dispatch({ type: 'billing/plans/setComparison', payload: response.data });
            }
        }
    },
});

export default billingMiddleware.middleware;