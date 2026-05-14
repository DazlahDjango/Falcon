import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiRefreshCw, FiX, FiArrowUp, FiCheck } from 'react-icons/fi';
import { useCancelSubscription, useReactivateSubscription, useUpgradeSubscription } from '../../hooks/billing/useSubscription';
import ConfirmDialog from '../common/ConfirmDialog';

const SubscriptionActions = ({ 
    subscription, 
    onUpgrade, 
    onCancel, 
    onReactivate,
    className = '',
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
    const cancelSubscription = useCancelSubscription();
    const reactivateSubscription = useReactivateSubscription();
    const upgradeSubscription = useUpgradeSubscription();
    const isActive = subscription?.is_active && subscription?.status === 'active';
    const isTrialing = subscription?.status === 'trialing';
    const isPastDue = subscription?.status === 'past_due';
    const isCanceled = subscription?.status === 'canceled';
    const isScheduledForCancel = subscription?.cancel_at_period_end && isActive;
    const handleCancel = async () => {
        await cancelSubscription.mutateAsync({
            id: subscription.id,
            atPeriodEnd: cancelAtPeriodEnd,
            reason: cancelReason,
        });
        setShowCancelModal(false);
        setCancelReason('');
        onCancel?.();
    };
    const handleReactivate = async () => {
        await reactivateSubscription.mutateAsync(subscription.id);
        onReactivate?.();
    };
    const handleUpgrade = () => {
        onUpgrade?.();
    };
    if (!subscription) return null;
    
    return (
        <>
            <div className={`flex flex-wrap gap-3 ${className}`}>
                {isActive && !isScheduledForCancel && (
                    <button
                        onClick={handleUpgrade}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <FiArrowUp className="w-4 h-4" />
                        Upgrade Plan
                    </button>
                )}
                {(isCanceled || isScheduledForCancel) && (
                    <button
                        onClick={handleReactivate}
                        disabled={reactivateSubscription.isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {reactivateSubscription.isLoading ? (
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <FiCheck className="w-4 h-4" />
                        )}
                        {isScheduledForCancel ? 'Keep Subscription' : 'Reactivate'}
                    </button>
                )}
                {isActive && !isScheduledForCancel && !isPastDue && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <FiX className="w-4 h-4" />
                        Cancel Subscription
                    </button>
                )}
                {isPastDue && (
                    <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        ⚠️ Your payment is past due. Please update your payment method.
                    </div>
                )}
                {isTrialing && subscription.trial_end && (
                    <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                        🎉 Trial ends on {new Date(subscription.trial_end).toLocaleDateString()}
                    </div>
                )}
            </div>
            <ConfirmDialog
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancel}
                title="Cancel Subscription"
                confirmText="Cancel Subscription"
                cancelText="Keep Subscription"
                isLoading={cancelSubscription.isLoading}
                variant="danger"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to cancel your subscription?
                        {cancelAtPeriodEnd && " You'll continue to have access until the end of your billing period."}
                    </p>
                    <div>
                        <label className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={cancelAtPeriodEnd}
                                onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                                Cancel at end of billing period (recommended)
                            </span>
                        </label>
                    </div>                  
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for cancellation (optional)
                        </label>
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="">Select a reason...</option>
                            <option value="too_expensive">Too expensive</option>
                            <option value="missing_features">Missing features</option>
                            <option value="not_using">Not using the platform</option>
                            <option value="switching">Switching to another service</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    {!cancelAtPeriodEnd && (
                        <p className="text-sm text-red-600">
                            Warning: Cancelling immediately will result in immediate loss of access.
                        </p>
                    )}
                </div>
            </ConfirmDialog>
        </>
    );
};

SubscriptionActions.propTypes = {
    subscription: PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.string,
        is_active: PropTypes.bool,
        cancel_at_period_end: PropTypes.bool,
        trial_end: PropTypes.string,
    }),
    onUpgrade: PropTypes.func,
    onCancel: PropTypes.func,
    onReactivate: PropTypes.func,
    className: PropTypes.string,
};
export default SubscriptionActions;