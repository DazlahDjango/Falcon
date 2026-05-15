/**
 * Checkout Selectors
 * Memoized selectors for checkout state
 */

import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectCheckoutState = (state) => state.billing?.checkout || {};

// Basic selectors
export const selectCurrentCheckout = createSelector(
    [selectCheckoutState],
    (checkoutState) => checkoutState.currentCheckout
);

export const selectCheckoutLoading = createSelector(
    [selectCheckoutState],
    (checkoutState) => checkoutState.loading
);

export const selectCheckoutError = createSelector(
    [selectCheckoutState],
    (checkoutState) => checkoutState.error
);

export const selectVerificationResult = createSelector(
    [selectCheckoutState],
    (checkoutState) => checkoutState.verificationResult
);

export const selectCheckoutRedirecting = createSelector(
    [selectCheckoutState],
    (checkoutState) => checkoutState.redirecting
);

export const selectLastCheckoutReference = createSelector(
    [selectCheckoutState],
    (checkoutState) => checkoutState.lastReference
);

// Computed selectors
export const selectAuthorizationUrl = createSelector(
    [selectCurrentCheckout],
    (checkout) => checkout?.authorization_url || null
);

export const selectAccessCode = createSelector(
    [selectCurrentCheckout],
    (checkout) => checkout?.access_code || null
);

export const selectCheckoutReference = createSelector(
    [selectCurrentCheckout],
    (checkout) => checkout?.reference || null
);

export const selectTransactionId = createSelector(
    [selectCurrentCheckout],
    (checkout) => checkout?.transaction_id || null
);

export const selectIsCheckoutVerified = createSelector(
    [selectVerificationResult],
    (result) => result?.verified || false
);

export const selectCheckoutStatus = createSelector(
    [selectVerificationResult],
    (result) => result?.status || null
);