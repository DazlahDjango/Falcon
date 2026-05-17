/**
 * Subscription Utilities
 * Subscription management helper functions
 */

import { formatCurrency, formatBillingDate } from './formatters';
import { calculateYearlySavings } from './calculators';

/**
 * Get subscription status display properties
 * @param {string} status - Subscription status
 * @returns {Object} { label, color, icon }
 */
export const getSubscriptionStatusProps = (status) => {
    const statusMap = {
        active: { label: 'Active', color: '#10b981', icon: '✓', bgColor: '#d1fae5' },
        trialing: { label: 'Trial', color: '#f59e0b', icon: '⏳', bgColor: '#fef3c7' },
        past_due: { label: 'Past Due', color: '#ef4444', icon: '⚠️', bgColor: '#fee2e2' },
        cancelled: { label: 'Cancelled', color: '#6b7280', icon: '✗', bgColor: '#f3f4f6' },
        expired: { label: 'Expired', color: '#6b7280', icon: '⌛', bgColor: '#f3f4f6' },
        pending_cancellation: { label: 'Pending Cancellation', color: '#f59e0b', icon: '⟳', bgColor: '#fef3c7' },
    };
    
    return statusMap[status] || { label: status, color: '#6b7280', icon: '🔄', bgColor: '#f3f4f6' };
};

/**
 * Check if subscription is active
 * @param {Object} subscription - Subscription object
 * @returns {boolean} True if active
 */
export const isSubscriptionActive = (subscription) => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
};

/**
 * Check if subscription is expiring soon
 * @param {Object} subscription - Subscription object
 * @param {number} thresholdDays - Days threshold (default 7)
 * @returns {boolean} True if expiring soon
 */
export const isSubscriptionExpiringSoon = (subscription, thresholdDays = 7) => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (!subscription.current_period_end) return false;
    
    const daysUntilExpiry = subscription.is_active_status?.days_until_expiry || 0;
    return daysUntilExpiry > 0 && daysUntilExpiry <= thresholdDays;
};

/**
 * Get subscription features by plan type
 * @param {string} planType - Plan type (basic, professional, enterprise)
 * @returns {Array} List of features
 */
export const getPlanFeatures = (planType) => {
    const features = {
        basic: [
            'Up to 50 users',
            'Up to 100 KPIs',
            'Basic reports',
            'Email support',
            'Audit logs',
        ],
        professional: [
            'Up to 500 users',
            'Up to 1,000 KPIs',
            'Advanced reports',
            'Custom branding',
            'API access',
            'Priority support',
            'Advanced analytics',
        ],
        enterprise: [
            'Unlimited users',
            'Unlimited KPIs',
            'Custom reports',
            'White label',
            'SSO integration',
            '24/7 dedicated support',
            'Custom SLAs',
            'On-premise option',
        ],
        trial: [
            'Up to 10 users',
            'Up to 50 KPIs',
            'Basic reports',
            'Email support',
            '14-day free trial',
        ],
    };
    
    return features[planType] || features.basic;
};

/**
 * Format subscription for display
 * @param {Object} subscription - Raw subscription object
 * @returns {Object} Formatted subscription
 */
export const formatSubscriptionForDisplay = (subscription) => {
    if (!subscription) return null;
    
    const isActive = isSubscriptionActive(subscription);
    const isExpiringSoonFlag = isSubscriptionExpiringSoon(subscription);
    
    return {
        ...subscription,
        amount_display: formatCurrency(subscription.amount, subscription.currency),
        start_date_formatted: formatBillingDate(subscription.start_date),
        current_period_end_formatted: formatBillingDate(subscription.current_period_end),
        trial_end_date_formatted: subscription.trial_end_date ? formatBillingDate(subscription.trial_end_date) : null,
        status_props: getSubscriptionStatusProps(subscription.status),
        is_active: isActive,
        is_expiring_soon: isExpiringSoonFlag,
        plan_features: getPlanFeatures(subscription.plan?.plan_type),
    };
};

/**
 * Calculate prorated upgrade cost
 * @param {Object} currentSubscription - Current subscription
 * @param {Object} newPlan - New plan to upgrade to
 * @param {string} billingCycle - Billing cycle (monthly/yearly)
 * @returns {Object} Proration calculation
 */
export const calculateUpgradeProration = (currentSubscription, newPlan, billingCycle = 'monthly') => {
    if (!currentSubscription || !newPlan) return null;
    
    const daysRemaining = currentSubscription.is_active_status?.days_until_expiry || 0;
    const totalDays = billingCycle === 'monthly' ? 30 : 365;
    const daysUsed = totalDays - daysRemaining;
    
    // Calculate remaining value of current plan
    const currentPlanValue = currentSubscription.amount;
    const usedValue = Math.round((currentPlanValue * daysUsed) / totalDays);
    const remainingValue = currentPlanValue - usedValue;
    
    // Calculate cost of new plan for remaining period
    const newPlanDailyRate = newPlan.price / totalDays;
    const newPlanCost = Math.round(newPlanDailyRate * daysRemaining);
    
    // Additional amount to charge
    const additionalAmount = newPlanCost - remainingValue;
    
    return {
        current_plan_value: currentPlanValue,
        remaining_value: remainingValue,
        new_plan_cost: newPlanCost,
        additional_amount: Math.max(0, additionalAmount),
        is_refund: additionalAmount < 0,
        refund_amount: additionalAmount < 0 ? Math.abs(additionalAmount) : 0,
        days_remaining: daysRemaining,
        days_used: daysUsed,
        total_days: totalDays,
        additional_display: formatCurrency(Math.max(0, additionalAmount)),
        refund_display: formatCurrency(additionalAmount < 0 ? Math.abs(additionalAmount) : 0),
    };
};

/**
 * Get subscription renewal reminder text
 * @param {Object} subscription - Subscription object
 * @returns {string} Reminder text
 */
export const getRenewalReminderText = (subscription) => {
    if (!subscription) return '';
    
    const daysUntilExpiry = subscription.is_active_status?.days_until_expiry || 0;
    const amount = subscription.amount_display || formatCurrency(subscription.amount);
    
    if (daysUntilExpiry === 0) return 'Your subscription expires today!';
    if (daysUntilExpiry === 1) return `Your subscription expires tomorrow. Renew now for ${amount}`;
    if (daysUntilExpiry <= 7) return `Your subscription expires in ${daysUntilExpiry} days. Renew now for ${amount}`;
    if (daysUntilExpiry <= 30) return `Your subscription renews in ${daysUntilExpiry} days for ${amount}`;
    
    return '';
};