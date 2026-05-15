/**
 * Billing Slices Index
 * Combines all billing slices into a single reducer
 */

import { combineReducers } from 'redux';
import planReducer from './planSlice';
import subscriptionReducer from './subscriptionSlice';
import invoiceReducer from './invoiceSlice';
import transactionReducer from './transactionSlice';
import paymentMethodReducer from './paymentMethodSlice';
import checkoutReducer from './checkoutSlice';
import analyticsReducer from './analyticsSlice';
import adminBillingReducer from './adminBillingSlice';

const billingReducer = combineReducers({
    plans: planReducer,
    subscriptions: subscriptionReducer,
    invoices: invoiceReducer,
    transactions: transactionReducer,
    paymentMethods: paymentMethodReducer,
    checkout: checkoutReducer,
    analytics: analyticsReducer,
    admin: adminBillingReducer,
});

export default billingReducer;

// Export individual slices for selective imports
export { default as planSlice } from './planSlice';
export { default as subscriptionSlice } from './subscriptionSlice';
export { default as invoiceSlice } from './invoiceSlice';
export { default as transactionSlice } from './transactionSlice';
export { default as paymentMethodSlice } from './paymentMethodSlice';
export { default as checkoutSlice } from './checkoutSlice';
export { default as analyticsSlice } from './analyticsSlice';
export { default as adminBillingSlice } from './adminBillingSlice';