import { createListenerMiddleware } from '@reduxjs/toolkit';

// Analytics tracking function (integrate with your analytics service)
const trackEvent = (eventName, properties = {}) => {
    // Integrate with Google Analytics, Mixpanel, etc.
    if (window.gtag) {
        window.gtag('event', eventName, properties);
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, properties);
    }
};

export const analyticsMiddleware = createListenerMiddleware();

// Track subscription creation
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type === 'billing/subscriptions/create/fulfilled',
    effect: async (action) => {
        const subscription = action.payload;
        trackEvent('subscription_created', {
            plan_type: subscription?.plan?.plan_type,
            billing_interval: subscription?.billing_interval,
            amount: subscription?.amount,
        });
    },
});

// Track subscription cancellation
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type === 'billing/subscriptions/cancel/fulfilled',
    effect: async (action) => {
        const result = action.payload;
        trackEvent('subscription_cancelled', {
            at_period_end: result?.cancel_at_period_end,
        });
    },
});

// Track subscription upgrade/downgrade
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type === 'billing/subscriptions/upgrade/fulfilled' ||
        action.type === 'billing/subscriptions/downgrade/fulfilled',
    effect: async (action) => {
        const eventType = action.type.includes('upgrade') ? 'subscription_upgraded' : 'subscription_downgraded';
        const result = action.payload;
        trackEvent(eventType, {
            immediate: result?.immediate,
        });
    },
});

// Track successful payment
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type === 'billing/checkout/verify/fulfilled' &&
        action.payload?.verified === true,
    effect: async (action) => {
        const result = action.payload;
        trackEvent('payment_successful', {
            amount: result?.amount,
            reference: result?.reference,
        });
    },
});

// Track invoice download
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type === 'billing/invoices/download/fulfilled',
    effect: async (action) => {
        const { id, format } = action.payload;
        trackEvent('invoice_downloaded', {
            invoice_id: id,
            format: format,
        });
    },
});

// Track plan view
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type === 'billing/plans/fetchPlans/fulfilled',
    effect: async (action) => {
        const plans = action.payload;
        trackEvent('plans_viewed', {
            plan_count: plans?.length || 0,
        });
    },
});

// Track checkout started
analyticsMiddleware.startListening({
    actionCreator: (action) => 
        action.type?.startsWith('billing/checkout/init') &&
        action.type?.endsWith('/fulfilled'),
    effect: async (action) => {
        const isSubscription = action.type.includes('Subscription');
        trackEvent('checkout_started', {
            type: isSubscription ? 'subscription' : 'one_time',
            reference: action.payload?.reference,
        });
    },
});

export default analyticsMiddleware.middleware;