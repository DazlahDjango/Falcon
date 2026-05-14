import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubscription, useSubscriptionHistory, useSyncSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import SubscriptionDetails from '../../../components/billing/SubscriptionDetails';
import SubscriptionStatusBadge from '../../../components/billing/SubscriptionStatusBadge';
import SubscriptionActions from '../../../components/billing/SubscriptionActions';
import { Spinner } from '../../../components/common/UI';
import { formatCurrency } from '../../../config/constants/billingConstants';
import { FiCalendar, FiClock, FiFileText, FiRefreshCw } from 'react-icons/fi';

const SubscriptionCurrent = () => {
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);
    const { data: subscription, isLoading, refetch } = useCurrentSubscription();
    const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useSubscriptionHistory(subscription?.id);
    const syncSubscription = useSyncSubscription();
    const handleUpgrade = () => {
        navigate(BILLING_ROUTES.SUBSCRIPTION_UPGRADE);
    };
    const handleCancel = () => {
        refetch();
    };
    const handleReactivate = () => {
        refetch();
    };
    const handleSync = async () => {
        if (subscription?.id) {
            await syncSubscription.mutateAsync(subscription.id);
            await refetch();
            if (showHistory) {
                await refetchHistory();
            }
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
                <p className="text-gray-500 mb-6">You don't have an active subscription. Choose a plan to get started.</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    View Plans
                </button>
            </div>
        );
    }
    const plan = subscription.plan || {};
    const price = subscription.billing_interval === 'month' ? plan.price_monthly : plan.price_yearly;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Current Subscription</h1>
                    <p className="text-gray-500 mt-1">View and manage your subscription details</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncSubscription.isLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <FiRefreshCw className={`w-4 h-4 ${syncSubscription.isLoading ? 'animate-spin' : ''}`} />
                    Sync with Stripe
                </button>
            </div>
            <SubscriptionDetails subscription={subscription} onSync={handleSync} />
            <SubscriptionActions
                subscription={subscription}
                onUpgrade={handleUpgrade}
                onCancel={handleCancel}
                onReactivate={handleReactivate}
            />
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Plan Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Plan Name</p>
                            <p className="font-medium text-gray-900 mt-1">{plan.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Billing Cycle</p>
                            <p className="font-medium text-gray-900 mt-1 capitalize">
                                {subscription.billing_interval}ly
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-medium text-gray-900 mt-1">
                                {formatCurrency(price, plan.currency)}/{subscription.billing_interval}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <div className="mt-1">
                                <SubscriptionStatusBadge status={subscription.status} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Period Start</p>
                            <p className="font-medium text-gray-900 mt-1">
                                {formatDate(subscription.current_period_start)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Period End</p>
                            <p className="font-medium text-gray-900 mt-1">
                                {formatDate(subscription.current_period_end)}
                            </p>
                        </div>
                        {subscription.trial_end && (
                            <div>
                                <p className="text-sm text-gray-500">Trial Ends</p>
                                <p className="font-medium text-gray-900 mt-1">
                                    {formatDate(subscription.trial_end)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Auto-Renew</p>
                            <p className="font-medium text-gray-900 mt-1">
                                {subscription.auto_renew && !subscription.cancel_at_period_end ? 'Yes' : 'No'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {plan.features && plan.features.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Included Features</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                                        {feature.value && feature.value !== 'Yes' && (
                                            <span className="text-sm text-gray-500">: {feature.value}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
                <FiClock className="w-4 h-4" />
                {showHistory ? 'Hide' : 'Show'} Subscription History
            </button>
            {showHistory && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Change History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Change</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Previous</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">New</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Loading history...
                                        </td>
                                    </tr>
                                ) : history?.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No history records found
                                        </td>
                                    </tr>
                                ) : (
                                    history?.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(record.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {record.change_reason || 'Status Change'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {record.previous_status || record.previous_plan_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {record.new_status || record.new_plan_name || '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SubscriptionCurrent;