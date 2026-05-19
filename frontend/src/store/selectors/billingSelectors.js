import { useSelector } from 'react-redux';

// Re-export all billing selectors from store
export * from '../billing/selectors';

// Custom hooks for common billing selectors
export const useBillingState = () => useSelector(state => state.billing);
export const usePlansState = () => useSelector(state => state.billing?.plans);
export const useSubscriptionState = () => useSelector(state => state.billing?.subscriptions);
export const useInvoiceState = () => useSelector(state => state.billing?.invoices);
export const useTransactionState = () => useSelector(state => state.billing?.transactions);
export const usePaymentMethodState = () => useSelector(state => state.billing?.paymentMethods);
export const useCheckoutState = () => useSelector(state => state.billing?.checkout);
export const useAnalyticsState = () => useSelector(state => state.billing?.analytics);
export const useAdminBillingState = () => useSelector(state => state.billing?.admin);