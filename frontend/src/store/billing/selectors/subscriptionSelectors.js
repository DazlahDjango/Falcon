import { createSelector } from '@reduxjs/toolkit';
import { SUBSCRIPTION_STATUS } from '../../../config/constants/billingConstants';

// Base selector
const selectSubscriptionState = (state) => state.billing?.subscriptions || {};

// Basic selectors
export const selectCurrentSubscription = createSelector(
    [selectSubscriptionState],
    (subState) => subState.current
);

export const selectAllSubscriptions = createSelector(
    [selectSubscriptionState],
    (subState) => subState.items || []
);

export const selectSubscriptionsLoading = createSelector(
    [selectSubscriptionState],
    (subState) => subState.loading
);

export const selectSubscriptionsError = createSelector(
    [selectSubscriptionState],
    (subState) => subState.error
);

export const selectSelectedSubscription = createSelector(
    [selectSubscriptionState],
    (subState) => subState.selectedSubscription
);

export const selectSubscriptionStats = createSelector(
    [selectSubscriptionState],
    (subState) => subState.stats
);

// Computed selectors
export const selectHasActiveSubscription = createSelector(
    [selectCurrentSubscription],
    (current) => current?.is_active_status?.is_active || false
);

export const selectIsOnTrial = createSelector(
    [selectCurrentSubscription],
    (current) => current?.is_active_status?.is_on_trial || false
);

export const selectTrialDaysRemaining = createSelector(
    [selectCurrentSubscription],
    (current) => current?.is_active_status?.trial_days_remaining || 0
);

export const selectDaysUntilExpiry = createSelector(
    [selectCurrentSubscription],
    (current) => current?.is_active_status?.days_until_expiry || 0
);

export const selectIsExpiringSoon = createSelector(
    [selectDaysUntilExpiry],
    (days) => days > 0 && days <= 7
);

export const selectCurrentPlan = createSelector(
    [selectCurrentSubscription],
    (current) => current?.plan || null
);

export const selectCurrentPlanType = createSelector(
    [selectCurrentPlan],
    (plan) => plan?.plan_type || null
);

export const selectAutoRenew = createSelector(
    [selectCurrentSubscription],
    (current) => current?.auto_renew || false
);

export const selectCancelAtPeriodEnd = createSelector(
    [selectCurrentSubscription],
    (current) => current?.cancel_at_period_end || false
);

export const selectCanUpgrade = createSelector(
    [selectHasActiveSubscription, selectCurrentPlanType],
    (hasActive, planType) => {
        if (!hasActive) return false;
        return planType === 'basic' || planType === 'professional';
    }
);

export const selectCanDowngrade = createSelector(
    [selectHasActiveSubscription, selectCurrentPlanType],
    (hasActive, planType) => {
        if (!hasActive) return false;
        return planType === 'professional' || planType === 'enterprise';
    }
);

export const selectCanCancel = createSelector(
    [selectHasActiveSubscription, selectCancelAtPeriodEnd],
    (hasActive, cancelAtPeriodEnd) => hasActive && !cancelAtPeriodEnd
);

export const selectActiveSubscriptions = createSelector(
    [selectAllSubscriptions],
    (subscriptions) => subscriptions.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE)
);

export const selectExpiringSubscriptions = createSelector(
    [selectActiveSubscriptions],
    (subscriptions) => subscriptions.filter(s => 
        s.is_active_status?.days_until_expiry <= 7 && 
        s.is_active_status?.days_until_expiry > 0
    )
);

export const selectTrialingSubscriptions = createSelector(
    [selectAllSubscriptions],
    (subscriptions) => subscriptions.filter(s => s.status === SUBSCRIPTION_STATUS.TRIALING)
);

export const selectSubscriptionById = (id) => createSelector(
    [selectAllSubscriptions],
    (subscriptions) => subscriptions.find(s => s.id === id)
);