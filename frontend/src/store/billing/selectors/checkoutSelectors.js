import { createSelector } from '@reduxjs/toolkit';

const selectCheckoutState = (state) => state.billing?.checkout || {};

export const selectCurrentCheckout = createSelector([selectCheckoutState], (checkoutState) => checkoutState.currentCheckout);
export const selectCheckoutLoading = createSelector([selectCheckoutState], (checkoutState) => checkoutState.loading);
export const selectCheckoutError = createSelector([selectCheckoutState], (checkoutState) => checkoutState.error);
export const selectVerificationResult = createSelector([selectCheckoutState], (checkoutState) => checkoutState.verificationResult);
export const selectCheckoutRedirecting = createSelector([selectCheckoutState], (checkoutState) => checkoutState.redirecting);
export const selectLastCheckoutReference = createSelector([selectCheckoutState], (checkoutState) => checkoutState.lastReference);

export const selectAuthorizationUrl = createSelector([selectCurrentCheckout], (checkout) => checkout?.authorization_url || null);
export const selectAccessCode = createSelector([selectCurrentCheckout], (checkout) => checkout?.access_code || null);
export const selectCheckoutReference = createSelector([selectCurrentCheckout], (checkout) => checkout?.reference || null);
export const selectTransactionId = createSelector([selectCurrentCheckout], (checkout) => checkout?.transaction_id || null);
export const selectIsCheckoutVerified = createSelector([selectVerificationResult], (result) => result?.verified || false);
export const selectCheckoutStatus = createSelector([selectVerificationResult], (result) => result?.status || null);
export const selectCheckoutAmount = createSelector([selectCurrentCheckout], (checkout) => checkout?.amount || 0);
export const selectCheckoutPlanId = createSelector([selectCurrentCheckout], (checkout) => checkout?.plan_id || null);
export const selectIsSubscriptionCheckout = createSelector([selectCheckoutPlanId], (planId) => planId !== null);