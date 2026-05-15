import AdminBillingService from './AdminBillingService';
import BillingAnalyticsService from './BillingAnalyticsService';
import BillingPortalService from './BillingPortalService';
import CheckoutService from './CheckoutService';
import InvoiceService from './InvoiceService';
import PaymentMethodService from './PaymentMethodService';
import PlanService from './PlanService';
import SubscriptionService from './SubscriptionService';
import TransactionService from './TransactionService';
import WebhookService from './WebhookService';

export { BillingBaseService, billingApiClient, withRetry } from './BillingBaseService';
export { PlanService } from './PlanService';
export { SubscriptionService } from './SubscriptionService';
export { TransactionService } from './TransactionService';
export { InvoiceService } from './InvoiceService';
export { CheckoutService } from './CheckoutService';
export { PaymentMethodService } from './PaymentMethodService';
export { BillingPortalService } from './BillingPortalService';
export { BillingAnalyticsService } from './BillingAnalyticsService';
export { AdminBillingService } from './AdminBillingService';
export { WebhookService } from './WebhookService';

// Create a combined billing service object for convenience
export const BillingService = {
    plans: PlanService,
    subscriptions: SubscriptionService,
    transactions: TransactionService,
    invoices: InvoiceService,
    checkout: CheckoutService,
    paymentMethods: PaymentMethodService,
    portal: BillingPortalService,
    analytics: BillingAnalyticsService,
    admin: AdminBillingService,
    webhooks: WebhookService,
};

// Default export
export default BillingService;