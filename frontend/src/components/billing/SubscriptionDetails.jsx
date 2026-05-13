import React from 'react';
import PropTypes from 'prop-types';
import { CalendarIcon, CurrencyDollarIcon, CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import { formatCurrency } from '../../config/constants/billingConstants';
import { useSubscriptionStatus } from '../../hooks/billing/useSubscription';

const SubscriptionDetails = ({ subscription, onSync, isLoading = false }) => {
    const { refetch: refetchStatus } = useSubscriptionStatus();
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const getDaysRemaining = () => {
        if (!subscription?.current_period_end) return null;
        const end = new Date(subscription.current_period_end);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };
    const daysRemaining = getDaysRemaining();
    const handleSync = async () => {
        if (onSync) {
            await onSync();
        } else {
            await refetchStatus();
        }
    };
    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-20 bg-gray-100 rounded-lg"></div>
            </div>
        );
    }
    if (!subscription) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No active subscription</p>
            </div>
        );
    }
    const plan = subscription.plan || {};
    const price = subscription.billing_interval === 'month' ? plan.price_monthly : plan.price_yearly;
    
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
                <button
                    onClick={handleSync}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Sync with Stripe"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCardIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Plan</p>
                            <p className="font-semibold text-gray-900">{plan.name || '—'}</p>
                            <p className="text-xs text-gray-400 capitalize">{subscription.billing_interval}ly billing</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monthly Price</p>
                            <p className="font-semibold text-gray-900">
                                {formatCurrency(price, plan.currency)}
                            </p>
                            {subscription.billing_interval === 'year' && plan.price_yearly && (
                                <p className="text-xs text-green-600">
                                    Save {formatCurrency((plan.price_monthly * 12) - plan.price_yearly, plan.currency)}/year
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <SubscriptionStatusBadge status={subscription.status} size="sm" />
                            {subscription.cancel_at_period_end && (
                                <p className="text-xs text-orange-600 mt-1">Cancels at period end</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Next Renewal</p>
                            <p className="font-semibold text-gray-900">
                                {formatDate(subscription.current_period_end)}
                            </p>
                            {daysRemaining !== null && (
                                <p className="text-xs text-gray-500">
                                    {daysRemaining} days remaining
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {subscription.status === 'trialing' && subscription.trial_end && (
                    <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">
                            🎉 Your trial ends on {formatDate(subscription.trial_end)}.
                            Choose a plan to continue using Falcon PMS.
                        </p>
                    </div>
                )}
                {subscription.status === 'past_due' && (
                    <div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">
                            ⚠️ Your payment is past due. Please update your payment method to avoid service interruption.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
SubscriptionDetails.propTypes = {
    subscription: PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.string,
        billing_interval: PropTypes.string,
        current_period_end: PropTypes.string,
        trial_end: PropTypes.string,
        cancel_at_period_end: PropTypes.bool,
        plan: PropTypes.shape({
            name: PropTypes.string,
            price_monthly: PropTypes.number,
            price_yearly: PropTypes.number,
            currency: PropTypes.string,
        }),
    }),
    onSync: PropTypes.func,
    isLoading: PropTypes.bool,
};

export default SubscriptionDetails;