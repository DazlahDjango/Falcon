import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubscription, useCancelSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import SubscriptionStatusBadge from '../../../components/billing/SubscriptionStatusBadge';
import { Spinner } from '../../../components/common/UI';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const SubscriptionCancel = () => {
    const navigate = useNavigate();
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
    const [cancelReason, setCancelReason] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const { data: subscription, isLoading, refetch } = useCurrentSubscription();
    const cancelSubscription = useCancelSubscription();
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!subscription) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No active subscription found.</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    View Plans
                </button>
            </div>
        );
    }
    const handleCancel = async () => {
        await cancelSubscription.mutateAsync({
            id: subscription.id,
            atPeriodEnd: cancelAtPeriodEnd,
            reason: cancelReason,
        });
        setShowConfirm(false);
        await refetch();
        navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT);
    };
    const endDate = cancelAtPeriodEnd && subscription.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;
    
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Cancel Subscription</h1>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                    <FiAlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-800">Warning: This action cannot be undone</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Cancelling your subscription will result in loss of access to premium features.
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Current Subscription</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Plan:</span>
                        <span className="font-medium text-gray-900">{subscription.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <SubscriptionStatusBadge status={subscription.status} size="sm" />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Next Billing Date:</span>
                        <span className="text-gray-900">
                            {subscription.current_period_end 
                                ? new Date(subscription.current_period_end).toLocaleDateString()
                                : '—'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Cancellation Options</h3>
                <div className="space-y-4">
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="cancelOption"
                            checked={cancelAtPeriodEnd === true}
                            onChange={() => setCancelAtPeriodEnd(true)}
                            className="mt-1 text-primary-600"
                        />
                        <div>
                            <p className="font-medium text-gray-900">Cancel at end of billing period</p>
                            <p className="text-sm text-gray-500">
                                Your subscription will remain active until {endDate}. 
                                You'll retain full access until then.
                            </p>
                        </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="cancelOption"
                            checked={cancelAtPeriodEnd === false}
                            onChange={() => setCancelAtPeriodEnd(false)}
                            className="mt-1 text-primary-600"
                        />
                        <div>
                            <p className="font-medium text-gray-900">Cancel immediately</p>
                            <p className="text-sm text-red-500">
                                Your subscription will end right away. You'll lose access immediately.
                                No refunds will be issued for the remaining period.
                            </p>
                        </div>
                    </label>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Reason for Cancellation (Optional)</h3>
                <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="">Select a reason...</option>
                    <option value="too_expensive">Too expensive</option>
                    <option value="missing_features">Missing features I need</option>
                    <option value="not_using">Not using the platform enough</option>
                    <option value="poor_support">Poor customer support</option>
                    <option value="technical_issues">Technical issues</option>
                    <option value="switching">Switching to another service</option>
                    <option value="other">Other</option>
                </select>
                {cancelReason === 'other' && (
                    <textarea
                        placeholder="Please specify..."
                        className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        rows="3"
                    />
                )}
            </div>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <p className="text-sm text-blue-800">
                    💡 We're sad to see you go! If there's something we can do to improve your experience,
                    please let us know. Your feedback helps us get better.
                </p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                    Go Back
                </button>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                >
                    Cancel Subscription
                </button>
            </div>
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleCancel}
                title="Confirm Cancellation"
                confirmText="Yes, Cancel Subscription"
                cancelText="No, Keep Subscription"
                variant="danger"
                isLoading={cancelSubscription.isLoading}
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to cancel your subscription?
                        {cancelAtPeriodEnd 
                            ? ` You will have access until ${endDate}.`
                            : " You will lose access immediately and no refunds will be issued."}
                    </p>
                    {!cancelAtPeriodEnd && (
                        <p className="text-sm text-red-600 font-medium">
                            This action is irreversible.
                        </p>
                    )}
                </div>
            </ConfirmDialog>
        </div>
    );
};
export default SubscriptionCancel;