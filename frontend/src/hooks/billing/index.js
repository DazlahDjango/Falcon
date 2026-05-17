import useAdminBilling from './useAdminBilling';
import useBillingAnalytics from './useBillingAnalytics';
import useBillingPortal from './useBillingPortal';
import useBillingWebSocket from './useBillingWebSocket';
import useCheckout from './useCheckout';
import useInvoice from './useInvoice';
import useInvoices from './useInvoices';
import usePaymentMethods from './usePaymentMethods';
import usePlans from './usePlans';
import useSubscription from './useSubscription';
import useSubscriptions from './useSubscriptions';
import useTransaction from './useTransaction';
import useTransactions from './useTransactions';
import useWebhookService from './useWebhookService';

export { usePlans } from './usePlans';
export { useSubscription } from './useSubscription';
export { useSubscriptions } from './useSubscriptions';
export { useInvoices } from './useInvoices';
export { useInvoice } from './useInvoice';
export { useTransactions } from './useTransactions';
export { useTransaction } from './useTransaction';
export { usePaymentMethods } from './usePaymentMethods';
export { useCheckout } from './useCheckout';
export { useBillingPortal } from './useBillingPortal';
export { useBillingAnalytics } from './useBillingAnalytics';
export { useBillingWebSocket } from './useBillingWebSocket';
export { useWebhookService } from './useWebhookService';
export { useAdminBilling } from './useAdminBilling';

// Default export
const billingHooks = {
    usePlans,
    useSubscription,
    useSubscriptions,
    useInvoices,
    useInvoice,
    useTransactions,
    useTransaction,
    usePaymentMethods,
    useCheckout,
    useBillingPortal,
    useBillingAnalytics,
    useBillingWebSocket,
    useWebhookService,
    useAdminBilling,
};

export default billingHooks;