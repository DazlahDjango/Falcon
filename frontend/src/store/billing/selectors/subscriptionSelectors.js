import { createSelector } from '@reduxjs/toolkit';
import { SUBSCRIPTION_STATUS } from '../../../config/constants/billingConstants';

const selectSubscriptionState = (state) => state.billing?.subscriptions || {};

export const selectCurrentSubscription = createSelector([selectSubscriptionState], (subState) => subState.current);
export const selectAllSubscriptions = createSelector([selectSubscriptionState], (subState) => subState.items || []);
export const selectSelectedSubscription = createSelector([selectSubscriptionState], (subState) => subState.selectedSubscription);
export const selectSubscriptionUsage = createSelector([selectSubscriptionState], (subState) => subState.subscriptionUsage);
export const selectSubscriptionsLoading = createSelector([selectSubscriptionState], (subState) => subState.loading);
export const selectSubscriptionsError = createSelector([selectSubscriptionState], (subState) => subState.error);
export const selectSubscriptionFilters = createSelector([selectSubscriptionState], (subState) => subState.filters);
export const selectSubscriptionPagination = createSelector([selectSubscriptionState], (subState) => subState.pagination);
export const selectSubscriptionStats = createSelector([selectSubscriptionState], (subState) => subState.stats);

export const selectIsSubscriptionActive = createSelector([selectCurrentSubscription], (sub) => sub?.is_active_status?.is_active || false);
export const selectIsOnTrial = createSelector([selectCurrentSubscription], (sub) => sub?.is_active_status?.is_on_trial || false);
export const selectTrialDaysRemaining = createSelector([selectCurrentSubscription], (sub) => sub?.is_active_status?.trial_days_remaining || 0);
export const selectDaysUntilExpiry = createSelector([selectCurrentSubscription], (sub) => sub?.is_active_status?.days_until_expiry || 0);
export const selectCurrentPlanType = createSelector([selectCurrentSubscription], (sub) => sub?.plan?.plan_type || null);
export const selectCurrentPlanName = createSelector([selectCurrentSubscription], (sub) => sub?.plan?.name || null);
export const selectSubscriptionStatus = createSelector([selectCurrentSubscription], (sub) => sub?.status || null);
export const selectAutoRenewEnabled = createSelector([selectCurrentSubscription], (sub) => sub?.auto_renew || false);
export const selectCancelAtPeriodEnd = createSelector([selectCurrentSubscription], (sub) => sub?.cancel_at_period_end || false);
export const selectSubscriptionById = (id) => createSelector([selectAllSubscriptions, selectSelectedSubscription], (subs, selected) => { if (selected?.id === id) return selected; return subs.find(s => s.id === id); });
export const selectActiveSubscriptions = createSelector([selectAllSubscriptions], (subs) => subs.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE));
export const selectTrialingSubscriptions = createSelector([selectAllSubscriptions], (subs) => subs.filter(s => s.status === SUBSCRIPTION_STATUS.TRIALING));
export const selectPastDueSubscriptions = createSelector([selectAllSubscriptions], (subs) => subs.filter(s => s.status === SUBSCRIPTION_STATUS.PAST_DUE));
export const selectIsExpiringSoon = createSelector([selectCurrentSubscription], (sub) => sub?.is_active_status?.is_expiring_soon || false);