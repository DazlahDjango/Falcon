import { combineReducers } from 'redux';
import planReducer from './planSlice';
import subscriptionReducer from './subscriptionSlice';
import transactionReducer from './transactionSlice';
import invoiceReducer from './invoiceSlice';
import checkoutReducer from './checkoutSlice';
import paymentMethodReducer from './paymentMethodSlice';
import analyticsReducer from './analyticsSlice';
import usageReducer from './usageSlice';
import auditReducer from './auditSlice';
import enterpriseReducer from './enterpriseSlice';
import webhookReducer from './webhookSlice';
import adminBillingReducer from './adminBillingSlice';

const billingReducer = combineReducers({
    plans: planReducer,
    subscriptions: subscriptionReducer,
    transactions: transactionReducer,
    invoices: invoiceReducer,
    checkout: checkoutReducer,
    paymentMethods: paymentMethodReducer,
    analytics: analyticsReducer,
    usage: usageReducer,
    audit: auditReducer,
    enterprise: enterpriseReducer,
    webhook: webhookReducer,
    admin: adminBillingReducer,
});

export default billingReducer;

export { default as planSlice } from './planSlice';
export { default as subscriptionSlice } from './subscriptionSlice';
export { default as transactionSlice } from './transactionSlice';
export { default as invoiceSlice } from './invoiceSlice';
export { default as checkoutSlice } from './checkoutSlice';
export { default as paymentMethodSlice } from './paymentMethodSlice';
export { default as analyticsSlice } from './analyticsSlice';
export { default as usageSlice } from './usageSlice';
export { default as auditSlice } from './auditSlice';
export { default as enterpriseSlice } from './enterpriseSlice';
export { default as webhookSlice } from './webhookSlice';
export { default as adminBillingSlice } from './adminBillingSlice';

export * from './subscriptionSlice';
export * from './transactionSlice';
export * from './invoiceSlice';
export * from './checkoutSlice';
export * from './paymentMethodSlice';
export * from './planSlice';
export * from './analyticsSlice';
export * from './usageSlice';
export * from './auditSlice';
export * from './enterpriseSlice';
export * from './webhookSlice';
export * from './adminBillingSlice';