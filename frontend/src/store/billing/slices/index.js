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
import systemSettingsReducer from './systemSettingsSlice';
import billingPortalReducer from './billingPortalSlice';

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
    systemSettings: systemSettingsReducer,
    portal: billingPortalReducer,
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
export { default as systemSettingsSlice } from './systemSettingsSlice';
export { default as billingPortalSlice } from './billingPortalSlice';