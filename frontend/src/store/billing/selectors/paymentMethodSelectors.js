/**
 * Payment Method Selectors
 * Memoized selectors for payment method state
 */

import { createSelector } from '@reduxjs/toolkit';
import { PAYMENT_METHOD_TYPES } from '../../../config/constants/billingConstants';

// Base selector
const selectPaymentMethodState = (state) => state.billing?.paymentMethods || {};

// Basic selectors
export const selectAllPaymentMethods = createSelector(
    [selectPaymentMethodState],
    (pmState) => pmState.items || []
);

export const selectPaymentMethodsLoading = createSelector(
    [selectPaymentMethodState],
    (pmState) => pmState.loading
);

export const selectPaymentMethodsError = createSelector(
    [selectPaymentMethodState],
    (pmState) => pmState.error
);

export const selectDefaultPaymentMethod = createSelector(
    [selectPaymentMethodState],
    (pmState) => pmState.defaultMethod
);

export const selectSelectedPaymentMethod = createSelector(
    [selectPaymentMethodState],
    (pmState) => pmState.selectedMethod
);

// Computed selectors
export const selectActivePaymentMethods = createSelector(
    [selectAllPaymentMethods],
    (methods) => methods.filter(m => m.status === 'active' || m.status === 'default')
);

export const selectCardPaymentMethods = createSelector(
    [selectActivePaymentMethods],
    (methods) => methods.filter(m => m.payment_type === PAYMENT_METHOD_TYPES.CARD)
);

export const selectBankPaymentMethods = createSelector(
    [selectActivePaymentMethods],
    (methods) => methods.filter(m => m.payment_type === PAYMENT_METHOD_TYPES.BANK)
);

export const selectHasPaymentMethod = createSelector(
    [selectActivePaymentMethods],
    (methods) => methods.length > 0
);

export const selectHasDefaultPaymentMethod = createSelector(
    [selectDefaultPaymentMethod],
    (defaultMethod) => defaultMethod !== null
);

export const selectExpiringCards = createSelector(
    [selectCardPaymentMethods],
    (cards) => {
        const currentDate = new Date();
        return cards.filter(card => {
            if (!card.card_expiry_year || !card.card_expiry_month) return false;
            const expiryDate = new Date(
                parseInt(card.card_expiry_year),
                parseInt(card.card_expiry_month) - 1,
                1
            );
            return expiryDate < new Date(currentDate.setMonth(currentDate.getMonth() + 2));
        });
    }
);

export const selectPaymentMethodById = (id) => createSelector(
    [selectAllPaymentMethods],
    (methods) => methods.find(m => m.id === id)
);