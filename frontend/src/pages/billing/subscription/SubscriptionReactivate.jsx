import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubscription, useReactivateSubscription } from '../../../hooks/billing';
import { Spinner } from '../../../components/common/UI';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const SubscriptionReactivate = () => {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const { data: subscription, isLoading, refetch } = useCurrentSubscription();
    const reactivateSubscription = useReactivateSubscription();
    const isLoading_ = isLoading;
    const handleReactivate = async () => {
        if (subscription?.id) {
            await reactivateSubscription.mutateAsync(subscription.id);
            setShowConfirm(false);
            await refetch();
            navigate('/app/billing/subscription/current');
        }
    };
    if (isLoading_) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!subscription) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No subscription found.</p>
                <button
                    onClick={() => navigate('/app/billing/plans')}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    View Plans
                </button>
            </div>
        );
    }
    const isEligibleForReactivate = subscription.cancel_at_period_end || subscription.status === 'canceled';
    if (!isEligibleForReactivate) {
        return (
            <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Active</h2>
                <p className="text-gray-500 mb-6">
                    Your subscription is currently active and not scheduled for cancellation.
                </p>
                <button
                    onClick={() => navigate('/app/billing/subscription/current')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Go to Subscription
                </button>
            </div>
        );
    }
    const endDate = subscription.current_period_end 
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
                    onClick={() => navigate('/app/billing/subscription/current')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Reactivate Subscription</h1>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                    <FiRefreshCw className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-green-800">Reactivate Your Subscription</h3>
                        <p className="text-sm text-green-700 mt-1">
                            Your subscription is currently scheduled to end on {endDate}.
                            Reactivating will continue your service without interruption.
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Plan Details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Plan:</span>
                        <span className="font-medium text-gray-900">{subscription.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Billing Cycle:</span>
                        <span className="font-medium text-gray-900 capitalize">{subscription.billing_interval}ly</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Next Billing Date:</span>
                        <span className="font-medium text-gray-900">{endDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Auto-renew:</span>
                        <span className="font-medium text-gray-900">Enabled after reactivation</span>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">What you keep by reactivating</h3>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        All your data and KPIs remain intact
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        No setup or configuration needed
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        Continue using all premium features
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        No price changes - same rate as before
                    </li>
                </ul>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => navigate('/app/billing/subscription/current')}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                >
                    Reactivate Subscription
                </button>
            </div>
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleReactivate}
                title="Confirm Reactivation"
                confirmText="Yes, Reactivate"
                cancelText="Cancel"
                isLoading={reactivateSubscription.isLoading}
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to reactivate your subscription?
                        You will be charged on your next billing date.
                    </p>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            💡 Reactivating now will prevent any service interruption.
                            Your subscription will continue as before.
                        </p>
                    </div>
                </div>
            </ConfirmDialog>
        </div>
    );
};
export default SubscriptionReactivate;