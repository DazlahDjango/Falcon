import { createSelector } from '@reduxjs/toolkit';

// Subscription Selectors
export const selectSubscriptionState = (state) => state.billingSubscription;
export const selectCurrentSubscription = createSelector(
    [selectSubscriptionState],
    (subscriptionState) => subscriptionState.current
);
export const selectSubscriptionStatus = createSelector(
    [selectSubscriptionState],
    (subscriptionState) => subscriptionState.status
);
export const selectIsSubscriptionActive = createSelector(
    [selectCurrentSubscription],
    (subscription) => subscription?.is_active || false
);
export const selectSubscriptionPlan = createSelector(
    [selectCurrentSubscription],
    (subscription) => subscription?.plan || null
);
export const selectSubscriptionPlanType = createSelector(
    [selectSubscriptionPlan],
    (plan) => plan?.plan_type || 'trial'
);
export const selectSubscriptionEndDate = createSelector(
    [selectCurrentSubscription],
    (subscription) => subscription?.current_period_end || null
);
export const selectDaysUntilExpiry = createSelector(
    [selectSubscriptionEndDate],
    (endDate) => {
        if (!endDate) return 0;
        const now = new Date();
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }
);
export const selectIsSubscriptionTrialing = createSelector(
    [selectCurrentSubscription],
    (subscription) => subscription?.status === 'trialing'
);
export const selectIsSubscriptionCanceled = createSelector(
    [selectCurrentSubscription],
    (subscription) => subscription?.status === 'canceled'
);
export const selectCancelAtPeriodEnd = createSelector(
    [selectCurrentSubscription],
    (subscription) => subscription?.cancel_at_period_end || false
);
export const selectSubscriptionLoading = createSelector(
    [selectSubscriptionState],
    (state) => state.isLoading
);
export const selectSubscriptionError = createSelector(
    [selectSubscriptionState],
    (state) => state.error
);
// Plan Selectors
export const selectPlanState = (state) => state.billingPlans;
export const selectAllPlans = createSelector(
    [selectPlanState],
    (planState) => planState.plans
);
export const selectPublicPlans = createSelector(
    [selectPlanState],
    (planState) => planState.publicPlans
);
export const selectCurrentPlan = createSelector(
    [selectPlanState],
    (planState) => planState.currentPlan
);
export const selectSelectedPlanId = createSelector(
    [selectPlanState],
    (planState) => planState.selectedPlanId
);
export const selectSelectedPlan = createSelector(
    [selectAllPlans, selectSelectedPlanId],
    (plans, selectedId) => plans.find(p => p.id === selectedId) || null
);
export const selectRecommendedPlan = createSelector(
    [selectAllPlans],
    (plans) => plans.find(p => p.is_recommended) || null
);
export const selectPlanByType = (planType) => createSelector(
    [selectAllPlans],
    (plans) => plans.find(p => p.plan_type === planType) || null
);
export const selectPlanFeatures = (planId) => createSelector(
    [selectPlanState],
    (planState) => planState.planFeatures[planId] || []
);
export const selectPlanComparison = createSelector(
    [selectPlanState],
    (planState) => planState.comparison
);
export const selectPlansLoading = createSelector(
    [selectPlanState],
    (state) => state.isLoading
);
export const selectPlansError = createSelector(
    [selectPlanState],
    (state) => state.error
);
// Invoice Selectors
export const selectInvoiceState = (state) => state.billingInvoices;
export const selectAllInvoices = createSelector(
    [selectInvoiceState],
    (invoiceState) => invoiceState.invoices
);
export const selectCurrentInvoice = createSelector(
    [selectInvoiceState],
    (invoiceState) => invoiceState.currentInvoice
);
export const selectOutstandingInvoices = createSelector(
    [selectInvoiceState],
    (invoiceState) => invoiceState.outstandingInvoices
);
export const selectInvoiceSummary = createSelector(
    [selectInvoiceState],
    (invoiceState) => invoiceState.summary
);
export const selectOutstandingTotal = createSelector(
    [selectOutstandingInvoices],
    (invoices) => invoices.reduce((sum, inv) => sum + (inv.amount_remaining || 0), 0)
);
export const selectOverdueInvoices = createSelector(
    [selectOutstandingInvoices],
    (invoices) => invoices.filter(inv => inv.is_overdue)
);
export const selectOverdueCount = createSelector(
    [selectOverdueInvoices],
    (invoices) => invoices.length
);
export const selectOverdueTotal = createSelector(
    [selectOverdueInvoices],
    (invoices) => invoices.reduce((sum, inv) => sum + (inv.amount_remaining || 0), 0)
);
export const selectPaidInvoices = createSelector(
    [selectAllInvoices],
    (invoices) => invoices.filter(inv => inv.status === 'paid')
);
export const selectInvoicePagination = createSelector(
    [selectInvoiceState],
    (state) => state.pagination
);
export const selectInvoicesLoading = createSelector(
    [selectInvoiceState],
    (state) => state.isLoading
);
export const selectInvoiceError = createSelector(
    [selectInvoiceState],
    (state) => state.error
);
// Payment Selectors
export const selectPaymentState = (state) => state.billingPayments;
export const selectAllPayments = createSelector(
    [selectPaymentState],
    (paymentState) => paymentState.payments
);
export const selectCurrentPayment = createSelector(
    [selectPaymentState],
    (paymentState) => paymentState.currentPayment
);
export const selectPaymentSummary = createSelector(
    [selectPaymentState],
    (paymentState) => paymentState.summary
);
export const selectSuccessfulPayments = createSelector(
    [selectAllPayments],
    (payments) => payments.filter(p => p.status === 'succeeded')
);
export const selectFailedPayments = createSelector(
    [selectAllPayments],
    (payments) => payments.filter(p => p.status === 'failed')
);
export const selectTotalPaid = createSelector(
    [selectPaymentSummary],
    (summary) => summary?.total_succeeded || 0
);
export const selectTotalRefunded = createSelector(
    [selectPaymentSummary],
    (summary) => summary?.total_refunded || 0
);
export const selectPaymentPagination = createSelector(
    [selectPaymentState],
    (state) => state.pagination
);
export const selectPaymentsLoading = createSelector(
    [selectPaymentState],
    (state) => state.isLoading
);
export const selectPaymentError = createSelector(
    [selectPaymentState],
    (state) => state.error
);
// Payment Method Selectors
export const selectPaymentMethodState = (state) => state.billingPaymentMethods;
export const selectAllPaymentMethods = createSelector(
    [selectPaymentMethodState],
    (state) => state.methods
);
export const selectDefaultPaymentMethod = createSelector(
    [selectPaymentMethodState],
    (state) => state.defaultMethod
);
export const selectHasPaymentMethods = createSelector(
    [selectAllPaymentMethods],
    (methods) => methods.length > 0
);
export const selectDefaultPaymentMethodId = createSelector(
    [selectDefaultPaymentMethod],
    (method) => method?.id || null
);
export const selectExpiringPaymentMethods = createSelector(
    [selectAllPaymentMethods],
    (methods) => methods.filter(m => m.is_expiring_soon)
);
export const selectCardPaymentMethods = createSelector(
    [selectAllPaymentMethods],
    (methods) => methods.filter(m => m.method_type === 'card')
);
export const selectPaymentMethodsLoading = createSelector(
    [selectPaymentMethodState],
    (state) => state.isLoading
);
export const selectPaymentMethodsError = createSelector(
    [selectPaymentMethodState],
    (state) => state.error
);
// Quota Selectors
export const selectQuotaState = (state) => state.billingQuota;
export const selectQuotaStatus = createSelector(
    [selectQuotaState],
    (state) => state.status
);
export const selectQuotaLimits = createSelector(
    [selectQuotaState],
    (state) => state.limits
);
export const selectQuotaUsage = createSelector(
    [selectQuotaStatus],
    (status) => ({
        users: status?.users?.current || 0,
        admins: status?.admins?.current || 0,
        kpis: status?.kpis?.current || 0,
        storage: status?.storage?.current_mb || 0,
        apiCalls: status?.api_calls_today?.current || 0,
    })
);
export const selectQuotaPercentages = createSelector(
    [selectQuotaStatus],
    (status) => ({
        users: status?.users?.percentage || 0,
        admins: status?.admins?.percentage || 0,
        kpis: status?.kpis?.percentage || 0,
        storage: status?.storage?.percentage || 0,
        apiCalls: status?.api_calls_today?.percentage || 0,
    })
);
export const selectIsQuotaHealthy = createSelector(
    [selectQuotaStatus],
    (status) => status?.is_healthy !== false
);
export const selectQuotaWarnings = createSelector(
    [selectQuotaStatus],
    (status) => {
        const warnings = [];
        const thresholds = { warning: 80, critical: 90, danger: 95 };
        if (status?.users?.percentage >= thresholds.warning) {
            warnings.push({
                resource: 'users',
                percentage: status.users.percentage,
                level: status.users.percentage >= thresholds.danger ? 'danger' :
                       status.users.percentage >= thresholds.critical ? 'critical' : 'warning',
            });
        }
        if (status?.kpis?.percentage >= thresholds.warning) {
            warnings.push({
                resource: 'kpis',
                percentage: status.kpis.percentage,
                level: status.kpis.percentage >= thresholds.danger ? 'danger' :
                       status.kpis.percentage >= thresholds.critical ? 'critical' : 'warning',
            });
        }
        if (status?.storage?.percentage >= thresholds.warning) {
            warnings.push({
                resource: 'storage',
                percentage: status.storage.percentage,
                level: status.storage.percentage >= thresholds.danger ? 'danger' :
                       status.storage.percentage >= thresholds.critical ? 'critical' : 'warning',
            });
        }
        if (status?.api_calls_today?.percentage >= thresholds.warning) {
            warnings.push({
                resource: 'api_calls',
                percentage: status.api_calls_today.percentage,
                level: status.api_calls_today.percentage >= thresholds.danger ? 'danger' :
                       status.api_calls_today.percentage >= thresholds.critical ? 'critical' : 'warning',
            });
        }      
        return warnings;
    }
);
export const selectQuotaFeatures = createSelector(
    [selectQuotaStatus],
    (status) => status?.features || {}
);
export const selectQuotaLoading = createSelector(
    [selectQuotaState],
    (state) => state.isLoading
);
export const selectQuotaError = createSelector(
    [selectQuotaState],
    (state) => state.error
);
export const selectBillingOverview = createSelector(
    [selectCurrentSubscription, selectInvoiceSummary, selectPaymentSummary, selectQuotaStatus],
    (subscription, invoices, payments, quota) => ({
        subscription: {
            status: subscription?.status,
            plan: subscription?.plan?.name,
            isActive: subscription?.is_active,
            expiresAt: subscription?.current_period_end,
        },
        invoices: {
            outstanding: invoices?.total_outstanding || 0,
            overdue: invoices?.overdue_count || 0,
            totalPaid: invoices?.total_paid || 0,
        },
        payments: {
            total: payments?.total_succeeded || 0,
            failed: payments?.total_failed || 0,
            refunded: payments?.total_refunded || 0,
        },
        quota: {
            isHealthy: quota?.is_healthy,
            hasWarnings: quota?.users?.percentage > 80 || quota?.kpis?.percentage > 80,
        },
    })
);
export const selectBillingActionsRequired = createSelector(
    [selectCurrentSubscription, selectOutstandingInvoices, selectQuotaWarnings],
    (subscription, outstandingInvoices, quotaWarnings) => {
        const actions = [];
        if (subscription?.status === 'past_due') {
            actions.push({
                type: 'update_payment',
                message: 'Payment required to continue service',
                priority: 'high',
            });
        }
        if (subscription?.cancel_at_period_end) {
            actions.push({
                type: 'reactivate',
                message: 'Your subscription will end soon. Reactivate to continue.',
                priority: 'medium',
            });
        }
        if (subscription?.status === 'trialing' && subscription?.trial_end) {
            const daysLeft = Math.ceil((new Date(subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3) {
                actions.push({
                    type: 'upgrade',
                    message: `Your trial ends in ${daysLeft} days. Choose a plan to continue.`,
                    priority: 'high',
                });
            }
        }
        if (outstandingInvoices?.length > 0) {
            actions.push({
                type: 'pay_invoices',
                message: `You have ${outstandingInvoices.length} unpaid invoice(s)`,
                priority: 'high',
            });
        }
        const criticalQuotaWarnings = quotaWarnings.filter(w => w.level === 'danger' || w.level === 'critical');
        if (criticalQuotaWarnings.length > 0) {
            actions.push({
                type: 'upgrade_quota',
                message: `You are nearing ${criticalQuotaWarnings[0].resource} limit`,
                priority: 'medium',
            });
        }
        return actions;
    }
);