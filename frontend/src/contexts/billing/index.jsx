// contexts/billing/index.jsx
import { BillingProvider, useBillingContext } from './BillingContext';
import { SubscriptionProvider, useSubscriptionContext } from './SubscriptionContext';
import { CheckoutProvider, useCheckoutContext } from './CheckoutContext';
import { BillingWebSocketProvider, useBillingWebSocketContext } from './BillingWebSocketContext';

export {
    BillingProvider,
    useBillingContext,
    SubscriptionProvider,
    useSubscriptionContext,
    CheckoutProvider,
    useCheckoutContext,
    BillingWebSocketProvider,
    useBillingWebSocketContext
};

// Combined provider for convenience
export const BillingProviders = ({ children }) => {
    return (
        <BillingProvider>
            <SubscriptionProvider>
                <CheckoutProvider>
                    <BillingWebSocketProvider>
                        {children}
                    </BillingWebSocketProvider>
                </CheckoutProvider>
            </SubscriptionProvider>
        </BillingProvider>
    );
};